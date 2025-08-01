import { injectable, inject } from "tsyringe";
import { v4 as uuidv4 } from "uuid";
import { Wallet } from "../models/wallet.model";
import { Transaction, TransactionCursor } from "../models/transaction.model";
import { WalletRepository } from "../repositories/wallet.repository";
import { TransactionRepository } from "../repositories/transaction.repository";
import { ITransactionManager } from "../interfaces/repository.interface";
import Queue from "bull";
import { Knex } from "knex";

@injectable()
export class WalletService {
  private transferQueue: Queue.Queue;

  constructor(
    @inject() private walletRepo: WalletRepository,
    @inject() private transactionRepo: TransactionRepository,
    @inject("TransactionManager")
    private transactionManager: ITransactionManager,
    @inject("Redis") private redis: any
  ) {
    this.transferQueue = new Queue("transfer-queue", { redis });
    this.setupQueueProcessor();
  }

  private setupQueueProcessor() {
    this.transferQueue.process(async (job) => {
      const { senderUserId, receiverAccountNo, amount, idempotencyKey } =
        job.data;
      return this.processTransfer(
        senderUserId,
        receiverAccountNo,
        amount,
        idempotencyKey
      );
    });
  }

  async createWallet(userId: string): Promise<Wallet> {
    return this.walletRepo.create({ userId, balance: 0, version: 0 });
  }

  async fundWallet(
    userId: string,
    amount: number,
    idempotencyKey: string
  ): Promise<Transaction> {
    await this.transactionManager.beginTransaction();
    try {
      const wallet = await this.walletRepo.findOne(
        { userId },
        this.transactionManager
      );
      if (!wallet) throw new Error("Wallet not found");
      if (amount <= 0) throw new Error("Amount must be positive");

      const oldBalance = wallet.balance;
      const newBalance = oldBalance + amount;

      await this.walletRepo.update(
        wallet.id,
        { balance: newBalance, version: wallet.version },
        this.transactionManager
      );

      const transaction = await this.transactionRepo.create(
        {
          id: uuidv4(),
          receiverWalletId: wallet.id,
          amount,
          type: "FUND",
          status: "COMPLETED",
          reference: idempotencyKey,
          description: `Fund wallet with ${amount} kobo`,
        },
        this.transactionManager
      );

      await this.transactionRepo.createAuditLog(
        {
          id: uuidv4(),
          walletId: wallet.id,
          oldBalance,
          newBalance,
          transactionId: transaction.id,
        },
        this.transactionManager
      );

      await this.transactionManager.commitTransaction();
      return transaction;
    } catch (error) {
      await this.transactionManager.rollbackTransaction();
      throw error;
    }
  }

  async queueTransfer(
    senderUserId: string,
    receiverAccountNo: string,
    amount: number,
    idempotencyKey: string
  ): Promise<{ jobId: string }> {
    const job = await this.transferQueue.add(
      { senderUserId, receiverAccountNo, amount, idempotencyKey },
      {
        jobId: idempotencyKey,
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
      }
    );
    return { jobId: job.id as string };
  }

  async processTransfer(
    senderUserId: string,
    receiverAccountNo: string,
    amount: number,
    idempotencyKey: string
  ): Promise<Transaction> {
    await this.transactionManager.beginTransaction();
    try {
      const senderWallet = await this.walletRepo.findOne(
        { userId: senderUserId },
        this.transactionManager
      );
      const receiverWallet = await this.walletRepo.findByAccountNo(
        receiverAccountNo,
        this.transactionManager
      );

      if (!senderWallet || !receiverWallet) throw new Error("Wallet not found");
      if (senderWallet.balance < amount) throw new Error("Insufficient funds");
      if (amount <= 0) throw new Error("Amount must be positive");

      const senderOldBalance = senderWallet.balance;
      const receiverOldBalance = receiverWallet.balance;

      const senderRowsAffected = await (
        this.transactionManager.getQueryRunner() as Knex.Transaction
      )("wallets")
        .where({ id: senderWallet.id, version: senderWallet.version })
        .update({
          balance: senderOldBalance - amount,
          version: senderWallet.version + 1,
        });

      if (senderRowsAffected === 0)
        throw new Error("Concurrency conflict detected");

      await this.walletRepo.update(
        receiverWallet.id,
        {
          balance: receiverOldBalance + amount,
          version: receiverWallet.version,
        },
        this.transactionManager
      );

      const transaction = await this.transactionRepo.create(
        {
          id: uuidv4(),
          senderWalletId: senderWallet.id,
          receiverWalletId: receiverWallet.id,
          amount,
          type: "TRANSFER",
          status: "COMPLETED",
          reference: idempotencyKey,
          description: `Transfer ${amount} kobo to ${receiverAccountNo}`,
        },
        this.transactionManager
      );

      await this.transactionRepo.createAuditLog(
        {
          id: uuidv4(),
          walletId: senderWallet.id,
          oldBalance: senderOldBalance,
          newBalance: senderOldBalance - amount,
          transactionId: transaction.id,
        },
        this.transactionManager
      );

      await this.transactionRepo.createAuditLog(
        {
          id: uuidv4(),
          walletId: receiverWallet.id,
          oldBalance: receiverOldBalance,
          newBalance: receiverOldBalance + amount,
          transactionId: transaction.id,
        },
        this.transactionManager
      );

      await this.transactionManager.commitTransaction();
      return transaction;
    } catch (error) {
      await this.transactionManager.rollbackTransaction();
      throw error;
    }
  }

  async withdraw(
    userId: string,
    amount: number,
    idempotencyKey: string
  ): Promise<Transaction> {
    await this.transactionManager.beginTransaction();
    try {
      const wallet = await this.walletRepo.findOne(
        { userId },
        this.transactionManager
      );
      if (!wallet) throw new Error("Wallet not found");
      if (wallet.balance < amount) throw new Error("Insufficient funds");
      if (amount <= 0) throw new Error("Amount must be positive");

      const oldBalance = wallet.balance;
      const newBalance = oldBalance - amount;

      const rowsAffected = await (
        this.transactionManager.getQueryRunner() as Knex.Transaction
      )("wallets")
        .where({ id: wallet.id, version: wallet.version })
        .update({ balance: newBalance, version: wallet.version + 1 });

      if (rowsAffected === 0) throw new Error("Concurrency conflict detected");

      const transaction = await this.transactionRepo.create(
        {
          id: uuidv4(),
          senderWalletId: wallet.id,
          amount,
          type: "WITHDRAW",
          status: "COMPLETED",
          reference: idempotencyKey,
          description: `Withdraw ${amount} kobo`,
        },
        this.transactionManager
      );

      await this.transactionRepo.createAuditLog(
        {
          id: uuidv4(),
          walletId: wallet.id,
          oldBalance,
          newBalance,
          transactionId: transaction.id,
        },
        this.transactionManager
      );

      await this.transactionManager.commitTransaction();
      return transaction;
    } catch (error) {
      await this.transactionManager.rollbackTransaction();
      throw error;
    }
  }
}

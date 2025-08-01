import { injectable, inject } from "tsyringe";
import {
  QUEUE_TRANSFER,
  TRANSACTION_MANAGER,
  TRANSACTION_SERVICE,
  WALLET_REPOSITORY,
  IDEMPOTENCY_REPOSITORY,
  WALLET_AUDIT_SERVICE,
} from "../utils/constants";
import { TransactionService } from "./transaction.service";
import { WalletRepository } from "../repositories/wallet-repository";
import { IdempotencyRepository } from "../repositories/idempotency.repository";
import { ITransactionManager } from "../interfaces/database/transactions.interface";
import {
  Transaction,
  TransactionStatus,
  TransactionTypes,
} from "../interfaces/transaction.interface";
import { ITransferQueue } from "../interfaces/queue/transfer.queue.interface";
import { BadRequestError, NotFoundError } from "../errors";
import { DecimalUtils } from "../utils/money";
import { TranAuditService } from "./transaction-audit.service";
import { Wallet } from "../interfaces/wallet.interface";
import { DefaultQueueConfig } from "../config/redis";

// Interface for Queue to make it mockable

@injectable()
export class WalletService {
  constructor(
    @inject(WALLET_REPOSITORY) private walletRepo: WalletRepository,
    @inject(TRANSACTION_SERVICE) private transactionSrv: TransactionService,
    @inject(WALLET_AUDIT_SERVICE) private tranAuditSrv: TranAuditService,
    @inject(TRANSACTION_MANAGER)
    private transactionManager: ITransactionManager,
    @inject(QUEUE_TRANSFER) private transferQueue: ITransferQueue,
    @inject(IDEMPOTENCY_REPOSITORY)
    private idempotencyRepo: IdempotencyRepository
  ) {
    this.setupQueueProcessor();
  }

  private setupQueueProcessor() {
    this.transferQueue.process(async (job) => {
      const { senderUserId, receiverAccountNo, amount, idempotencyKey, url } =
        job.data;
      return this.processTransfer(
        senderUserId,
        receiverAccountNo,
        amount,
        idempotencyKey,
        url
      );
    });
  }

  async getWallet(
    walletId: number,
    transaction?: ITransactionManager
  ): Promise<Wallet> {
    const wallet = await this.walletRepo.findOne({ id: walletId }, transaction);
    if (!wallet) throw new NotFoundError("Wallet not found");
    return wallet;
  }

  async fundWallet(
    walletId: number,
    amount: number,
    idempotencyKey: string,
    url: string
  ): Promise<Transaction> {
    await this.transactionManager.beginTransaction();
    try {
      const wallet = await this.getWallet(walletId, this.transactionManager);

      const oldBalance = wallet.balance;
      const newBalance = DecimalUtils.add(oldBalance, amount);

      await this.walletRepo.update(
        wallet.id!,
        { balance: newBalance },
        this.transactionManager
      );

      const transaction = await this.transactionSrv.createTransaction(
        {
          receiverWalletId: wallet.id,
          amount,
          type: TransactionTypes.fund,
          status: TransactionStatus.success,
          reference: idempotencyKey,
          description: `Fund wallet with ${amount} kobo`,
          completedAt: new Date(),
        },
        this.transactionManager
      );

      // create audit
      await this.tranAuditSrv.createAudit(
        {
          walletId: wallet.id!,
          oldBalance,
          newBalance,
          transactionId: transaction.id!,
        },
        this.transactionManager
      );

      await this.idempotencyRepo.saveResponse(idempotencyKey, url, transaction);

      await this.transactionManager.commitTransaction();
      return transaction;
    } catch (error) {
      await this.transactionManager.rollbackTransaction();
      throw error;
    }
  }

  async queueTransfer(
    senderWalletId: number,
    receiverWalletId: string,
    amount: number,
    idempotencyKey: string,
    url: string
  ): Promise<{ jobId: string }> {
    const job = await this.transferQueue.add(
      { senderWalletId, receiverWalletId, amount, idempotencyKey, url },
      {
        ...DefaultQueueConfig,
        jobId: idempotencyKey,
      }
    );
    return { jobId: job.id as string };
  }

  async processTransfer(
    senderWalletId: number,
    receiverWalletId: number,
    amount: number,
    idempotencyKey: string,
    url: string
  ): Promise<Transaction> {
    await this.transactionManager.beginTransaction();
    try {
      const [senderWallet, receiverWallet] = await Promise.all([
        this.getWallet(senderWalletId, this.transactionManager),
        this.getWallet(receiverWalletId, this.transactionManager),
      ]);

      if (!senderWallet || !receiverWallet)
        throw new NotFoundError("Wallet not found");
      if (senderWallet.balance < amount)
        throw new BadRequestError("Insufficient funds");

      const senderOldBalance = senderWallet.balance;
      const senderNewBalance = DecimalUtils.subtract(senderOldBalance, amount);

      const receiverOldBalance = receiverWallet.balance;
      const recieverNewBalance = DecimalUtils.add(receiverOldBalance, amount);

      //updating sender wallet
      await this.walletRepo.update(
        senderWallet.id!,
        { balance: senderNewBalance },
        this.transactionManager
      );

      //updating receiver wallet
      await this.walletRepo.update(
        receiverWallet.id!,
        { balance: recieverNewBalance },
        this.transactionManager
      );

      const transaction = await this.transactionSrv.createTransaction(
        {
          senderWalletId: senderWallet.id,
          receiverWalletId: receiverWallet.id,
          amount,
          type: TransactionTypes.transfer,
          status: TransactionStatus.success,
          reference: idempotencyKey,
          description: `Transfer ${amount} kobo to wallet id ${receiverWalletId}`,
        },
        this.transactionManager
      );

      await this.tranAuditSrv.createAudit(
        {
          walletId: senderWallet.id!,
          oldBalance: senderOldBalance,
          newBalance: senderNewBalance,
          transactionId: transaction.id!,
        },
        this.transactionManager
      );

      await this.tranAuditSrv.createAudit(
        {
          walletId: receiverWallet.id!,
          oldBalance: receiverOldBalance,
          newBalance: recieverNewBalance,
          transactionId: transaction.id!,
        },
        this.transactionManager
      );

      await this.idempotencyRepo.saveResponse(idempotencyKey, url, transaction);
      await this.transactionManager.commitTransaction();
      return transaction;
    } catch (error) {
      await this.transactionManager.rollbackTransaction();
      throw error;
    }
  }

  async withdraw(
    walletId: number,
    amount: number,
    idempotencyKey: string,
    url: string
  ): Promise<Transaction> {
    await this.transactionManager.beginTransaction();
    try {
      const wallet = await this.getWallet(walletId, this.transactionManager);
      if (wallet.balance < amount)
        throw new BadRequestError("Insufficient funds");
      if (amount <= 0) throw new BadRequestError("Amount must be positive");

      const oldBalance = wallet.balance;
      const newBalance = DecimalUtils.subtract(oldBalance, amount);

      await this.walletRepo.update(
        wallet.id!,
        { balance: newBalance },
        this.transactionManager
      );

      const transaction = await this.transactionSrv.createTransaction(
        {
          senderWalletId: wallet.id,
          amount,
          type: TransactionTypes.withdraw,
          status: TransactionStatus.success,
          reference: idempotencyKey,
          description: `Withdraw ${amount} kobo`,
        },
        this.transactionManager
      );

      await this.tranAuditSrv.createAudit(
        {
          walletId: wallet.id!,
          oldBalance,
          newBalance,
          transactionId: transaction.id!,
        },
        this.transactionManager
      );

      await this.idempotencyRepo.saveResponse(idempotencyKey, url, transaction);
      await this.transactionManager.commitTransaction();
      return transaction;
    } catch (error) {
      await this.transactionManager.rollbackTransaction();
      throw error;
    }
  }
}

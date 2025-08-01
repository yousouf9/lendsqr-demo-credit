import { injectable, inject } from "tsyringe";
import { TransactionModel } from "../models/transaction.model";

import { TRANSACTION_REPOSITORY } from "../utils/constants";
import { TransactionRepository } from "../repositories/transaction-repository";
import { Transaction } from "../interfaces/transaction.interface";
import { Cursor } from "../interfaces/cursor.interface";
import { IJWT } from "../interfaces/jwt.interface";
import { BadRequestError } from "../errors";

@injectable()
export class TransactionService {
  constructor(
    @inject(TRANSACTION_REPOSITORY)
    private transactionRepo: TransactionRepository
  ) {}

  async getTransaction(id: number): Promise<TransactionModel | null> {
    return this.transactionRepo.findById(id);
  }

  async getUserTransaction(
    id: number,
    user: IJWT
  ): Promise<TransactionModel | null> {
    const result = await this.transactionRepo.findBySenderIdOrReceiverId(
      id,
      user.walletId
    );
    if (!result) {
      throw new BadRequestError("Transaction not found");
    }

    return result;
  }
  async getUserTransactions(
    user: IJWT,
    cursor: Cursor,
    limit: number = 20
  ): Promise<Transaction[]> {
    console.log("Fecthed");

    return this.transactionRepo.findAll(
      {
        senderWalletId: user.walletId,
        receiverWalletId: user.walletId,
      },
      { limit, cursor }
    );
  }
}

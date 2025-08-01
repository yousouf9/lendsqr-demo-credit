import { Knex } from "knex";
import { IRepository } from "../interfaces/base-repository.interface";
import { Transaction } from "../interfaces/transaction.interface";
import { ITransactionManager } from "../interfaces/database/transactions.interface";
import { inject, injectable } from "tsyringe";
import { TABLES } from "../utils/tables";
import { Cursor } from "../interfaces/cursor.interface";
import { KNEX_DB_INSTANCE } from "../utils/constants";

@injectable()
export class TransactionRepository implements IRepository<Transaction> {
  constructor(@inject(KNEX_DB_INSTANCE) private readonly knex: Knex) {}

  async create(
    data: Partial<Transaction>,
    transaction?: ITransactionManager
  ): Promise<Transaction> {
    const query = transaction?.getQueryRunner() || this.knex;
    const [id] = await query(TABLES.transactions).insert(data);
    const tx = await query(TABLES.transactions).where({ id }).first();
    return tx;
  }

  async findById(
    id: number,
    transaction?: ITransactionManager
  ): Promise<Transaction | null> {
    const query = (transaction?.getQueryRunner() || this.knex)(
      TABLES.transactions
    );
    return query.where({ id }).first();
  }

  async findOne(
    criteria: Partial<Transaction>,
    transaction?: ITransactionManager
  ): Promise<Transaction | null> {
    const query = (transaction?.getQueryRunner() || this.knex)(
      TABLES.transactions
    );
    return query.where(criteria).first();
  }

  async findBySenderIdOrReceiverId(
    transactionId: number,
    walletId: number,
    transaction?: ITransactionManager
  ): Promise<Transaction | null> {
    const query = transaction?.getQueryRunner() || this.knex;

    return query(TABLES.transactions)
      .where("id", transactionId)
      .andWhere((qb: Knex.QueryBuilder) => {
        qb.where("senderWalletId", walletId).orWhere(
          "receiverWalletId",
          walletId
        );
      })
      .first();
  }

  async findAll(
    criteria: Partial<Transaction>,
    options?: { limit?: number; cursor: Cursor }
  ): Promise<Transaction[]> {
    const query = this.knex(TABLES.transactions);

    // Apply sender/receiver wallet filters
    if (criteria.senderWalletId || criteria.receiverWalletId) {
      const conditions: any[] = [];
      if (criteria.senderWalletId)
        conditions.push({ senderWalletId: criteria.senderWalletId });
      if (criteria.receiverWalletId)
        conditions.push({ receiverWalletId: criteria.receiverWalletId });
      query.where(function () {
        conditions.forEach((cond) => this.orWhere(cond));
      });
    }

    // Apply cursor-based pagination
    if (options?.cursor) {
      query.where(function () {
        this.where("createdAt", ">", options.cursor.createdAt).orWhere(
          function () {
            this.where("createdAt", "=", options.cursor.createdAt).andWhere(
              "id",
              ">",
              options.cursor.id
            );
          }
        );
      });
    }

    if (options?.limit) query.limit(options.limit);
    return query.orderBy([
      { column: "createdAt", order: "desc" },
      { column: "id", order: "desc" },
    ]);
  }

  async update(
    id: number,
    data: Partial<Transaction>,
    transaction?: ITransactionManager
  ): Promise<void> {
    const query = (transaction?.getQueryRunner() || this.knex)(
      TABLES.transactions
    );
    await query.where({ id }).update(data);
  }
}

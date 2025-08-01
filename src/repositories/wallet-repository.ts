import { Knex } from "knex";
import { WalletModel } from "../models/wallet.model";
import { inject, injectable } from "tsyringe";
import { IRepository } from "../interfaces/base-repository.interface";
import { ITransactionManager } from "../interfaces/database/transactions.interface";
import { TABLES } from "../utils/tables";
import { Cursor } from "../interfaces/cursor.interface";
import { KNEX_DB_INSTANCE } from "../utils/constants";

@injectable()
export class WalletRepository implements IRepository<WalletModel> {
  constructor(@inject(KNEX_DB_INSTANCE) private readonly knex: Knex) {}

  async create(
    data: Partial<WalletModel>,
    transaction?: ITransactionManager
  ): Promise<WalletModel> {
    const query = transaction?.getQueryRunner() || this.knex;
    const [id] = await query(TABLES.wallets).insert(data);
    const wallet = await query(TABLES.wallets).where({ id }).first();
    return wallet;
  }

  async findById(
    id: number,
    transaction?: ITransactionManager
  ): Promise<WalletModel | null> {
    const query = (transaction?.getQueryRunner() || this.knex)(TABLES.wallets);
    return query.where({ id }).select("*").forUpdate().first();
  }

  async findOne(
    criteria: Partial<WalletModel>,
    transaction?: ITransactionManager
  ): Promise<WalletModel | null> {
    const query = (transaction?.getQueryRunner() || this.knex)(TABLES.wallets);
    return query.where(criteria).select("*").forUpdate().first();
  }

  async findByAccount(
    userId: string,
    transaction?: ITransactionManager
  ): Promise<WalletModel | null> {
    const query = (transaction?.getQueryRunner() || this.knex)(TABLES.wallets)
      .join(TABLES.users, `${TABLES.wallets}.userId`, `${TABLES.users}.id`)
      .where({ "users.id": userId });
    return query.select("wallets.*").forUpdate().first();
  }

  async findAll(
    criteria: Partial<WalletModel>,
    options?: { limit?: number; cursor?: Cursor }
  ): Promise<WalletModel[]> {
    const query = this.knex(TABLES.wallets).where(criteria);
    if (options?.limit) query.limit(options.limit);
    if (options?.cursor) query.where("createdAt", ">", options.cursor);
    return query;
  }

  async update(
    id: number,
    data: Partial<WalletModel>,
    transaction?: ITransactionManager
  ): Promise<void> {
    const query = (transaction?.getQueryRunner() || this.knex)(TABLES.wallets);
    await query.where({ id }).update({
      ...data,
    });
  }
}

import { Knex, knex } from "knex";
import { ITransactionManager } from "../interfaces/database/transactions.interface";
import { appVeriable } from "./veriables";
import { KNEX_DB_INSTANCE } from "../utils/constants";
import { inject, injectable } from "tsyringe";

export const knexConfig: Knex.Config = appVeriable.getKnexConfig();

export const db: Knex = knex(knexConfig);

@injectable()
export class KnexTransactionManager implements ITransactionManager {
  private trx: Knex.Transaction | null = null;

  constructor(@inject(KNEX_DB_INSTANCE) private readonly knex: Knex) {}

  async beginTransaction(): Promise<void> {
    this.trx = await this.knex.transaction();
  }

  async commitTransaction(): Promise<void> {
    if (this.trx) await this.trx.commit();
  }

  async rollbackTransaction(): Promise<void> {
    if (this.trx) await this.trx.rollback();
  }

  getQueryRunner(): Knex.Transaction {
    if (!this.trx) throw new Error("Transaction not started");
    return this.trx;
  }
}

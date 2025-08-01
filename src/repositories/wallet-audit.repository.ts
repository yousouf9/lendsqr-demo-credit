import { Knex } from "knex";
import { IRepository } from "../interfaces/base-repository.interface";
import { WalletAudit } from "../interfaces/wallet-audit.interface";
import { inject, injectable } from "tsyringe";
import { TABLES } from "../utils/tables";
import { ITransactionManager } from "../interfaces/database/transactions.interface";
import { Cursor } from "../interfaces/cursor.interface";
import { KNEX_DB_INSTANCE } from "../utils/constants";

@injectable()
export class WalletAuditRepository implements IRepository<WalletAudit> {
  constructor(@inject(KNEX_DB_INSTANCE) private readonly knex: Knex) {}
  async create(
    data: Partial<WalletAudit>,
    transaction?: ITransactionManager
  ): Promise<WalletAudit> {
    const query = transaction?.getQueryRunner() || this.knex;
    const [id] = await query(TABLES.wallet_audits).insert(data);
    const WalletAudit = await query(TABLES.wallet_audits).where({ id }).first();
    return WalletAudit;
  }
  findById(
    id: number,
    transaction?: ITransactionManager
  ): Promise<WalletAudit | null> {
    throw new Error("Method not implemented.");
  }
  findOne(
    criteria: Partial<WalletAudit>,
    transaction?: ITransactionManager
  ): Promise<WalletAudit | null> {
    throw new Error("Method not implemented.");
  }
  findAll(
    criteria: Partial<WalletAudit>,
    options?: { limit?: number; cursor?: Cursor }
  ): Promise<WalletAudit[]> {
    throw new Error("Method not implemented.");
  }
  update(
    id: number,
    data: Partial<WalletAudit>,
    transaction?: ITransactionManager
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

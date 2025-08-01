import { Knex } from "knex";
import { inject, injectable } from "tsyringe";
import { AuthModel } from "../models/auth.model";
import { IRepository } from "../interfaces/base-repository.interface";
import { ITransactionManager } from "../interfaces/database/transactions.interface";
import { TABLES } from "../utils/tables";
import { Auth } from "../interfaces/auth.interface";
import { Cursor } from "../interfaces/cursor.interface";
import { KNEX_DB_INSTANCE } from "../utils/constants";

@injectable()
export class AuthRepository implements IRepository<AuthModel> {
  constructor(@inject(KNEX_DB_INSTANCE) private readonly knex: Knex) {}

  async create(
    data: Partial<AuthModel>,
    transaction?: ITransactionManager
  ): Promise<AuthModel> {
    const query = transaction?.getQueryRunner() || this.knex;
    const [id] = await query(TABLES.auth).insert(data);
    const auth = await query(TABLES.auth).where({ id }).first();
    return auth;
  }

  async findOne(
    criteria: Partial<AuthModel>,
    transaction?: ITransactionManager
  ): Promise<AuthModel | null> {
    const query = (transaction?.getQueryRunner() || this.knex)(TABLES.auth);
    return query.where(criteria).first();
  }

  async findById(
    userId: number,
    transaction?: ITransactionManager
  ): Promise<AuthModel | null> {
    const query = (transaction?.getQueryRunner() || this.knex)(TABLES.auth);
    return query.where({ userId }).first();
  }

  async update(
    id: number,
    data: Partial<AuthModel>,
    transaction?: ITransactionManager
  ): Promise<void> {
    const query = (transaction?.getQueryRunner() || this.knex)(TABLES.auth);
    await query.where({ id }).update({
      ...data,
    });
  }

  async findAuthWithUserByIdentifier(
    identifier: string,
    provider: "password",
    transaction?: ITransactionManager
  ): Promise<{
    authId: number;
    passwordHash: string;
    userId: number;
    walletId: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  } | null> {
    const query = (transaction?.getQueryRunner() || this.knex)(TABLES.auth)
      .join(`${TABLES.users} as u`, `${TABLES.auth}.userId`, "u.id")
      .join(TABLES.wallets, `${TABLES.wallets}.userId`, "u.id")
      .where({
        "auths.provider": provider,
        "auths.identifier": identifier.toLowerCase(),
      })
      .select(
        "auths.id as authId",
        "auths.passwordHash",
        "u.id as userId",
        "u.firstName",
        "u.lastName",
        "u.email",
        "u.phoneNumber",
        "wallets.id as walletId"
      )
      .first();

    return query;
  }

  findAll(
    criteria: Partial<Auth>,
    options?: { limit?: number; cursor?: Cursor }
  ): Promise<Auth[]> {
    throw new Error("Method not implemented.");
  }
}

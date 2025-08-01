import { Knex } from "knex";
import { inject, injectable } from "tsyringe";
import { UserModel } from "../models/user.model";
import { IRepository } from "../interfaces/base-repository.interface";
import { ITransactionManager } from "../interfaces/database/transactions.interface";
import { TABLES } from "../utils/tables";
import { Cursor } from "../interfaces/cursor.interface";
import { KNEX_DB_INSTANCE } from "../utils/constants";

@injectable()
export class UserRepository implements IRepository<UserModel> {
  constructor(@inject(KNEX_DB_INSTANCE) private readonly knex: Knex) {}

  async create(
    data: Partial<UserModel>,
    transaction?: ITransactionManager
  ): Promise<UserModel> {
    const query = transaction?.getQueryRunner() || this.knex;
    const [id] = await query(TABLES.users).insert(data);
    const user = await query(TABLES.users).where({ id }).first();
    return user;
  }

  async findById(
    id: number,
    transaction?: ITransactionManager
  ): Promise<UserModel | null> {
    const query = (transaction?.getQueryRunner() || this.knex)(TABLES.users);
    return query.where({ id }).first();
  }

  async findOne(
    criteria: Partial<UserModel>,
    transaction?: ITransactionManager
  ): Promise<UserModel | null> {
    const query = (transaction?.getQueryRunner() || this.knex)(TABLES.users);
    return query.where(criteria).first();
  }

  async findAll(
    criteria: Partial<UserModel>,
    options?: { limit?: number; cursor: Cursor }
  ): Promise<UserModel[]> {
    const query = this.knex(TABLES.users).where(criteria);

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

    return query;
  }

  async update(
    id: number,
    data: Partial<UserModel>,
    transaction?: ITransactionManager
  ): Promise<void> {
    const query = (transaction?.getQueryRunner() || this.knex)(TABLES.users);
    await query.where({ id }).update(data);
  }
}

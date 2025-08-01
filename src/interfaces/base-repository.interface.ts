import { Cursor } from "./cursor.interface";
import { ITransactionManager } from "./database/transactions.interface";

export interface IRepository<T> {
  create(data: Partial<T>, transaction?: ITransactionManager): Promise<T>;
  findById(id: number, transaction?: ITransactionManager): Promise<T | null>;
  findOne(
    criteria: Partial<T>,
    transaction?: ITransactionManager
  ): Promise<T | null>;
  findAll(
    criteria: Partial<T>,
    options?: { limit?: number; cursor?: Cursor }
  ): Promise<T[]>;
  update(
    id: number,
    data: Partial<T>,
    transaction?: ITransactionManager
  ): Promise<void>;
}

import Redis from "ioredis";
import { inject, injectable } from "tsyringe";
import { Knex } from "knex";
import { TABLES } from "../utils/tables";
import { KNEX_DB_INSTANCE, REDIS_CLIENT } from "../utils/constants";
import { TransactionStatus } from "../interfaces/transaction.interface";

@injectable()
export class IdempotencyRepository {
  constructor(
    @inject(REDIS_CLIENT) private redis: Redis,
    @inject(KNEX_DB_INSTANCE) private readonly knex: Knex
  ) {}

  async checkAndLock(
    key: string,
    requestId: string,
    userId: number,
    ttl: number = 86400
  ): Promise<{ exists: boolean; response?: any }> {
    const redisKey = `idempotency:${key}:${requestId}:${userId}`;
    const lockKey = `lock:idempotency:${key}:${requestId}:${userId}`;

    const lock = await this.redis.set(lockKey, "locked", "PX", 30000, "NX");
    if (!lock) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.checkAndLock(key, requestId, userId, ttl);
    }

    try {
      const existing = await this.redis.get(redisKey);
      if (existing) {
        const record = await this.knex(TABLES.idempotencyKeys)
          .where({ key, requestId, userId })
          .first();

        return {
          exists: true,
          response: record?.response ? record.response : null,
        };
      }

      await this.knex(TABLES.idempotencyKeys).insert({
        key,
        requestId,
        userId,
      });

      await this.redis.set(
        redisKey,
        JSON.stringify({ status: TransactionStatus.pending }),
        "EX",
        ttl
      );
      return { exists: false };
    } finally {
      await this.redis.del(lockKey);
    }
  }

  async saveResponse(
    key: string,
    requestId: string,
    response: any
  ): Promise<void> {
    const redisKey = `idempotency:${key}:${requestId}`;
    await this.knex(TABLES.idempotencyKeys)
      .where({ key, requestId })
      .update({ response: JSON.stringify(response) });
    await this.redis.set(redisKey, JSON.stringify(response), "EX", 86400);
  }
}

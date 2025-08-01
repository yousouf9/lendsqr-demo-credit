import Redis from "ioredis";
import { inject, injectable } from "tsyringe";
import { Knex } from "knex";
import { TABLES } from "../utils/tables";
import { KNEX_DB_INSTANCE } from "../utils/constants";

@injectable()
export class IdempotencyRepository {
  constructor(
    private redis: Redis,
    @inject(KNEX_DB_INSTANCE) private readonly knex: Knex
  ) {}

  async checkAndLock(
    key: string,
    requestId: string,
    ttl: number = 86400
  ): Promise<{ exists: boolean; response?: any }> {
    const redisKey = `idempotency:${key}`;
    const existing = await this.redis.get(redisKey);
    if (existing) {
      const record = await this.knex(TABLES.idempotencyKeys)
        .where({ key })
        .first();
      return { exists: true, response: record?.response };
    }

    await this.redis.set(redisKey, requestId, "EX", ttl);
    await this.knex(TABLES.idempotencyKeys).insert({
      key,
      requestId,
    });
    return { exists: false };
  }

  async saveResponse(key: string, response: any): Promise<void> {
    await this.knex(TABLES.idempotencyKeys)
      .where({ key })
      .update({ response: JSON.stringify(response) });
    await this.redis.set(
      `idempotency:${key}`,
      JSON.stringify(response),
      "EX",
      86400
    );
  }
}

import { JobOptions } from "bull";
import Redis from "ioredis";
import { appVeriable } from "./veriables";

export const redisConfig = appVeriable.getRedisConfig();

export const redis = new Redis(redisConfig);

export const DefaultQueueConfig: JobOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
};

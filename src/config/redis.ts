import { JobOptions } from "bull";
import Redis from "ioredis";

export const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
};

export const redis = new Redis(redisConfig);

export const DefaultQueueConfig: JobOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 1000 },
};

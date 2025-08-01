import { appVeriable } from "../config/veriables";
import { KarmaService } from "../services/validation/karma-validation.service";

export const KNEX_DB_INSTANCE = "KnexDbInstance";

//Repositories
export const WALLET_REPOSITORY = "WalletRepository";
export const TRANSACTION_REPOSITORY = "TransactionRepository";
export const USER_REPOSITORY = "UserRepository";
export const IDEMPOTENCY_REPOSITORY = "IdempotencyRepository";
export const AUTH_REPOSITORY = "AuthRepository";
export const WALLET_AUDIT_REPOSITORY = "WalletAuditRepository";

//Services
export const WALLET_SERVICE = "WalletService";
export const TRANSACTION_SERVICE = "TransactionService";
export const USER_SERVICE = "UserService";
export const IDEMPOTENCY_SERVICE = "IdempotencyService";
export const KARMA_SERVICE = "KarmaService";
export const VALIDATION_SERVICE = "ValidationService";
export const AUTH_SERVICE = "AuthService";
export const WALLET_AUDIT_SERVICE = "WalletAuditService";

//Managers
export const TRANSACTION_MANAGER = "TransactionManager";

//Redis
export const REDIS_CLIENT = "RedisClient";

//Queues
export const QUEUE_TRANSFER = "transfer-queue";
export const QUEUE_FUND = "fund-queue";
export const QUEUE_WITHDRAWAL = "withdrawal-queue";

export const QUEUE_PROCESSING_CONCURRENCY = 1; // Number of concurrent jobs to process in queues

//VENDORS
export const VALIDATION_VENDOR = "ValidationVendor";

// validation vendors
export const ValidationVendors = {
  karma: () =>
    new KarmaService(
      appVeriable.getAdjutorApiKey(),
      appVeriable.getAdjutorApiUrl()
    ),
};

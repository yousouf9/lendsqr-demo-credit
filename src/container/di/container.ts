import "reflect-metadata";
import { container } from "tsyringe";
import {
  VALIDATION_VENDOR,
  ValidationVendors,
  VALIDATION_SERVICE,
  USER_REPOSITORY,
  KNEX_DB_INSTANCE,
  AUTH_REPOSITORY,
  USER_SERVICE,
  AUTH_SERVICE,
  TRANSACTION_MANAGER,
  WALLET_REPOSITORY,
  TRANSACTION_REPOSITORY,
  TRANSACTION_SERVICE,
} from "../../utils/constants";
import { ValidationVendor } from "../../services/validation/vendor.abstract";
import { ValidationService } from "../../services/validation.service";
import { UserRepository } from "../../repositories/user-repository";
import { Knex } from "knex";
import { db, KnexTransactionManager } from "../../config/database";
import { AuthRepository } from "../../repositories/auth.repository";
import { UserService } from "../../services/user.service";
import { AuthService } from "../../services/auth/auth.service";
import { WalletRepository } from "../../repositories/wallet-repository";
import { TransactionRepository } from "../../repositories/transaction-repository";
import { TransactionService } from "../../services/transaction.service";

//DB
container.registerInstance<Knex>(KNEX_DB_INSTANCE, db);

// REPOSITORIE
container.registerSingleton<AuthRepository>(AUTH_REPOSITORY, AuthRepository);

container.registerSingleton<UserRepository>(USER_REPOSITORY, UserRepository);

container.registerSingleton<WalletRepository>(
  WALLET_REPOSITORY,
  WalletRepository
);

container.registerSingleton<TransactionRepository>(
  TRANSACTION_REPOSITORY,
  TransactionRepository
);

// SERVICES
container.registerSingleton<UserService>(USER_SERVICE, UserService);
container.registerSingleton<AuthService>(AUTH_SERVICE, AuthService);
container.registerSingleton<TransactionService>(
  TRANSACTION_SERVICE,
  TransactionService
);

//Validtion
container.register<ValidationVendor>(VALIDATION_VENDOR, {
  useFactory: () => {
    const vendorKey = process.env
      .VALIDATION_VENDOR as keyof typeof ValidationVendors;
    const vendorFactory = ValidationVendors[vendorKey];

    if (!vendorFactory) {
      throw new Error(`Invalid validator vendor key: ${vendorKey}`);
    }

    return vendorFactory();
  },
});

//TRANSACTION MANAGER
container.registerSingleton<KnexTransactionManager>(
  TRANSACTION_MANAGER,
  KnexTransactionManager
);

// Register ValidationService
container.registerSingleton<ValidationService>(
  VALIDATION_SERVICE,
  ValidationService
);

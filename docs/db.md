# 🧾 Database Schema Documentation

This document describes the database schema used in this application. The system is designed for user authentication, wallet management, transaction processing, audit logging, and safe idempotent operations.

---

## 📘 Tables Overview

- [`users`](#users)
- [`wallets`](#wallets)
- [`auths`](#auths)
- [`idempotency_keys`](#idempotency_keys)
- [`transactions`](#transactions)
- [`wallet_audits`](#wallet_audits)

---

## 🧑‍💼 users

Stores personal and contact information for each user.

| Field         | Type         | Constraints                         | Description            |
| ------------- | ------------ | ----------------------------------- | ---------------------- |
| `id`          | integer      | PK, AUTO_INCREMENT, UNIQUE          | Primary user ID        |
| `firstName`   | varchar(50)  | NOT NULL                            | User's first name      |
| `lastName`    | varchar(50)  | NOT NULL                            | User's last name       |
| `middleName`  | varchar(50)  | NULLABLE                            | Optional middle name   |
| `email`       | varchar(250) | UNIQUE, NOT NULL                    | User's email           |
| `phoneNumber` | varchar(15)  | UNIQUE, NOT NULL                    | User's phone number    |
| `createdAt`   | datetime     | DEFAULT CURRENT_TIMESTAMP           | Creation timestamp     |
| `updatedAt`   | datetime     | NULLABLE, DEFAULT CURRENT_TIMESTAMP | Last updated timestamp |

---

## 💰 wallets

Each user is assigned a wallet to store their balance and process transactions.

| Field       | Type     | Constraints                         | Description                   |
| ----------- | -------- | ----------------------------------- | ----------------------------- |
| `id`        | integer  | PK, AUTO_INCREMENT, UNIQUE          | Wallet ID                     |
| `userId`    | integer  | FK → users.id, NOT NULL             | Owner of the wallet           |
| `balance`   | bigint   | DEFAULT 0                           | Wallet balance in minor units |
| `createdAt` | datetime | DEFAULT CURRENT_TIMESTAMP           | When the wallet was created   |
| `updatedAt` | datetime | NULLABLE, DEFAULT CURRENT_TIMESTAMP | Last updated                  |

---

## 🔐 auths

Handles login credentials and authentication providers.

| Field          | Type        | Constraints                         | Description                      |
| -------------- | ----------- | ----------------------------------- | -------------------------------- |
| `id`           | integer     | PK, AUTO_INCREMENT, UNIQUE          | Auth record ID                   |
| `userId`       | integer     | UNIQUE, FK → users.id               | Linked user                      |
| `provider`     | varchar(20) | NOT NULL                            | Auth provider (e.g., 'password') |
| `identifier`   | varchar(50) | UNIQUE, NOT NULL                    | Login identifier or email        |
| `passowrdHash` | text        | NOT NULL                            | Hashed password (if local)       |
| `createdAt`    | datetime    | DEFAULT CURRENT_TIMESTAMP           | Created timestamp                |
| `updatedAt`    | datetime    | NULLABLE, DEFAULT CURRENT_TIMESTAMP | Updated timestamp                |

---

## 🔁 idempotency_keys

Supports safe, idempotent request processing to avoid duplication.

| Field       | Type        | Constraints                         | Description                          |
| ----------- | ----------- | ----------------------------------- | ------------------------------------ |
| `id`        | integer     | PK, AUTO_INCREMENT, UNIQUE          | Key ID                               |
| `key`       | varchar(36) | UNIQUE, NOT NULL                    | Idempotency UUID from client         |
| `userId`    | integer     | FK → users.id, NULLABLE             | Associated user                      |
| `requestId` | varchar(36) | NOT NULL                            | Request UUID                         |
| `response`  | JSON        | NOT NULL                            | Stored response to replay if retried |
| `createdAt` | datetime    | DEFAULT CURRENT_TIMESTAMP           | Timestamp of key creation            |
| `updatedAt` | datetime    | NULLABLE, DEFAULT CURRENT_TIMESTAMP | Last updated                         |

---

## 💸 transactions

Logs financial transactions between wallets with detailed status tracking.

| Field              | Type        | Constraints                         | Description                                                                                                                                          |
| ------------------ | ----------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | integer     | PK, AUTO_INCREMENT, UNIQUE          | Transaction ID                                                                                                                                       |
| `senderWalletId`   | integer     | FK → wallets.id, NULLABLE           | Sending wallet, Nullable FK to Wallets(id): NULL if platform is funding the walletNullable FK to Wallets(id): NULL if platform is funding the wallet |
| `receiverWalletId` | integer     | FK → wallets.id, NULLABLE           | Receiving wallet, Nullable FK to Wallets(id) : NULL if platform is receiving (withdrawal)                                                            |
| `amount`           | bigint      | DEFAULT 0                           | Transaction amount (minor units)                                                                                                                     |
| `reference`        | varchar(36) | UNIQUE, NOT NULL                    | Reference ID                                                                                                                                         |
| `description`      | text        | NULLABLE                            | Transaction description                                                                                                                              |
| `status`           | tinyint     | DEFAULT 1                           | 1 = Pending, 0 = success, 2 = failed, etc.                                                                                                           |
| `type`             | tinyint     | NOT NULL                            | Type: 0 = fund, 1 = transfer, 2 = withdraw, etc.                                                                                                     |
| `completed`        | datetime    | NULLABLE                            | Completion timestamp                                                                                                                                 |
| `reason`           | text        | NULLABLE                            | Failure reason if any                                                                                                                                |
| `createdAt`        | datetime    | DEFAULT CURRENT_TIMESTAMP           | Creation timestamp                                                                                                                                   |
| `updatedAt`        | datetime    | NULLABLE, DEFAULT CURRENT_TIMESTAMP | Last updated                                                                                                                                         |

---

## 🧾 wallet_audits

Logs changes in wallet balances for traceability and rollback purposes.

| Field           | Type     | Constraints                         | Description                |
| --------------- | -------- | ----------------------------------- | -------------------------- |
| `id`            | integer  | PK, AUTO_INCREMENT, UNIQUE          | Audit entry ID             |
| `walletId`      | integer  | FK → wallets.id, NOT NULL           | Audited wallet             |
| `oldBalance`    | bigint   | NOT NULL                            | Balance before transaction |
| `newBalance`    | bigint   | NOT NULL                            | Balance after transaction  |
| `transactionId` | integer  | FK → transactions.id, NOT NULL      | Related transaction        |
| `createdAt`     | datetime | DEFAULT CURRENT_TIMESTAMP           | Timestamp of audit         |
| `updateAt`      | datetime | NULLABLE, DEFAULT CURRENT_TIMESTAMP | Timestamp of last update   |

---

## ✅ Notes

- All datetime fields are auto-populated with `CURRENT_TIMESTAMP`.
- All monetary values are stored in **minor units** (e.g., kobo or cents) for precision.
- `wallet_audits` and `idempotency_keys` are vital for financial accuracy and request safety.

---

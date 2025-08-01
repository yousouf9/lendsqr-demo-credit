Demo Credit Wallet Service
Overview
This is an MVP wallet service for Demo Credit, a mobile lending app, built with NodeJS, TypeScript, MySQL, KnexJS, Redis, TypeDI, and Bull. It supports user account creation, wallet funding, transfers (queued for processing), withdrawals, and transaction history with cursor-based pagination, integrating with Lendsqr Adjutor for KYC blacklist checks.
Tech Stack

NodeJS (LTS): Backend runtime
TypeScript: Type safety
MySQL: Relational database
KnexJS: ORM for database operations
Redis: Idempotency and queueing (via Bull)
TypeDI: Dependency injection
Bull: Queueing for transfer processing
Express: API framework
Jest: Unit testing

Database Design
The schema ensures ACID compliance and concurrency control:

Users: Stores user details with a unique 10-digit account number.
Wallets: Manages balances in kobo with a version column for optimistic locking.
Transactions: Records fund, transfer, and withdrawal transactions.
Idempotency_Keys: Prevents duplicate requests using Redis.
Wallet_Audit: Logs balance changes.

ER Diagram
[Insert ER diagram from app.dbdesigner.net]
Architecture

SOLID Principles:
SRP: Each class handles one responsibility.
OCP: Interfaces allow extension.
LSP: Repositories implement interfaces consistently.
ISP: Specific interfaces for each repository/service.
DIP: TypeDI for dependency injection.

Concurrency Control: Uses SELECT ... FOR UPDATE and optimistic locking (version column).
Queueing: Transfers are queued with Bull for asynchronous processing.
ORM Flexibility: Abstract repositories enable easy ORM switching.
Idempotency: Redis and database ensure duplicate request prevention.

API Endpoints

POST /users: Create a user with KYC validation.
POST /wallets/fund: Fund a wallet.
POST /wallets/transfer: Queue a transfer (returns job ID).
POST /wallets/withdraw: Withdraw funds.
GET /users/:userId/transactions: Fetch transactions with cursor pagination.
GET /transactions/:id: Get transaction details.

Pagination

Cursor-Based: Uses a composite cursor (createdAt and id) to handle timestamp collisions, ensuring accurate and stable pagination for transaction history.

Implementation: Transactions are ordered by createdAt DESC, id DESC, with cursors encoded as Base64 strings for API compatibility.

Setup

Clone: git clone <repo-url>
Install: npm install
Configure environment:DB_CLIENT=mysql2
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=democredit
DB_PORT=3306
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
ADJUTOR_API_KEY=<your-adjutor-key>

Run migrations: npm run migrate
Start server: npm run start
Start worker: npm run worker

Concurrency and Queueing

Concurrency: Uses database locks (FOR UPDATE) and optimistic locking (version column) to prevent race conditions.
Queueing: Transfers are processed asynchronously via Bull, ensuring sequential processing and retry on failure.

Testing
Run: npm run test
Deployment
Deployed on Heroku: https://<candidate-name>-lendsqr-be-test.herokuapp.com
Decisions

Bull Queue: Ensures reliable transfer processing with retries.
TypeDI: Enhances modularity and testability.
Optimistic Locking: Prevents concurrency issues efficiently.
Redis: Used for idempotency and queueing to reduce database load.

Future Improvements

Add rate limiting.
Implement JWT authentication.
Enhance monitoring for queue performance.

Video Review
[Insert Loom video link, max 3 minutes, face visible]

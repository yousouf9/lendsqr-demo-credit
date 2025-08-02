# 📂 Folder Structure

This project is a modular, scalable Node.js backend using TypeScript, Express.js, Tsyringe for DI, Knex.js for database access, and Bull for background jobs.

Here’s an overview of the source directory and what each folder does:

```bash
src/
├── config/ # General application configs (database, redis, transactions, knex )
├── container/ # Dependency injection setup (tsyringe)
├── controllers/ # HTTP request handlers
├── database/ # Knex migration, seeders
├── errors/ # Custom error classes and error handling logic
├── interfaces/ # TypeScript interfaces
├── middlewares/ # Express middleware (auth, error, logging)
├── models/ # Knex model definitions
├── repositories/ # Data access layer per domain, built on Knex
├── routes/ # API route definitions
├── services/ # Business logic and orchestration layer
├── startup/ # App initialization logic (Express bootstrapping, workers)
├── test/ # Unit and integration tests
├── utils/ # Helper functions, constants, formatters
├── app.ts # Express app creation and config
├── index.ts # Entry point (server bootstrap)
```

---

### ✅ How It All Comes Together

- **Express App** is configured in `app.ts` and launched via `index.ts`.
- **Dependency Injection** is centralized in `container/`, registering services, repos, jobs and other values.
- **Business Modules** are separated into clear domain folders: `services/`, `repositories/`, `controllers/`.
- **Testing** logic lives in `test/`, with potential for supertest.
- **Knex** handles migrations and seeds under `database/`.

---

import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("wallet_audits", (table) => {
    table.increments("id").primary();
    table
      .integer("walletId")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("wallets")
      .onDelete("CASCADE");
    table.bigInteger("oldBalance").notNullable();
    table.bigInteger("newBalance").notNullable();
    table
      .integer("transactionId")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("transactions")
      .onDelete("CASCADE");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table
      .timestamp("updatedAt")
      .defaultTo(knex.fn.now())
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("wallet_audits");
}

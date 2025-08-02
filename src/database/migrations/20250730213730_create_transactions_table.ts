import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("transactions", (table) => {
    table.increments("id").primary();
    table
      .integer("senderWalletId")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("wallets")
      .onDelete("CASCADE");
    table
      .integer("receiverWalletId")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("wallets")
      .onDelete("CASCADE");
    table.bigInteger("amount").notNullable();
    table.string("reference").unique().notNullable();
    table.text("description").nullable();
    table.text("reason").nullable(); // For failed transactions
    table.tinyint("status").defaultTo(1).notNullable(); // 0 = success, 1 = pending, 2 = failure
    table.tinyint("type").notNullable(); // 0 = fund, 1 = transfer, 2 = withdrawal
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("completedAt").nullable();
    table
      .timestamp("updatedAt")
      .defaultTo(knex.fn.now())
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("transactions");
}

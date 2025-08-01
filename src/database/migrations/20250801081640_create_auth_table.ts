import { Knex } from "knex";
import { TABLES } from "../../utils/tables";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLES.auth, (table) => {
    table.increments("id").primary();
    table
      .integer("userId")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable(TABLES.users)
      .onDelete("CASCADE");
    table.enum("provider", ["password"]).notNullable();
    table.string("identifier").notNullable();
    table.string("passwordHash").nullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table
      .timestamp("updatedAt")
      .defaultTo(knex.fn.now())
      .notNullable()
      .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    table.unique(["provider", "identifier"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TABLES.auth);
}

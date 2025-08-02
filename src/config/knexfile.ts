import "reflect-metadata";
import * as path from "path";
import { knexConfig } from "./database";

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  ...knexConfig,
  migrations: {
    directory: path.resolve(__dirname, "../database/migrations"),
    extension: "ts",
  },
};

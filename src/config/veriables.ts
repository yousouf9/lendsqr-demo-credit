import * as dotenv from "dotenv";
import { Knex } from "knex";
import * as path from "path";

//loading environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

class AppVeriable {
  constructor(private env: { [k: string]: string | undefined }) {}

  public nodeEnv = this.getValue("NODE_ENV", true);
  public isDev: boolean = this.nodeEnv === "development";
  public isStaging: boolean = this.nodeEnv === "staging";
  public isProduction: boolean = this.nodeEnv === "production";

  // get value of key from .env, else throw error
  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (value === undefined && throwOnMissing) {
      throw new Error(`Environment Error - missing env.${key}`);
    }

    if (!value) {
      return "";
    }
    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getJwt(): string {
    return this.getValue("JWT_SECRET");
  }

  public getJwtExpiryTime(): string {
    return this.getValue("JWT_EXPIRY_TIME");
  }
  public getAdjutorApiKey(): string {
    return this.getValue("ADJUTOR_API_KEY");
  }

  public getAdjutorApiUrl(): string {
    return this.getValue("ADJUTOR_API_URL");
  }

  public getValidationVendor(): string {
    return this.getValue("VALIDATION_VENDOR");
  }

  // Database related methods
  public getDbClient(): string {
    return this.getValue("DB_CLIENT");
  }

  public getDbHost(): string {
    return this.getValue("DB_HOST");
  }

  public getDbPort(): number {
    const port = this.getValue("DB_PORT");

    return parseInt(port, 10);
  }
  public getDbUser(): string {
    return this.getValue("DB_USER");
  }

  public getDbPassword(): string {
    return this.getValue("DB_PASSWORD");
  }

  public getDbName(): string {
    return this.getValue("DB_NAME");
  }
  public getKnexConfig(): Knex.Config {
    if (!this.isDev) {
      return {
        client: this.getDbClient(),
        connection: {
          host: this.getDbHost(),
          user: this.getDbUser(),
          password: this.getDbPassword(),
          database: this.getDbName(),
          port: this.getDbPort(),
          timezone: "Z",
        },
        pool: {
          min: 5,
          max: 10,
          afterCreate: (conn: any, done: any) => {
            conn.query("SET time_zone = '+00:00';", (err: any) => {
              done(err, conn);
            });
          },
        },
      };
    }

    return {
      client: this.getDbClient(),
      connection: {
        host: this.getDbHost(),
        user: this.getDbUser(),
        password: this.getDbPassword(),
        database: this.getDbName(),
        port: this.getDbPort(),
        timezone: "Z",
      },
      pool: {
        min: 1,
        max: 5,
        afterCreate: (conn: any, done: any) => {
          conn.query("SET time_zone = '+00:00';", (err: any) => {
            done(err, conn);
          });
        },
      },
    };
  }
  public getRedisHost(): string {
    return this.getValue("REDIS_HOST");
  }
  public getRedisUsername(): string {
    return this.getValue("REDIS_USERNAME");
  }
  public getRedisPort(): number {
    return parseInt(this.getValue("REDIS_PORT"), 10);
  }

  public getRedisPassword(): string {
    return this.getValue("REDIS_PASSWORD");
  }

  public getRedisConfig() {
    if (!this.isDev) {
      return {
        host: this.getRedisHost(),
        port: this.getRedisPort(),
        username: this.getRedisUsername(),
        password: this.getRedisPassword(),
        tls: {
          rejectUnauthorized: false,
          requestCert: true,
        },
      };
    }

    return {
      host: this.getRedisHost(),
      port: this.getRedisPort(),
    };
  }
}

// enusre the values exist in .env on app startup, else throw error
const appVeriable = new AppVeriable(process.env).ensureValues([
  // database related
  "DB_CLIENT",
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",

  // redis related

  "REDIS_USERNAME",
  "REDIS_PASSWORD",
  "REDIS_HOST",
  "REDIS_PORT",

  //Karma validation service related
  "ADJUTOR_API_KEY",
  "ADJUTOR_API_URL",

  // validation vendor
  "VALIDATION_VENDOR",
]);

export { appVeriable };

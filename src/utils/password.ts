import { scrypt, randomBytes } from "crypto";

import { promisify } from "util";

const scryptAsyn = promisify(scrypt);

export class Password {
  static async toHash(password: string): Promise<string> {
    const salt = randomBytes(8).toString("hex");
    const buff = (await scryptAsyn(password, salt, 64)) as Buffer;

    return `${buff.toString("hex")}.${salt}`;
  }

  static async compare(
    storedPassword: string,
    suppliedPassword: string
  ): Promise<boolean> {
    if (!storedPassword?.includes(".")) {
      throw new TypeError("Invalid stored password format.");
    }

    const [hashPassword, salt] = storedPassword.split(".");

    const buff = (await scryptAsyn(suppliedPassword, salt, 64)) as Buffer;

    return hashPassword === buff.toString("hex");
  }
}

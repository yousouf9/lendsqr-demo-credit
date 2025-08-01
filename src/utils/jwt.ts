import { promisify } from "util";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { appVeriable } from "../config/veriables";
import { IJWT } from "../interfaces/jwt.interface";
import { injectable } from "tsyringe";

const signAsync = promisify<
  string | Buffer | Object,
  Secret,
  SignOptions,
  string
>(jwt.sign);

const secret = appVeriable.getJwt();

export class JWT {
  static async getToken(
    data: IJWT,
    options: SignOptions = {}
  ): Promise<string> {
    return signAsync(data, secret, options);
  }

  static async verifyToken(token: string): Promise<IJWT> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, function (err: any, decoded: any) {
        if (err) reject(err);

        resolve(decoded as IJWT);
      });
    });
  }
}

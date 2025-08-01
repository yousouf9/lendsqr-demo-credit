import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { TRANSACTION_SERVICE } from "../utils/constants";
import { successResponse } from "../utils/response";
import { TransactionService } from "../services/transaction.service";
import { Cursor } from "../interfaces/cursor.interface";
import { BadRequestError } from "../errors";

@injectable()
export class TransactionController {
  constructor(
    @inject(TRANSACTION_SERVICE) private trnSrv: TransactionService
  ) {}
  public getTransaction = async (req: Request, res: Response) => {
    const id: number = parseInt(req.params.id, 10);
    const currentUser = req.currentUser!;
    console.log("Transaction", this.trnSrv.getUserTransactions);
    const result = await this.trnSrv.getUserTransaction(id, currentUser);
    res.json(successResponse(result, "Transaction fetched"));
  };
  public getTransactions = async (req: Request, res: Response) => {
    try {
      const currentUser = req.currentUser!;
      console.log(this.trnSrv);

      const { cursor, limit = "20" } = req.query;
      const parsedLimit = parseInt(limit as string);

      let decodedCursor: Cursor | undefined;
      if (cursor) {
        const decoded = this.decodeCursor(cursor as string);
        if (!decoded) {
          throw new BadRequestError("Invalid Cursor provided");
        }
        decodedCursor = decoded;
      }

      const transactions = await this.trnSrv.getUserTransactions(
        currentUser,
        decodedCursor!,
        parsedLimit
      );

      let nextCursor: string | null = null;
      if (transactions.length === parsedLimit && transactions.length > 0) {
        const lastTx = transactions[transactions.length - 1];
        nextCursor = this.encodeCursor({
          createdAt: lastTx?.createdAt?.toISOString()!,
          id: lastTx.id!,
        });
      }

      res.json(
        successResponse({ transactions, nextCursor }, "Transactions fetched")
      );
    } catch (error) {
      throw new BadRequestError("failed to fetch transactions");
    }
  };

  private encodeCursor(cursor: Cursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString("base64");
  }

  private decodeCursor(encoded: string): Cursor | null {
    try {
      const decoded = Buffer.from(encoded, "base64").toString("utf8");
      const cursor = JSON.parse(decoded) as Cursor;
      return { createdAt: cursor.createdAt, id: cursor.id };
    } catch {
      return null;
    }
  }
}

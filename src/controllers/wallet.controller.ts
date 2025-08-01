// import { Request, Response } from "express";
// import { Service, Inject } from "typedi";
// import { WalletService } from "../services/wallet.service";
// import { IdempotencyRepository } from "../repositories/idempotency.repository";
// import { TransactionCursor } from "../interfaces/transaction.interface";

// @Service()
// export class WalletController {
//   constructor(
//     @Inject() private walletService: WalletService,
//     @Inject() private idempotencyRepo: IdempotencyRepository
//   ) {}

//   private encodeCursor(cursor: TransactionCursor): string {
//     return Buffer.from(JSON.stringify(cursor)).toString("base64");
//   }

//   private decodeCursor(encoded: string): TransactionCursor | null {
//     try {
//       const decoded = Buffer.from(encoded, "base64").toString("utf8");
//       const cursor = JSON.parse(decoded) as TransactionCursor;
//       return { createdAt: cursor.createdAt, id: cursor.id };
//     } catch {
//       return null;
//     }
//   }

//   async fund(req: Request, res: Response) {
//     try {
//       const { userId, amount, idempotencyKey } = req.body;
//       const transaction = await this.walletService.fundWallet(
//         userId,
//         amount,
//         idempotencyKey
//       );
//       await this.idempotencyRepo.saveResponse(idempotencyKey, transaction);
//       res.status(201).json(transaction);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }

//   async transfer(req: Request, res: Response) {
//     try {
//       const { senderUserId, receiverAccountNo, amount, idempotencyKey } =
//         req.body;
//       const { jobId } = await this.walletService.queueTransfer(
//         senderUserId,
//         receiverAccountNo,
//         amount,
//         idempotencyKey
//       );
//       res
//         .status(202)
//         .json({ jobId, message: "Transfer queued for processing" });
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }

//   async withdraw(req: Request, res: Response) {
//     try {
//       const { userId, amount, idempotencyKey } = req.body;
//       const transaction = await this.walletService.withdraw(
//         userId,
//         amount,
//         idempotencyKey
//       );
//       await this.idempotencyRepo.saveResponse(idempotencyKey, transaction);
//       res.status(201).json(transaction);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }

//   async getUserTransactions(req: Request, res: Response) {
//     try {
//       const { userId } = req.params;
//       const { cursor, limit = "10" } = req.query;
//       const parsedLimit = parseInt(limit as string);

//       let decodedCursor: TransactionCursor | undefined;
//       if (cursor) {
//         const decoded = this.decodeCursor(cursor as string);
//         if (!decoded) return res.status(400).json({ error: "Invalid cursor" });
//         decodedCursor = decoded;
//       }

//       const transactions = await this.walletService.getUserTransactions(
//         userId,
//         decodedCursor,
//         parsedLimit
//       );

//       let nextCursor: string | null = null;
//       if (transactions.length === parsedLimit && transactions.length > 0) {
//         const lastTx = transactions[transactions.length - 1];
//         nextCursor = this.encodeCursor({
//           createdAt: lastTx.createdAt.toISOString(),
//           id: lastTx.id,
//         });
//       }

//       res.status(200).json({ transactions, nextCursor });
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }
// }

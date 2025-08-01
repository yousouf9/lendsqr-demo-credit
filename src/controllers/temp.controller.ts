// import express from "express";
// import { Container } from "typedi";
// import { UserService } from "./services/user.service";
// import { WalletService } from "./services/wallet.service";
// import { TransactionService } from "./services/transaction.service";
// import { IdempotencyMiddleware } from "./middleware/idempotency.middleware";
// import { TransactionCursor } from "./interfaces/transaction.interface";

// const app = express();
// app.use(express.json());

// const userService = Container.get(UserService);
// const walletService = Container.get(WalletService);
// const transactionService = Container.get(TransactionService);
// const idempotencyMiddleware = Container.get(IdempotencyMiddleware);

// const encodeCursor = (cursor: TransactionCursor): string => {
//   return Buffer.from(JSON.stringify(cursor)).toString("base64");
// };

// const decodeCursor = (encoded: string): TransactionCursor | null => {
//   try {
//     const decoded = Buffer.from(encoded, "base64").toString("utf8");
//     const cursor = JSON.parse(decoded) as TransactionCursor;
//     return { createdAt: cursor.createdAt, id: cursor.id };
//   } catch {
//     return null;
//   }
// };

// // Existing endpoints unchanged
// app.post("/users", async (req, res) => {
//   try {
//     const user = await userService.create(req.body);
//     res.status(201).json(user);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// app.post(
//   "/wallets/fund",
//   idempotencyMiddleware.check.bind(idempotencyMiddleware),
//   async (req, res) => {
//     try {
//       const { userId, amount, idempotencyKey } = req.body;
//       const transaction = await walletService.fundWallet(
//         userId,
//         amount,
//         idempotencyKey
//       );
//       await Container.get(IdempotencyRepository).saveResponse(
//         idempotencyKey,
//         transaction
//       );
//       res.status(201).json(transaction);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }
// );

// app.post(
//   "/wallets/transfer",
//   idempotencyMiddleware.check.bind(idempotencyMiddleware),
//   async (req, res) => {
//     try {
//       const { senderUserId, receiverAccountNo, amount, idempotencyKey } =
//         req.body;
//       const { jobId } = await walletService.queueTransfer(
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
// );

// app.post(
//   "/wallets/withdraw",
//   idempotencyMiddleware.check.bind(idempotencyMiddleware),
//   async (req, res) => {
//     try {
//       const { userId, amount, idempotencyKey } = req.body;
//       const transaction = await walletService.withdraw(
//         userId,
//         amount,
//         idempotencyKey
//       );
//       await Container.get(IdempotencyRepository).saveResponse(
//         idempotencyKey,
//         transaction
//       );
//       res.status(201).json(transaction);
//     } catch (error) {
//       res.status(400).json({ error: error.message });
//     }
//   }
// );

// app.get("/users/:userId/transactions", async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { cursor, limit = "10" } = req.query;
//     const parsedLimit = parseInt(limit as string);

//     let decodedCursor: TransactionCursor | undefined;
//     if (cursor) {
//       const decoded = decodeCursor(cursor as string);
//       if (!decoded) return res.status(400).json({ error: "Invalid cursor" });
//       decodedCursor = decoded;
//     }

//     const transactions = await walletService.getUserTransactions(
//       userId,
//       decodedCursor,
//       parsedLimit
//     );

//     let nextCursor: string | null = null;
//     if (transactions.length === parsedLimit && transactions.length > 0) {
//       const lastTx = transactions[transactions.length - 1];
//       nextCursor = encodeCursor({
//         createdAt: lastTx.createdAt.toISOString(),
//         id: lastTx.id,
//       });
//     }

//     res.status(200).json({ transactions, nextCursor });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// app.get("/transactions/:id", async (req, res) => {
//   try {
//     const transaction = await transactionService.getTransaction(req.params.id);
//     if (!transaction)
//       return res.status(404).json({ error: "Transaction not found" });
//     res.status(200).json(transaction);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// const PORT = process.env.PORT || 3000;
// // Initialize database (assuming this function exists from previous implementation)
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

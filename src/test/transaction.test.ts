// import { TransactionService } from "../services/transaction.service";
// import { TransactionRepository } from "../repositories/transaction.repository";
// import { KnexTransactionManager } from "../config/database";
// import { Container } from "typedi";

// describe("TransactionService", () => {
//   let transactionService: TransactionService;
//   let transactionRepo: TransactionRepository;
//   let transactionManager: KnexTransactionManager;

//   beforeEach(() => {
//     transactionRepo = {
//       findById: jest.fn(),
//       findAll: jest.fn(),
//     } as any;
//     transactionManager = {} as any;
//     Container.set(TransactionRepository, transactionRepo);
//     Container.set("TransactionManager", transactionManager);
//     transactionService = Container.get(TransactionService);
//   });

//   it("should get transaction by id", async () => {
//     const transaction = { id: "tx1", type: "FUND", status: "COMPLETED" };
//     jest.spyOn(transactionRepo, "findById").mockResolvedValue(transaction);

//     const result = await transactionService.getTransaction("tx1");
//     expect(result).toEqual(transaction);
//   });

//   it("should return null for non-existent transaction", async () => {
//     jest.spyOn(transactionRepo, "findById").mockResolvedValue(null);

//     const result = await transactionService.getTransaction("tx1");
//     expect(result).toBeNull();
//   });

//   it("should handle cursor-based pagination correctly", async () => {
//     const transactions = [
//       { id: "tx1", createdAt: new Date("2025-07-28T10:00:00Z"), type: "FUND" },
//       {
//         id: "tx2",
//         createdAt: new Date("2025-07-28T10:00:00Z"),
//         type: "TRANSFER",
//       },
//       {
//         id: "tx3",
//         createdAt: new Date("2025-07-28T09:00:00Z"),
//         type: "WITHDRAW",
//       },
//     ];
//     jest.spyOn(transactionRepo, "findAll").mockResolvedValue(transactions);

//     const result = await transactionRepo.findAll(
//       { senderWalletId: "wallet1" },
//       { limit: 2, cursor: { createdAt: "2025-07-28T10:00:00.000Z", id: "tx1" } }
//     );
//     expect(result).toEqual([transactions[1], transactions[2]]);
//     expect(transactionRepo.findAll).toHaveBeenCalledWith(
//       { senderWalletId: "wallet1" },
//       { limit: 2, cursor: { createdAt: "2025-07-28T10:00:00.000Z", id: "tx1" } }
//     );
//   });
// });

// import { WalletService } from "../services/wallet.service";
// import { WalletRepository } from "../repositories/wallet.repository";
// import { TransactionRepository } from "../repositories/transaction.repository";
// import { KnexTransactionManager } from "../config/database";
// import { Container } from "typedi";

// describe("WalletService", () => {
//   let walletService: WalletService;
//   let walletRepo: WalletRepository;
//   let transactionRepo: TransactionRepository;
//   let transactionManager: KnexTransactionManager;

//   beforeEach(() => {
//     walletRepo = {
//       create: jest.fn(),
//       findOne: jest.fn(),
//       findByAccountNo: jest.fn(),
//       update: jest.fn(),
//     } as any;
//     transactionRepo = {
//       create: jest.fn(),
//       createAuditLog: jest.fn(),
//       findAll: jest.fn(),
//     } as any;
//     transactionManager = {
//       beginTransaction: jest.fn(),
//       commitTransaction: jest.fn(),
//       rollbackTransaction: jest.fn(),
//       getQueryRunner: jest.fn().mockReturnValue({
//         update: jest.fn().mockReturnValue(1),
//       }),
//     } as any;
//     Container.set(WalletRepository, walletRepo);
//     Container.set(TransactionRepository, transactionRepo);
//     Container.set("TransactionManager", transactionManager);
//     Container.set("Redis", {});
//     walletService = Container.get(WalletService);
//   });

//   it("should fund wallet successfully", async () => {
//     jest
//       .spyOn(walletRepo, "findOne")
//       .mockResolvedValue({
//         id: "1",
//         userId: "user1",
//         balance: 1000,
//         version: 0,
//       });
//     jest.spyOn(walletRepo, "update").mockResolvedValue();
//     jest
//       .spyOn(transactionRepo, "create")
//       .mockResolvedValue({ id: "tx1", type: "FUND", status: "COMPLETED" });
//     jest.spyOn(transactionRepo, "createAuditLog").mockResolvedValue();

//     const result = await walletService.fundWallet("user1", 500, "key1");
//     expect(result.type).toBe("FUND");
//     expect(result.status).toBe("COMPLETED");
//   });

//   it("should queue transfer successfully", async () => {
//     const job = await walletService.queueTransfer(
//       "user1",
//       "1234567890",
//       500,
//       "key2"
//     );
//     expect(job.jobId).toBe("key2");
//   });

//   it("should throw error on insufficient funds", async () => {
//     jest
//       .spyOn(walletRepo, "findOne")
//       .mockResolvedValue({
//         id: "1",
//         userId: "user1",
//         balance: 100,
//         version: 0,
//       });
//     jest
//       .spyOn(walletRepo, "findByAccountNo")
//       .mockResolvedValue({
//         id: "2",
//         userId: "user2",
//         balance: 1000,
//         version: 0,
//       });

//     await expect(
//       walletService.processTransfer("user1", "1234567890", 500, "key2")
//     ).rejects.toThrow("Insufficient funds");
//   });
// });

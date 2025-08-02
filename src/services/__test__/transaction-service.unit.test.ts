import { TransactionService } from "../transaction.service";
import { TransactionModel } from "../../models/transaction.model";
import { Transaction } from "../../interfaces/transaction.interface";
import { IJWT } from "../../interfaces/jwt.interface";
import { Cursor } from "../../interfaces/cursor.interface";
import { BadRequestError } from "../../errors";
import { mockTransactionRepository } from "../../__mocks__/transaction.repository.mock";
import { mockTransactionManager } from "../../__mocks__/transaction-manager.mock";

describe("TransactionService", () => {
  let service: TransactionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TransactionService(mockTransactionRepository as any);
  });

  describe("createTransaction", () => {
    it("should create and return a transaction", async () => {
      const transactionData = {
        amount: 1000,
        senderWalletId: 1,
        receiverWalletId: 2,
        type: 0,
      } as Transaction;

      const fakeTransaction = {
        id: 101,
        ...transactionData,
        createdAt: new Date(),
      };

      mockTransactionRepository.create.mockResolvedValue(fakeTransaction);

      const result = await service.createTransaction(transactionData);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        transactionData,
        undefined
      );
      expect(result).toEqual(fakeTransaction);
    });

    it("should use transaction manager to create a transaction", async () => {
      const transactionData = {
        amount: 1500,
        senderWalletId: 10,
        receiverWalletId: 20,
        type: 1,
      } as Transaction;

      const fakeCreated = { id: 99, ...transactionData };

      mockTransactionRepository.create.mockResolvedValue(fakeCreated);

      const result = await service.createTransaction(
        transactionData,
        mockTransactionManager as any
      );

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        transactionData,
        mockTransactionManager
      );
      expect(result).toEqual(fakeCreated);
    });
  });

  describe("getTransaction", () => {
    it("should return a transaction by ID", async () => {
      const fakeTransaction = { id: 1 } as TransactionModel;
      mockTransactionRepository.findById.mockResolvedValue(fakeTransaction);

      const result = await service.getTransaction(1);
      expect(mockTransactionRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(fakeTransaction);
    });

    it("should return null if transaction not found", async () => {
      mockTransactionRepository.findById.mockResolvedValue(null);
      const result = await service.getTransaction(99);
      expect(result).toBeNull();
    });
  });

  describe("getUserTransaction", () => {
    it("should return a transaction involving the user", async () => {
      const user: IJWT = { walletId: 5 } as IJWT;
      const fakeTransaction = { id: 2, senderWalletId: 5 } as TransactionModel;

      mockTransactionRepository.findBySenderIdOrReceiverId.mockResolvedValue(
        fakeTransaction
      );

      const result = await service.getUserTransaction(2, user);

      expect(
        mockTransactionRepository.findBySenderIdOrReceiverId
      ).toHaveBeenCalledWith(2, user.walletId);
      expect(result).toEqual(fakeTransaction);
    });

    it("should throw BadRequestError if no transaction found", async () => {
      const user: IJWT = { walletId: 5 } as IJWT;

      mockTransactionRepository.findBySenderIdOrReceiverId.mockResolvedValue(
        null
      );

      await expect(service.getUserTransaction(3, user)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe("getUserTransactions", () => {
    it("should return a list of transactions for the user", async () => {
      const user: IJWT = { walletId: 5 } as IJWT;
      const cursor: Cursor = { createdAt: new Date().toISOString(), id: 1 };

      const fakeTransactions = [
        { id: 1, senderWalletId: 5 },
        { id: 2, receiverWalletId: 5 },
      ] as Transaction[];

      mockTransactionRepository.findAll.mockResolvedValue(fakeTransactions);

      const result = await service.getUserTransactions(user, cursor);

      expect(mockTransactionRepository.findAll).toHaveBeenCalledWith(
        {
          senderWalletId: user.walletId,
          receiverWalletId: user.walletId,
        },
        { limit: 20, cursor }
      );
      expect(result).toEqual(fakeTransactions);
    });
  });
});

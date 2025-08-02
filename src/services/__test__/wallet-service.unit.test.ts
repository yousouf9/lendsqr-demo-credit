import { mockIdempotencyRepo } from "../../__mocks__/idempo-repository.mock";
import { mockTransactionManager } from "../../__mocks__/transaction-manager.mock";
import { mockTransferQueue } from "../../__mocks__/transaction-queue.mock";
import { mockTransactionService } from "../../__mocks__/transaction-service.mock";
import { mockAuditService } from "../../__mocks__/wallet-auth.service.mock";
import { mockWalletRepository } from "../../__mocks__/wallet.repository.mock";
import { BadRequestError, NotFoundError } from "../../errors";
import { TransactionTypes } from "../../interfaces/transaction.interface";
import { WalletService } from "../wallet.service";

const mockWallet = { id: 1, balance: 1000 };
const mockTransaction = { id: 1, amount: 100, type: TransactionTypes.fund };

let walletService: WalletService;

beforeEach(() => {
  jest.clearAllMocks();
  walletService = new WalletService(
    mockWalletRepository as any,
    mockTransactionService as any,
    mockAuditService as any,
    mockTransactionManager as any,
    mockTransferQueue as any,
    mockIdempotencyRepo as any
  );
});

describe("WalletService", () => {
  describe("getWallet", () => {
    it("should return wallet if found", async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      const result = await walletService.getWallet(1);
      expect(result).toEqual(mockWallet);
    });

    it("should throw NotFoundError if wallet is not found", async () => {
      mockWalletRepository.findOne.mockResolvedValue(null);
      await expect(walletService.getWallet(1)).rejects.toThrow(NotFoundError);
    });
  });

  describe("fundWallet", () => {
    it("should fund wallet and create audit + transaction", async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);
      mockTransactionService.createTransaction.mockResolvedValue(
        mockTransaction
      );

      const result = await walletService.fundWallet(1, 100, "ref-1", "url-1");

      expect(mockTransactionManager.beginTransaction).toHaveBeenCalled();
      expect(mockWalletRepository.update).toHaveBeenCalled();
      expect(mockTransactionService.createTransaction).toHaveBeenCalled();
      expect(mockAuditService.createAudit).toHaveBeenCalled();
      expect(mockIdempotencyRepo.saveResponse).toHaveBeenCalled();
      expect(mockTransactionManager.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(mockTransaction);
    });

    it("should rollback on error and throw", async () => {
      mockWalletRepository.findOne.mockRejectedValue(new Error("DB Error"));

      await expect(
        walletService.fundWallet(1, 100, "ref-1", "url-1")
      ).rejects.toThrow("DB Error");

      expect(mockTransactionManager.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe("withdraw", () => {
    it("should withdraw from wallet and create audit + transaction", async () => {
      mockWalletRepository.findOne.mockResolvedValue({
        ...mockWallet,
        balance: 1000,
      });
      mockTransactionService.createTransaction.mockResolvedValue(
        mockTransaction
      );

      const result = await walletService.withdraw(1, 100, "ref-2", "url-2");

      expect(mockTransactionManager.beginTransaction).toHaveBeenCalled();
      expect(mockWalletRepository.update).toHaveBeenCalled();
      expect(mockTransactionService.createTransaction).toHaveBeenCalled();
      expect(mockAuditService.createAudit).toHaveBeenCalled();
      expect(mockTransactionManager.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(mockTransaction);
    });

    it("should throw error if insufficient funds", async () => {
      mockWalletRepository.findOne.mockResolvedValue({
        ...mockWallet,
        balance: 50,
      });

      await expect(
        walletService.withdraw(1, 100, "ref-2", "url-2")
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw error if amount is not positive", async () => {
      mockWalletRepository.findOne.mockResolvedValue(mockWallet);

      await expect(
        walletService.withdraw(1, 0, "ref-2", "url-2")
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe("queueTransfer", () => {
    it("should add transfer to queue and return job id", async () => {
      const result = await walletService.queueTransfer(
        1,
        "2",
        100,
        "ref-3",
        "url-3"
      );
      expect(result).toEqual({ jobId: "job-1" });
      expect(mockTransferQueue.add).toHaveBeenCalled();
    });
  });

  describe("processTransfer", () => {
    it("should process wallet transfer and log audits", async () => {
      const sender = { id: 1, balance: 1000 };
      const receiver = { id: 2, balance: 500 };
      const tx = { id: 5, amount: 100, type: TransactionTypes.transfer };

      mockWalletRepository.findOne
        .mockResolvedValueOnce(sender)
        .mockResolvedValueOnce(receiver);
      mockTransactionService.createTransaction.mockResolvedValue(tx);

      const result = await walletService.processTransfer(
        1,
        2,
        100,
        "ref-4",
        "url-4"
      );

      expect(mockWalletRepository.update).toHaveBeenCalledTimes(2);
      expect(mockAuditService.createAudit).toHaveBeenCalledTimes(2);
      expect(mockTransactionManager.commitTransaction).toHaveBeenCalled();
      expect(result).toEqual(tx);
    });

    it("should throw if insufficient funds on transfer", async () => {
      mockWalletRepository.findOne
        .mockResolvedValueOnce({ id: 1, balance: 50 })
        .mockResolvedValueOnce({ id: 2, balance: 500 });

      await expect(
        walletService.processTransfer(1, 2, 100, "ref", "url")
      ).rejects.toThrow(BadRequestError);
    });
  });
});

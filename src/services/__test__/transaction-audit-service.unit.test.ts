import { mockTransactionManager } from "../../__mocks__/transaction-manager.mock";
import { mockWalletAuditRepository } from "../../__mocks__/wallet-audit.repository.mock";
import { WalletAudit } from "../../interfaces/wallet-audit.interface";
import { TranAuditService } from "../transaction-audit.service";

describe("TranAuditService", () => {
  let tranAuditService: TranAuditService;
  beforeEach(() => {
    jest.clearAllMocks();
    tranAuditService = new TranAuditService(mockWalletAuditRepository as any);
  });

  it("should call walletAuditRepo.create with correct data", async () => {
    const data: WalletAudit = {
      id: 1,
      walletId: 1,
      oldBalance: 5000,
      newBalance: 10000,
      transactionId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockWalletAuditRepository.create.mockResolvedValueOnce(data);

    const result = await tranAuditService.createAudit(
      data,
      mockTransactionManager
    );

    expect(mockWalletAuditRepository.create).toHaveBeenCalledWith(
      data,
      mockTransactionManager
    );
    expect(result).toBe(data);
  });
});

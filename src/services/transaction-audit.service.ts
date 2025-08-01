import { injectable, inject } from "tsyringe";

import { WALLET_AUDIT_REPOSITORY } from "../utils/constants";
import { ITransactionManager } from "../interfaces/database/transactions.interface";
import { WalletAuditRepository } from "../repositories/wallet-audit.repository";
import { WalletAudit } from "../interfaces/wallet-audit.interface";

@injectable()
export class TranAuditService {
  constructor(
    @inject(WALLET_AUDIT_REPOSITORY)
    private walletAuditRepo: WalletAuditRepository
  ) {}

  async createAudit(
    data: WalletAudit,
    transaction?: ITransactionManager
  ): Promise<WalletAudit> {
    return await this.walletAuditRepo.create(data, transaction);
  }
}

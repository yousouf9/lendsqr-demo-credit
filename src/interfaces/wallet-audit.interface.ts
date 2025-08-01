export interface WalletAudit {
  id: number;
  walletId: number;
  oldBalance: number;
  newBalance: number;
  transactionId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export const WalletAuditKeys: (keyof WalletAudit)[] = [
  "id",
  "walletId",
  "oldBalance",
  "newBalance",
  "transactionId",
  "createdAt",
  "updatedAt",
];

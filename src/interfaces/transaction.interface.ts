export interface Transaction {
  id: number;
  senderWalletId?: number;
  receiverWalletId?: number;
  amount: number;
  type: 0 | 1 | 2; // 0 = fund, 1 = transfer, 2 = withdrawal
  status: 0 | 1 | 2; // 0 = success, 1 = pending, 2 = failure
  reference: string;
  description?: string;
  completedAt?: Date;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const TransactionKeys: (keyof Transaction)[] = [
  "id",
  "senderWalletId",
  "receiverWalletId",
  "amount",
  "type",
  "status",
  "reference",
  "description",
  "reason",
  "completedAt",
  "createdAt",
  "updatedAt",
];

export interface Transaction {
  id?: number;
  senderWalletId?: number;
  receiverWalletId?: number;
  amount: number;
  type: TransactionTypes;
  status: TransactionStatus;
  reference: string;
  description?: string;
  completedAt?: Date;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum TransactionTypes {
  fund = 0,
  transfer = 1,
  withdraw = 2,
}

export enum TransactionStatus {
  success = 0,
  pending = 1,
  failure = 2,
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

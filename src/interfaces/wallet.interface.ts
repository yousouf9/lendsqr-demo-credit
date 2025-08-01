export interface Wallet {
  id?: number;
  userId: number;
  balance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export const WalletKeys: (keyof Wallet)[] = [
  "id",
  "userId",
  "balance",
  "createdAt",
  "updatedAt",
];

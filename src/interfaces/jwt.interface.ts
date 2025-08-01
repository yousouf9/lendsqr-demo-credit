export interface IJWT {
  userId: number;
  walletId: number;
  email: string;
  iat?: number;
  exp?: number;
}

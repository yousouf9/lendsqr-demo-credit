export interface Auth {
  id?: number;
  userId: number;
  provider: "password";
  identifier: string;
  passwordHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const AuthKeys: (keyof Auth)[] = [
  "id",
  "userId",
  "provider",
  "identifier",
  "passwordHash",
  "createdAt",
  "updatedAt",
];

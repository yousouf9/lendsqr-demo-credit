export interface IdempotencyKey {
  id?: number;
  key: string;
  userId: number;
  requestId: string;
  response?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export const IdempotencyKeyKeys: (keyof IdempotencyKey)[] = [
  "id",
  "key",
  "userId",
  "requestId",
  "response",
  "createdAt",
  "updatedAt",
];

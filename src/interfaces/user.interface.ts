export interface User {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phoneNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserKeys: (keyof User)[] = [
  "id",
  "firstName",
  "lastName",
  "middleName",
  "email",
  "phoneNumber",
  "createdAt",
  "updatedAt",
];

export interface RegisterUser extends User {
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

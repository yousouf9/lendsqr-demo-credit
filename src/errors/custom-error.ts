import { Status } from "../utils/status";

export abstract class CustomError extends Error {
  abstract statusCode: number;
  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract sequalizeErrors(): {
    status: Status;
    errors: {
      message: string;
      field?: string;
      error_code?: string;
      code?: number;
    }[];
  };
}

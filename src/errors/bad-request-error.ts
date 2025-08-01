import { Status } from "../utils/status";
import { CustomError } from "./custom-error";
import { ErrorReturn } from "./error.interface";

export class BadRequestError extends CustomError {
  public readonly statusCode: number = 400;

  constructor(public message: string, private error_data?: ErrorReturn) {
    super(message);
    this.error_data = error_data;
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
  public sequalizeErrors() {
    return {
      status: Status.Failed,
      errors: [
        {
          message: this.message,
          error_code: this.error_data?.error_code,
          code: this.error_data?.code,
        },
      ],
    };
  }
}

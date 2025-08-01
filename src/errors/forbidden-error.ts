import { Status } from "../utils/status";
import { CustomError } from "./custom-error";
import { ErrorReturn } from "./error.interface";

export class ForbiddenError extends CustomError {
  public readonly statusCode: number = 403;
  constructor(public message: string, private error_data?: ErrorReturn) {
    super(message);
    this.error_data = error_data;
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  sequalizeErrors() {
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

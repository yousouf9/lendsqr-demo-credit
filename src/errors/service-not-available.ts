import { Status } from "../utils/status";
import { CustomError } from "./custom-error";
import { ErrorReturn } from "./error.interface";

export class ServiceNotAvailableError extends CustomError {
  public readonly statusCode = 503;

  constructor(public message: string, private error_data?: ErrorReturn) {
    super(message);
    this.error_data = error_data;
    Object.setPrototypeOf(this, ServiceNotAvailableError.prototype);
  }
  public sequalizeErrors() {
    return {
      status: Status.Failed,
      errors: [
        {
          message: this.message,
          code: this.error_data?.code,
          error_code: this.error_data?.error_code,
        },
      ],
    };
  }
}

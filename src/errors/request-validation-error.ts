import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";
import { Status } from "../utils/status";

export class RequestValidationError extends CustomError {
  public readonly statusCode = 400;

  constructor(private errors: ValidationError[]) {
    super("validation error");
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  public sequalizeErrors() {
    const errors = this.errors.map((error) => {
      return {
        message: error.msg.message,
        error_code: error.msg.error_code,
        field: error.msg.path,
        code: error.msg.error_code,
      };
    });

    return {
      status: Status.Failed,
      errors,
    };
  }
}

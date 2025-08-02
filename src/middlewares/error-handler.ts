import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors";
import { Status } from "../utils/status";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send(err.sequalizeErrors());
  }

  //@ts-ignore
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    // Handle JSON parsing error
    return res.status(400).json({
      status: Status.Failed,
      errors: [
        {
          message: "Invalid JSON Body",
          error_code: `JSON_REQUEST_BODY`,
          field: null,
        },
      ],
    });
  }

  //@ts-ignore
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(400).json({
      status: Status.Failed,
      errors: [
        {
          message: "Duplicate entry, request already processed",
          error_code: `Duplicate`,
          field: null,
        },
      ],
    });
  }

  res.status(500).json({
    status: Status.Failed,
    errors: [
      {
        message: "Something went wrong, please try again later",
        error_code: `INTERNAL_SERVER_ERROR`,
        field: null,
      },
    ],
  });
};

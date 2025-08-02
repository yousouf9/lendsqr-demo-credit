import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { IdempotencyRepository } from "../repositories/idempotency.repository";
import { IDEMPOTENCY_REPOSITORY } from "../utils/constants";
import { BadRequestError } from "../errors";
import { successResponse } from "../utils/response";
import { TransactionStatus } from "../interfaces/transaction.interface";

declare global {
  namespace Express {
    interface Request {
      idempotencyKey?: string;
      requestId?: string;
    }
  }
}

@injectable()
export class IdempotencyMiddleware {
  constructor(
    @inject(IDEMPOTENCY_REPOSITORY)
    private idempotencyRepo: IdempotencyRepository
  ) {}

  public check = async (req: Request, res: Response, next: NextFunction) => {
    const currentUser = req.currentUser!;
    try {
      const idempotencyKey = req.headers["idempotency-key"] as string;
      if (!idempotencyKey)
        throw new BadRequestError("Idempotency key is required");

      const requestId = `${req.method}:${req.url}`;
      const { exists, response } = await this.idempotencyRepo.checkAndLock(
        idempotencyKey,
        requestId,
        currentUser.userId!
      );

      if (exists && response) {
        if (response.status === TransactionStatus.pending) {
          return res
            .status(202)
            .json(successResponse(null, "Request is being processed"));
        }
        return res
          .status(200)
          .json(successResponse(response, "Request already processed"));
      }

      req.idempotencyKey = idempotencyKey;
      req.requestId = requestId;
      next();
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  };
}

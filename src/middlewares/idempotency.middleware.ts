import { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { IdempotencyRepository } from "../repositories/idempotency.repository";
import { IDEMPOTENCY_REPOSITORY } from "../utils/constants";
import { BadRequestError } from "../errors";
import { successResponse } from "../utils/response";

declare global {
  namespace Express {
    interface Request {
      idempotencyKey?: string;
    }
  }
}

@injectable()
export class IdempotencyMiddleware {
  constructor(
    @inject(IDEMPOTENCY_REPOSITORY)
    private idempotencyRepo: IdempotencyRepository
  ) {}

  async check(req: Request, res: Response, next: NextFunction) {
    const idempotencyKey = req.headers["idempotency-key"] as string;
    if (!idempotencyKey)
      throw new BadRequestError("Idempotency key is required");

    const { exists, response } = await this.idempotencyRepo.checkAndLock(
      idempotencyKey,
      req.url
    );
    if (exists && response) {
      return res
        .status(200)
        .json(successResponse(response, "Request already processed"));
    }

    req.idempotencyKey = idempotencyKey;
    next();
  }
}

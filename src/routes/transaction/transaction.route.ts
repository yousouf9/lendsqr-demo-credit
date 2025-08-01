import { Router, Request } from "express";
import { container } from "tsyringe";
import { body, query, param } from "express-validator";

import { TransactionController } from "../../controllers/transaction.controller";
import { validateRequest } from "../../middlewares/validate-request";
import { validAllowedFields } from "../../middlewares/validate-fields";
import { requireAuth } from "../../middlewares/require-auth";

const router = Router();

// Resolve transactionController from container
const transactionController: TransactionController = container.resolve(
  TransactionController
);

/**
 * @route Transactions
 */
router.get(
  "/",
  validAllowedFields(["cursor", "limit"]),
  requireAuth,
  [
    query("limit").optional().isInt().withMessage({
      message: "Id must be an integer",
    }),
    query("cursor").optional().isString().withMessage({
      message: "cursor must be a string",
    }),
  ],
  validateRequest,
  transactionController.getTransactions
);
router.get(
  "/:id",
  validAllowedFields(["id"]),
  requireAuth,
  [
    param("id").isInt().withMessage({
      message: "Id must be an integer",
    }),
  ],
  validateRequest,
  transactionController.getTransaction
);

export default router;

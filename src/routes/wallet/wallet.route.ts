import { Router, Request } from "express";
import { container } from "tsyringe";
import { body, query, param } from "express-validator";

import { WalletController } from "../../controllers/wallet.controller";
import { validateRequest } from "../../middlewares/validate-request";
import { IdempotencyMiddleware } from "../../middlewares/idempotency.middleware";
import { validAllowedFields } from "../../middlewares/validate-fields";
import { requireAuth } from "../../middlewares/require-auth";

const router = Router();

// Resolve walletController from container
const walletController: WalletController = container.resolve(WalletController);
const idempotencyMiddlware: IdempotencyMiddleware = container.resolve(
  IdempotencyMiddleware
);

/**
 * @route Wallet
 */
router.get(
  "/balance",
  validAllowedFields([""]),
  requireAuth,
  [],
  validateRequest,
  walletController.getBalance
);
router.post(
  "/fund",
  validAllowedFields(["amount"]),
  requireAuth,
  [
    body("amount")
      .isInt({ gt: 0 })
      .withMessage("Amount must be a positive integer in kobo"),
  ],
  validateRequest,
  idempotencyMiddlware.check,
  walletController.fund
);

router.post(
  "/transfer",
  validAllowedFields(["receiverWalletId", "amount"]),
  requireAuth,
  [
    body("amount")
      .isInt({ gt: 0 })
      .withMessage("Amount must be a positive integer in kobo"),
    body("receiverWalletId")
      .isInt()
      .withMessage({
        message: "receiverWalletId must be an integer",
      })
      .toInt(),
  ],
  validateRequest,
  idempotencyMiddlware.check,
  walletController.transfer
);

router.post(
  "/withdraw",
  validAllowedFields(["amount"]),
  requireAuth,
  [
    body("amount")
      .isInt({ gt: 0 })
      .withMessage("Amount must be a positive integer in kobo"),
  ],
  validateRequest,
  idempotencyMiddlware.check,
  walletController.withdraw
);

export default router;

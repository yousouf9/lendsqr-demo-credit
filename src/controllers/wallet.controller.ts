import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { WalletService } from "../services/wallet.service";
import { WALLET_SERVICE } from "../utils/constants";
import { successResponse } from "../utils/response";

@injectable()
export class WalletController {
  constructor(@inject(WALLET_SERVICE) private walletService: WalletService) {}

  public getBalance = async (req: Request, res: Response) => {
    const currentUser = req.currentUser!;
    const result = this.walletService.getWallet(currentUser.walletId);
    res.json(successResponse(result, "Wallet balance fetched"));
  };

  public fund = async (req: Request, res: Response) => {
    const currentUser = req.currentUser!;
    const idempotencyKey = req.idempotencyKey!;
    const requestId = req.requestId!;
    const { amount } = req.body;
    const result = this.walletService.fundWallet(
      currentUser.walletId,
      amount,
      idempotencyKey,
      requestId
    );
    res.status(201).json(successResponse(result, "Wallet funded successfully"));
  };

  public transfer = async (req: Request, res: Response) => {
    const currentUser = req.currentUser!;
    const idempotencyKey = req.idempotencyKey!;
    const requestId = req.requestId!;

    const { receiverWalletId, amount } = req.body;

    const { jobId } = await this.walletService.queueTransfer(
      currentUser.walletId,
      receiverWalletId,
      amount,
      idempotencyKey,
      requestId
    );
    res
      .status(202)
      .json(successResponse({ jobId }, "Transfer queued for processing"));
  };

  public withdraw = async (req: Request, res: Response) => {
    const currentUser = req.currentUser!;
    const idempotencyKey = req.idempotencyKey!;
    const requestId = req.requestId!;
    const { amount } = req.body;
    const transaction = await this.walletService.withdraw(
      currentUser.walletId,
      amount,
      idempotencyKey,
      requestId
    );
    res
      .status(201)
      .json(successResponse(transaction, "Successfully withdraw from wallet"));
  };
}

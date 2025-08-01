import { Router } from "express";

import walletRouter from "./wallet.route";

const v1 = Router();
v1.use("/v1/wallets", walletRouter);

export const waRouter = v1;

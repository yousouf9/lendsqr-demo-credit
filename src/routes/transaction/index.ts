import { Router } from "express";

import transactionRouter from "./transaction.route";

const v1 = Router();
v1.use("/v1/transactions", transactionRouter);

export const tranRouter = v1;

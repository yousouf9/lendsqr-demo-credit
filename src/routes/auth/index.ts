import { Router } from "express";

import authRouter from "./auth.route";

const v1 = Router();
v1.use("/v1/auths", authRouter);

export const userAuthRouter = v1;

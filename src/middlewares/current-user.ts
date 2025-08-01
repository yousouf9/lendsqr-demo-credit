import { NextFunction, Request, Response } from "express";
import { IJWT } from "../interfaces/jwt.interface";
import { JWT } from "../utils/jwt";
import { appVeriable } from "../config/veriables";

//to add currentUser to the existing interface
declare global {
  namespace Express {
    interface Request {
      currentUser?: IJWT;
    }
  }
}

export const currentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers["authorization"]) return next();

  try {
    if (req.headers["authorization"]) {
      const token = req.headers["authorization"].split(" ")[1];
      const payload = await JWT.verifyToken(token);
      req.currentUser = payload;
    }
  } catch (error) {
    if (appVeriable.isDev) {
      console.log("Failed to validate jwt");
    }
  }
  next();
};

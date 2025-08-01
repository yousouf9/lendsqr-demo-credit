import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { AUTH_SERVICE } from "../utils/constants";
import { AuthService } from "../services/auth/auth.service";
import { successResponse } from "../utils/response";

@injectable()
export class AuthController {
  constructor(@inject(AUTH_SERVICE) private authService: AuthService) {}
  public register = async (req: Request, res: Response) => {
    const data = req.body;
    const result = await this.authService.register(data);
    res.json(successResponse(result, "user account created"));
  };
  public login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);
    res.json(successResponse(result, "user logged in"));
  };
}

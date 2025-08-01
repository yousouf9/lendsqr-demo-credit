import { injectable, inject } from "tsyringe";

import {
  AUTH_REPOSITORY,
  TRANSACTION_MANAGER,
  USER_SERVICE,
} from "../../utils/constants";
import { ITransactionManager } from "../../interfaces/database/transactions.interface";
import { UserService } from "../user.service";
import {
  BadRequestError,
  ForbiddenError,
  ServiceNotAvailableError,
} from "../../errors";
import { ValidationService } from "../validation.service";
import { AuthRepository } from "../../repositories/auth.repository";
import {
  LoginResponse,
  RegisterUser,
  UserKeys,
} from "../../interfaces/user.interface";
import { JWT } from "../../utils/jwt";
import { Password } from "../../utils/password";
import { IJWT } from "../../interfaces/jwt.interface";
import { appVeriable } from "../../config/veriables";
import { pickAllowedFields } from "../../utils/strip";

@injectable()
export class AuthService {
  constructor(
    @inject(USER_SERVICE) private userSrv: UserService,
    @inject(AUTH_REPOSITORY) private authRepo: AuthRepository,
    @inject(TRANSACTION_MANAGER)
    private transactionManager: ITransactionManager,
    private validation: ValidationService
  ) {}

  async register(data: RegisterUser): Promise<string> {
    try {
      // Validate user data against karma blacklist / check for existance in db
      await this.validateUserData(data.email, data.phoneNumber);

      // start transaction
      await this.transactionManager.beginTransaction();

      const result = await this.userSrv.create(
        pickAllowedFields(data, UserKeys),
        this.transactionManager
      );

      //hash password
      const password = await this.hashPassWord(data.password);

      //create auth
      await this.authRepo.create(
        {
          userId: result.id,
          passwordHash: password,
          provider: "password",
          identifier: result.email,
        },
        this.transactionManager
      );

      //TODO: send email or email event
      await this.transactionManager.commitTransaction();
      return "User created";
    } catch (error) {
      await this.transactionManager.rollbackTransaction();
      throw error;
    }
  }
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const user = await this.authRepo.findAuthWithUserByIdentifier(
        email,
        "password"
      );

      if (!user) {
        throw new BadRequestError("Invalid email or password");
      }

      const isMatch = await this.comparePassword(user.passwordHash, password);
      if (!isMatch) {
        throw new BadRequestError("Invalid email or password");
      }

      const token = await this.signJWT({
        email: user.email,
        walletId: user.walletId,
        userId: user.userId,
      });

      return {
        token,
        user: {
          id: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
        },
      };
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  private async signJWT(payload: IJWT): Promise<string> {
    return JWT.getToken(payload, {
      expiresIn: appVeriable.getJwtExpiryTime() as any,
    });
  }

  private async hashPassWord(password: string): Promise<string> {
    return Password.toHash(password);
  }

  private async comparePassword(
    storeedPassword: string,
    suppliedPassword: string
  ): Promise<boolean> {
    return Password.compare(storeedPassword, suppliedPassword);
  }

  private async validateUserData(
    email: string,
    phoneNumber: string
  ): Promise<void> {
    const [emailResult, phoneResult, existingUserEmail, existingUserPhone] =
      await Promise.all([
        this.validation.validateLCustomer(email),
        this.validation.validateLCustomer(phoneNumber),
        this.userSrv.findOne({ email }),
        this.userSrv.findOne({ phoneNumber }),
      ]);

    if (emailResult === null || phoneNumber === null)
      throw new ServiceNotAvailableError(
        "Validation service is not available, please try again later."
      );

    if (emailResult || phoneResult) {
      throw new ForbiddenError(
        "Email or phone number is blacklisted. Please contact support."
      );
    }

    if (existingUserEmail || existingUserPhone) {
      throw new BadRequestError("User already exist");
    }
  }
}

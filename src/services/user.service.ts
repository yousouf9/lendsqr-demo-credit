import { injectable, inject } from "tsyringe";
import { UserRepository } from "../repositories/user-repository";
import { USER_REPOSITORY, WALLET_REPOSITORY } from "../utils/constants";
import { WalletRepository } from "../repositories/wallet-repository";
import { ITransactionManager } from "../interfaces/database/transactions.interface";
import { User } from "../interfaces/user.interface";

@injectable()
export class UserService {
  constructor(
    @inject(USER_REPOSITORY) private userRepo: UserRepository,
    @inject(WALLET_REPOSITORY) private walletRepo: WalletRepository
  ) {}

  async create(data: User, transaction?: ITransactionManager): Promise<User> {
    try {
      const user = await this.userRepo.create(data, transaction);
      await this.walletRepo.create(
        { userId: user.id, balance: 0 },
        transaction
      );
      return user;
    } catch (error) {
      throw error;
    }
  }
  async findOne(
    data: Partial<User>,
    transaction?: ITransactionManager
  ): Promise<User | null> {
    return this.userRepo.findOne({ ...data }, transaction);
  }
  async findById(
    id: number,
    transaction?: ITransactionManager
  ): Promise<User | null> {
    return this.userRepo.findById(id, transaction);
  }
}

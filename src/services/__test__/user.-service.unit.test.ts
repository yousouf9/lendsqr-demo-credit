import { UserService } from "../user.service";
import { User } from "../../interfaces/user.interface";
import { mockUserRepository } from "../../__mocks__/user.repository.mock";
import { mockWalletRepository } from "../../__mocks__/wallet.repository.mock";

describe("UserService", () => {
  let userService: UserService;

  const mockUser: User = {
    id: 1,
    email: "test@example.com",
    firstName: "John",
    lastName: "Doe",
    phoneNumber: "08012345678",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(
      mockUserRepository as any,
      mockWalletRepository as any
    );
  });

  describe("create", () => {
    it("should create a user and a wallet", async () => {
      mockUserRepository.create.mockResolvedValue(mockUser);
      mockWalletRepository.create.mockResolvedValue({});

      const result = await userService.create(mockUser);

      expect(mockUserRepository.create).toHaveBeenCalledWith(
        mockUser,
        undefined
      );
      expect(mockWalletRepository.create).toHaveBeenCalledWith(
        { userId: mockUser.id, balance: 0 },
        undefined
      );
      expect(result).toEqual(mockUser);
    });

    it("should throw an error if userRepo.create fails", async () => {
      mockUserRepository.create.mockRejectedValue(new Error("DB error"));

      await expect(userService.create(mockUser)).rejects.toThrow(Error);
      expect(mockWalletRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return user if found", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await userService.findOne({ email: mockUser.email });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith(
        { email: mockUser.email },
        undefined
      );
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await userService.findOne({
        email: "unknown@example.com",
      });

      expect(result).toBeNull();
    });
  });

  describe("findById", () => {
    it("should return user by id", async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      const result = await userService.findById(mockUser.id);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        mockUser.id,
        undefined
      );
      expect(result).toEqual(mockUser);
    });

    it("should return null if user not found", async () => {
      mockUserRepository.findById.mockResolvedValue(null);
      const result = await userService.findById(999);

      expect(result).toBeNull();
    });
  });
});

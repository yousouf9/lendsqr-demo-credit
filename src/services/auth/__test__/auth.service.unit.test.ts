jest.mock("../../../utils/password");
jest.mock("../../../utils/jwt");

import { mockAuthRepository } from "../../../__mocks__/auth.repository.mock";
import { mockTransactionManager } from "../../../__mocks__/transaction-manager.mock";
import { mockUserService } from "../../../__mocks__/user-service.mock";
import { mockValidationService } from "../../../__mocks__/validation.service.mock";
import { BadRequestError, ForbiddenError } from "../../../errors";
import { AuthService } from "../auth.service";

describe("AuthService Unit Tests", () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(
      mockUserService as any,
      mockAuthRepository as any,
      mockTransactionManager as any,
      mockValidationService as any
    );
  });

  describe("register", () => {
    const userData = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "secret",
      phoneNumber: "1234567890",
      id: 1,
    };

    it("should register user successfully", async () => {
      mockUserService.create.mockResolvedValue({
        id: "user-id",
        email: userData.email,
      });
      mockAuthRepository.create.mockResolvedValue(true);

      const result = await authService.register(userData);

      expect(mockTransactionManager.beginTransaction).toHaveBeenCalled();
      expect(mockUserService.create).toHaveBeenCalled();
      expect(mockAuthRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-id",
          identifier: userData.email,
        }),
        expect.anything()
      );
      expect(mockTransactionManager.commitTransaction).toHaveBeenCalled();
      expect(result).toBe("User created");
    });

    it("should rollback if user creation fails", async () => {
      mockUserService.create.mockRejectedValue(new Error("DB error"));

      await expect(authService.register(userData)).rejects.toThrow("DB error");

      expect(mockTransactionManager.rollbackTransaction).toHaveBeenCalled();
    });

    it("should throw ForbiddenError if email is blacklisted", async () => {
      mockValidationService.validateLCustomer
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      mockUserService.findOne.mockResolvedValue(null);

      await expect(authService.register(userData)).rejects.toThrow(
        ForbiddenError
      );
      expect(mockValidationService.validateLCustomer).toHaveBeenCalledWith(
        userData.email
      );
      expect(mockValidationService.validateLCustomer).toHaveBeenCalledWith(
        userData.phoneNumber
      );
    });

    it("should throw ForbiddenError if phone number is blacklisted", async () => {
      mockValidationService.validateLCustomer
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true);
      mockUserService.findOne.mockResolvedValue(null);

      await expect(authService.register(userData)).rejects.toThrow(
        ForbiddenError
      );
      expect(mockValidationService.validateLCustomer).toHaveBeenCalledWith(
        userData.email
      );
      expect(mockValidationService.validateLCustomer).toHaveBeenCalledWith(
        userData.phoneNumber
      );
    });

    it("should throw BadRequestError if user email already exists", async () => {
      mockValidationService.validateLCustomer.mockResolvedValue(false);
      mockUserService.findOne
        .mockResolvedValueOnce({ id: "existing-user" })
        .mockResolvedValueOnce(null);

      await expect(authService.register(userData)).rejects.toThrow(
        "User already exist"
      );
      expect(mockUserService.findOne).toHaveBeenCalledWith({
        email: userData.email,
      });
    });

    it("should throw BadRequestError if user phone already exists", async () => {
      mockValidationService.validateLCustomer.mockResolvedValue(false);
      mockUserService.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: "existing-user" });

      await expect(authService.register(userData)).rejects.toThrow(
        "User already exist"
      );
      expect(mockUserService.findOne).toHaveBeenCalledWith({
        phoneNumber: userData.phoneNumber,
      });
    });

    it("should throw ServiceNotAvailableError if validation service fails", async () => {
      mockValidationService.validateLCustomer
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(false);
      mockUserService.findOne.mockResolvedValue(null);

      await expect(authService.register(userData)).rejects.toThrow(
        "Validation service is not available, please try again later."
      );
    });
  });

  describe("login", () => {
    const loginData = { email: "john@example.com", password: "secret" };

    it("should login successfully", async () => {
      const mockUser = {
        userId: "user-id",
        email: loginData.email,
        passwordHash: "hashed-secret.testSalt",
        firstName: "John",
        lastName: "Doe",
        walletId: "wallet123",
        phoneNumber: "1234567890",
      };

      mockAuthRepository.findAuthWithUserByIdentifier.mockResolvedValue(
        mockUser
      );

      const result = await authService.login(
        loginData.email,
        loginData.password
      );

      expect(result.token).toBe("mocked-jwt-token");
      expect(result.user.email).toBe(loginData.email);
    });

    it("should throw error if user is not found", async () => {
      mockAuthRepository.findAuthWithUserByIdentifier.mockResolvedValue(null);

      await expect(
        authService.login(loginData.email, loginData.password)
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw error if password does not match", async () => {
      mockAuthRepository.findAuthWithUserByIdentifier.mockResolvedValue({
        passwordHash: "hashed-wrong.testSalt",
        email: loginData.email,
        userId: "user-id",
        walletId: "wallet123",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "1234567890",
      });

      await expect(
        authService.login(loginData.email, loginData.password)
      ).rejects.toThrow(BadRequestError);
    });

    it("should throw error if salt is not provided", async () => {
      mockAuthRepository.findAuthWithUserByIdentifier.mockResolvedValue({
        passwordHash: "hashed-wrong",
        email: loginData.email,
        userId: "user-id",
        walletId: "wallet123",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "1234567890",
      });

      await expect(
        authService.login(loginData.email, loginData.password)
      ).rejects.toThrow(TypeError);
    });
  });
});

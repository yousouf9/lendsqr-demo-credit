// import { UserService } from "../services/user.service";
// import { UserRepository } from "../repositories/user.repository";
// import { AdjutorService } from "../services/adjutor.service";
// import { Container } from "typedi";

// describe("UserService", () => {
//   let userService: UserService;
//   let userRepo: UserRepository;
//   let adjutorService: AdjutorService;

//   beforeEach(() => {
//     userRepo = { create: jest.fn(), findOne: jest.fn() } as any;
//     adjutorService = { checkBlacklist: jest.fn() } as any;
//     Container.set(UserRepository, userRepo);
//     Container.set(AdjutorService, adjutorService);
//     userService = Container.get(UserService);
//   });

//   it("should create user successfully", async () => {
//     const userData = {
//       accountNo: "1234567890",
//       firstName: "John",
//       lastName: "Doe",
//       email: "john.doe@example.com",
//       phoneNumber: "+2341234567890",
//     };
//     jest.spyOn(adjutorService, "checkBlacklist").mockResolvedValue(false);
//     jest.spyOn(userRepo, "create").mockResolvedValue({ id: "1", ...userData });

//     const user = await userService.create(userData);
//     expect(user.id).toBe("1");
//     expect(adjutorService.checkBlacklist).toHaveBeenCalledWith(userData.email);
//   });

//   it("should reject blacklisted user", async () => {
//     jest.spyOn(adjutorService, "checkBlacklist").mockResolvedValue(true);
//     await expect(
//       userService.create({
//         email: "blacklisted@example.com",
//         accountNo: "1234567890",
//       })
//     ).rejects.toThrow("User is blacklisted");
//   });
// });

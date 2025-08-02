export const Password = {
  toHash: jest.fn((pass: string) => {
    const salt = "testSalt";
    return `hashed-${pass}.${salt}`;
  }),
  compare: jest.fn(async (stored: string, supplied: string) => {
    const [hashed, salt] = stored.split(".");
    if (!salt) throw new Error("Salt is missing");
    return hashed === `hashed-${supplied}`;
  }),
};

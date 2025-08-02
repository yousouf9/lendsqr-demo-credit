export const Password = {
  toHash: jest.fn((pass: string) => {
    return `hashed-${pass}.testSalt`;
  }),
  compare: jest.fn((stored: string, supplied: string) => {
    const [hashed, salt] = stored.split(".");
    if (!salt) throw new TypeError("Salt is missing");
    return hashed === `hashed-${supplied}`;
  }),
};

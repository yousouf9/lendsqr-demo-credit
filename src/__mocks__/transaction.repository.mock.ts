export const mockTransactionRepository = {
  create: jest.fn(),
  findById: jest.fn(),
  findBySenderIdOrReceiverId: jest.fn(),
  findAll: jest.fn(),
};

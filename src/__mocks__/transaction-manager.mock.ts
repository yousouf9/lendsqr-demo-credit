export const mockTransactionManager = {
  beginTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  getQueryRunner: jest.fn(),
};

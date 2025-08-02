export const mockTransferQueue = {
  process: jest.fn(),
  add: jest.fn().mockResolvedValue({ id: "job-1" }),
};

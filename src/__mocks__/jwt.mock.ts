jest.mock("../utils/jwt", () => ({
  JWT: {
    getToken: jest.fn(() => "mocked-jwt-token"),
  },
}));

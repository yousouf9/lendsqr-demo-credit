jest.mock("../../../utils/request");

import { httpClient } from "../../../utils/request";
import { KarmaService } from "../karma-validation.service";

describe("KarmaService", () => {
  const apiKey = "fake-api-key";
  const apiUrl = "https://fake-api.test";
  const karma = new KarmaService(apiKey, apiUrl);

  const path = `${apiUrl}/v2/verification/karma`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return false if response is 404 (not blacklisted)", async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      response: undefined,
      error: {
        status: 404,
        message: "Not found",
      },
    });

    const result = await karma.isBlackListed("user123");
    expect(result).toBe(false);
    expect(httpClient.get).toHaveBeenCalledWith(`${path}/user123`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  });

  it("should return true if response is successful (blacklisted)", async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      response: {
        status: 200,
      },
      error: undefined,
    });

    const result = await karma.isBlackListed("user123");
    expect(result).toBe(true);
  });

  it("should return null on general errors", async () => {
    const error = {
      status: 500,
      message: "Internal Server Error",
      data: { error: "Something went wrong" },
    };

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    (httpClient.get as jest.Mock).mockResolvedValue({
      response: undefined,
      error,
    });

    const result = await karma.isBlackListed("user123");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith("Adjutor API error:", error);

    consoleSpy.mockRestore();
  });

  it("should return null if neither response nor error exists", async () => {
    (httpClient.get as jest.Mock).mockResolvedValue({
      response: undefined,
      error: undefined,
    });

    const result = await karma.isBlackListed("user123");
    expect(result).toBeNull();
  });
});

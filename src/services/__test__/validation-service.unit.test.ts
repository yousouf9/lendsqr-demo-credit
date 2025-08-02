import { container } from "tsyringe";
import { ValidationVendor } from "../validation/vendor.abstract";
import { ValidationService } from "../validation.service";
import { VALIDATION_VENDOR } from "../../utils/constants";

class MockValidationVendor extends ValidationVendor {
  isBlackListed = jest.fn();
}

describe("ValidationService", () => {
  let service: ValidationService;
  let mockVendor: MockValidationVendor;

  beforeEach(() => {
    mockVendor = new MockValidationVendor();

    container.registerInstance<ValidationVendor>(VALIDATION_VENDOR, mockVendor);

    service = container.resolve(ValidationService);
  });

  afterEach(() => {
    container.reset();
  });

  it("should return true when vendor flags input as blacklisted", async () => {
    mockVendor.isBlackListed.mockReturnValue(true);

    const result = await service.validateLCustomer("bad-user");

    expect(mockVendor.isBlackListed).toHaveBeenCalledWith("bad-user");
    expect(result).toBe(true);
  });

  it("should return false when vendor does not flag input", async () => {
    mockVendor.isBlackListed.mockReturnValue(false);

    const result = await service.validateLCustomer("good-user");

    expect(result).toBe(false);
  });

  it("should return null if vendor returns null", async () => {
    mockVendor.isBlackListed.mockReturnValue(null);

    const result = await service.validateLCustomer("unknown");

    expect(result).toBeNull();
  });
});

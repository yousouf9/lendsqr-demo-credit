import { VALIDATION_VENDOR } from "../utils/constants";
import { ValidationVendor } from "./validation/vendor.abstract";
import { inject, injectable } from "tsyringe";

@injectable()
export class ValidationService {
  constructor(
    @inject(VALIDATION_VENDOR) private readonly validator: ValidationVendor
  ) {}

  async validateLCustomer(input: string): Promise<boolean | null> {
    return this.validator.isBlackListed(input);
  }
}

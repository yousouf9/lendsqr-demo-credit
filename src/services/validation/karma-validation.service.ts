import axios from "axios";
import { injectable } from "tsyringe";
import { ValidationVendor } from "./vendor.abstract";
import { httpClient } from "../../utils/request";

@injectable()
export class KarmaService extends ValidationVendor {
  private readonly path: string;
  constructor(private readonly apiKey: string, apiUrl: string) {
    super();
    this.path = `${apiUrl}/v2/verification/karma`;
  }

  async isBlackListed(input: string): Promise<boolean | null> {
    const { response, error } = await httpClient.get(`${this.path}/${input}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (error && error.status === 404) {
      // If the user is not found, we assume they are not blacklisted
      return false;
    }

    if (response && response.status >= 200 && response.status < 300) {
      // If the response is successful, we check the blacklisted status
      return true;
    }
    if (error) {
      console.error("Adjutor API error:", error);
      return null; // we return null to indicate an error occurred and we cannot determine blacklist status
    }

    return null;
  }
}

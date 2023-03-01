import crypto from "crypto";
import { inject, injectable } from "tsyringe";

@injectable()
export default class Crypto {
  constructor(
    @inject("ALGORITHM") private readonly algorithm: string,
    @inject("ALGORITHM_SECURITY_KEY") private readonly securityKey: string,
    @inject("ALGORITHM_IV") private readonly initVector: string
  ) {}

  public encryptValue(value: string): string {
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.securityKey,
      this.initVector
    );

    let encryptedData = cipher.update(value, "utf-8", "base64");
    encryptedData += cipher.final("base64");
    value = encryptedData;

    return encryptedData;
  }

  public decryptValue(value: string): string {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.securityKey,
      this.initVector
    );

    let decryptedData = decipher.update(value, "base64", "utf-8");
    decryptedData += decipher.final("utf8");

    return decryptedData;
  }
}

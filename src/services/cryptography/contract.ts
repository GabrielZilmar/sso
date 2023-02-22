export interface CryptographyContract {
  encryptValue(value: string): string;
  decryptValue(value: string): string;
}

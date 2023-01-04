export default class Validator {
  public static isValidUuid(uuid: string): boolean {
    const verifyUuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

    return verifyUuidRegex.test(uuid);
  }
}

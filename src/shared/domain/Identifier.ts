export class Identifier<T> {
  private value: T;

  constructor(value: T) {
    this.value = value;
  }

  public toString(): string {
    return String(this.value);
  }

  public toValue(): T {
    return this.value;
  }

  public equals(id?: Identifier<T> | null): boolean {
    if (!id || !(id instanceof this.constructor)) {
      return false;
    }

    return id.toValue() === this.value;
  }
}

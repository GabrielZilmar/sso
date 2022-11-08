export abstract class ValueObject<T> {
  public props: T;

  constructor(props: T) {
    const propsSpreadClone: T = {
      ...props,
    };

    this.props = propsSpreadClone;
  }

  public equals(vo?: ValueObject<T>): boolean {
    if (!vo || !vo?.props) {
      return false;
    }

    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}

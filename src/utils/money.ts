import Decimal from "decimal.js";

export class DecimalUtils {
  // Convert kobo to naira (e.g. 10000 => 100)
  /**
   *
   * @param kobo
   * @returns
   */
  static toNaira(kobo: number | string): number {
    return new Decimal(kobo).div(100).toNumber();
  }

  // Convert naira to kobo (e.g. 100 => 10000)
  static toKobo(naira: number | string): number {
    return new Decimal(naira).mul(100).toNumber();
  }

  static add(a: number | string, b: number | string): number {
    return new Decimal(a).plus(new Decimal(b)).toNumber();
  }

  static subtract(a: number | string, b: number | string): number {
    return new Decimal(a).minus(new Decimal(b)).toNumber();
  }

  static multiply(a: number | string, b: number | string): number {
    return new Decimal(a).mul(new Decimal(b)).toNumber();
  }

  static divide(a: number | string, b: number | string): number {
    if (new Decimal(b).isZero()) throw new Error("Cannot divide by zero");
    return new Decimal(a).div(new Decimal(b)).toNumber();
  }

  static round(value: number | string, decimalPlaces = 2): number {
    return new Decimal(value).toDecimalPlaces(decimalPlaces).toNumber();
  }

  static greaterThan(a: number | string, b: number | string): boolean {
    return new Decimal(a).greaterThan(new Decimal(b));
  }

  static lessThan(a: number | string, b: number | string): boolean {
    return new Decimal(a).lessThan(new Decimal(b));
  }

  static equals(a: number | string, b: number | string): boolean {
    return new Decimal(a).equals(new Decimal(b));
  }

  static isZero(value: number | string): boolean {
    return new Decimal(value).isZero();
  }

  static abs(value: number | string): number {
    return new Decimal(value).abs().toNumber();
  }
}

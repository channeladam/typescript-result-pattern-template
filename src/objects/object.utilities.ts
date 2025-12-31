import type { Constructor } from "./object.types";

/**
 * Helpful utilities for working with Objects.
 */
export abstract class ObjectUtils {
  /**
   * @returns true if the value is null or undefined.
   */
  static isNullOrUndefined(value: unknown): value is null | undefined {
    // NOTE: Intentionally using `==` as opposed to `===` to check for both null and undefined.
    return value == null;
  }

  /**
   * @returns true if the value is undefined.
   */
  static isTypeOfUndefined(value: unknown): value is undefined {
    return typeof value === 'undefined';
  }

  /**
   * @returns true if the value is a function.
   */
  static isTypeOfFunction(value: unknown): value is Function {
    return typeof value === 'function';
  }

  /**
   * @returns true if the value is an object (explicitly excluding null).
   */
  static isTypeOfObject(value: unknown): value is object {
    return value !== null && typeof value === 'object';
  }

  /**
   * @returns true if the given object is an instance of the given constructor.
   */
  static isInstanceOf<T>(ctor: Constructor<T>, object: unknown): object is T {
    if (ObjectUtils.isNullOrUndefined(object) || !ObjectUtils.isTypeOfObject(object)) return false;
    return object instanceof ctor;
  }
}

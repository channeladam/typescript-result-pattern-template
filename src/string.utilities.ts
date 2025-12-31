/**
 * String-related utility functions.
 */
export abstract class StringUtils {
  /**
   * @param value
   * @returns true if the value is a string
   */
  static isString(value: unknown): value is string {
    const type = typeof value;
    if (type === 'object') {
      return Object.prototype.toString.call(value) === '[object String]';
    }
    return type === 'string' || value instanceof String;
  }
}

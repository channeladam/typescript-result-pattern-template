import { ObjectUtils } from '../objects/object.utilities';

/**
 * An error that should never occur, but may be thrown simply for cases where TypeScript static analysis cannot determine that a code path is unreachable.
 */
export class UnreachableError extends Error {
  /**
   * @returns true if the given object is an instance of UnreachableError.
   */
  static isInstance(error: unknown): error is UnreachableError {
    return ObjectUtils.isInstanceOf(UnreachableError, error);
  }

  /**
   * Instantiates a new UnreachableError.
   */
  constructor() {
    super();
    this.name = UnreachableError.name;
  }
}

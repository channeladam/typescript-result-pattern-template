import { ObjectUtils } from '../objects/object.utilities';

/**
 * An error that can be thrown when a logic guard/pre-condition fails.
 * This is typically a technical unexpected error / bug that should not occur during normal intended operation.
 */
export class AssertionFailedError extends Error {
  /**
   * @returns true if the given object is an instance of AssertionFailedError.
   */
  static isInstance(error: unknown): error is AssertionFailedError {
    return ObjectUtils.isInstanceOf(AssertionFailedError, error);
  }

  /**
   * Instantiates a new AssertionFailedError.
   * NOTE: Prefer to throw this via ErrorUtils.throwAssertionFailedError() rather than directly using this constructor.
   */
  constructor(technicalErrorMessage: string) {
    super(technicalErrorMessage);
    this.name = AssertionFailedError.name; 
  }
}

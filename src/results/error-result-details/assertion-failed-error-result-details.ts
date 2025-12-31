// Types
import type { ErrorResultDetailsConstructorOptions } from '../result.types';
import { ErrorResultDetailsDiscriminantTags } from '../error-result-details.types';

// Errors
import { AbstractErrorResultDetails } from './abstract-error-result-details';

// Utilities
import { ObjectUtils } from '../../objects/object.utilities';

/**
 * An error result that can be returned when a logic guard/pre-condition fails.
 * This is typically a technical unexpected error / bug that should not occur during normal intended operation.
 */
export class AssertionFailedErrorResultDetails extends AbstractErrorResultDetails {
  override readonly discriminantTag = ErrorResultDetailsDiscriminantTags.AssertionFailedError;
  override readonly name = AssertionFailedErrorResultDetails.name;

  /**
   * @returns true if the object is an instance of `AssertionFailedErrorResultDetails`.
   */
  static isInstance(object: unknown): object is AssertionFailedErrorResultDetails {
    return ObjectUtils.isInstanceOf(AssertionFailedErrorResultDetails, object);
  }

  /**
   * Instantiates a new `AssertionFailedErrorResultDetails`.
   * @param options The options for the error result details.
   */
  constructor(options: ErrorResultDetailsConstructorOptions) {
    super(options);
  }
}

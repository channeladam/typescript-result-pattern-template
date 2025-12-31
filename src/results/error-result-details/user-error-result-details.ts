// Types
import type { ErrorResultDetailsConstructorOptions } from '../result.types';
import { ErrorResultDetailsDiscriminantTags } from '../error-result-details.types';

// Errors
import { AbstractErrorResultDetails } from './abstract-error-result-details';

// Utilities
import { ObjectUtils } from '../../objects/object.utilities';

/**
 * An error result that represents a user error.
 */
export class UserErrorResultDetails extends AbstractErrorResultDetails {
  override readonly discriminantTag = ErrorResultDetailsDiscriminantTags.UserError;
  override readonly name = UserErrorResultDetails.name;

  /**
   * @returns true if the object is an instance of `UserErrorResultDetails`.
   */
  static isInstance(object: unknown): object is UserErrorResultDetails {
    return ObjectUtils.isInstanceOf(UserErrorResultDetails, object);
  }

  /**
   * Instantiates a new `UserErrorResultDetails`.
   * @param options The options for the error result details.
   */
  constructor(options: ErrorResultDetailsConstructorOptions) {
    super(options);
  }
}

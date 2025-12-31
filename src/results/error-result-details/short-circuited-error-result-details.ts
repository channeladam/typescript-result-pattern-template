// Types
import type { ErrorResultDetailsConstructorOptions } from '../result.types';
import { ErrorResultDetailsDiscriminantTags } from '../error-result-details.types';

// Errors
import { AbstractErrorResultDetails } from './abstract-error-result-details';

// Utilities
import { ObjectUtils } from '../../objects/object.utilities';

/**
 * An expected, non-critical error result that indicates that functionality was skipped/short-circuited for an expected reason.
 */
export class ShortCircuitedErrorResultDetails extends AbstractErrorResultDetails {
  override readonly discriminantTag = ErrorResultDetailsDiscriminantTags.ShortCircuitedError;
  override readonly name = ShortCircuitedErrorResultDetails.name;

  /**
   * @returns true if the object is an instance of `ShortCircuitedErrorResultDetails`.
   */
  static isInstance(object: unknown): object is ShortCircuitedErrorResultDetails {
    return ObjectUtils.isInstanceOf(ShortCircuitedErrorResultDetails, object);
  }

  /**
   * Instantiates a new `ShortCircuitedErrorResultDetails`.
   * @param options The options for the error result details.
   */
  constructor(options: ErrorResultDetailsConstructorOptions) {
    super(options);
  }
}

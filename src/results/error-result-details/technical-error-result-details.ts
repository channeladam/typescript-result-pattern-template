// Types
import type { ErrorResultDetailsConstructorOptions } from '../result.types';
import { ErrorResultDetailsDiscriminantTags } from '../error-result-details.types';

// Errors
import { AbstractErrorResultDetails } from './abstract-error-result-details';

// Utilities
import { ObjectUtils } from '../../objects/object.utilities';

/**
 * An error result that represents a general technical error.
 */
export class TechnicalErrorResultDetails extends AbstractErrorResultDetails {
  override readonly discriminantTag = ErrorResultDetailsDiscriminantTags.TechnicalError;
  override readonly name = TechnicalErrorResultDetails.name;

  /**
   * @returns true if the object is an instance of `TechnicalErrorResultDetails`.
   */
  static isInstance(object: unknown): object is TechnicalErrorResultDetails {
    return ObjectUtils.isInstanceOf(TechnicalErrorResultDetails, object);
  }

  /**
   * Instantiates a new `TechnicalErrorResultDetails`.
   * @param options The options for the error result details.
   */
  constructor(options: ErrorResultDetailsConstructorOptions) {
    super(options);
  }
}


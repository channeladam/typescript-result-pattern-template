// Types
import type { ApiErrorResultConstructorOptions, ErrorResultDetailsConstructorOptions } from '../result.types';
import type { StandardApiErrorResponse } from '../../apis/api.types';
import { ErrorResultDetailsDiscriminantTags } from '../error-result-details.types';

// Errors
import { AbstractErrorResultDetails } from './abstract-error-result-details';

// Utilities
import { ObjectUtils } from '../../objects/object.utilities';

/**
 * An error result that represents an API error.
 */
export class ApiErrorResultDetails extends AbstractErrorResultDetails {
  private _errorResponse: StandardApiErrorResponse;

  override readonly discriminantTag = ErrorResultDetailsDiscriminantTags.ApiError;
  override readonly name = ApiErrorResultDetails.name;

  /**
   * The error response.
   */
  get errorResponse(): StandardApiErrorResponse {
    return this._errorResponse;
  }

  /**
   * @returns true if the object is an instance of `ApiErrorResultDetails`.
   */
  static isInstance(object: unknown): object is ApiErrorResultDetails {
    return ObjectUtils.isInstanceOf(ApiErrorResultDetails, object);
  }
  
  /**
   * Instantiates a new `ApiErrorResultDetails`.
   * @param options The options for the error result details.
   * @param apiErrorResponse The API error response.
   */
  constructor(options: ApiErrorResultConstructorOptions, apiErrorResponse: StandardApiErrorResponse) {
    const constructorOptions: ErrorResultDetailsConstructorOptions = {
      context: options.context,
      errorCode: options.errorCode,
      errorMessage: apiErrorResponse.title ?? apiErrorResponse.detail,
      errorInstanceId: apiErrorResponse.instance,
      correlationId: options.correlationId,
    };
    super(constructorOptions);
    this._errorResponse = apiErrorResponse;
  }
}

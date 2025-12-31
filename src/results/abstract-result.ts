// Types
import type { AbstractErrorResultDetails } from "./error-result-details/abstract-error-result-details";
import type { Constructor } from "../objects/object.types";
import type { ResultDiscriminantTag } from "./result.types";

// Results (import types only to avoid circular dependencies)
import type { ErrorResult } from "./error-result";

// Error Result Details
import { ApiErrorResultDetails } from "./error-result-details/api-error-result-details";
import { AssertionFailedErrorResultDetails } from "./error-result-details/assertion-failed-error-result-details";
import { ShortCircuitedErrorResultDetails } from "./error-result-details/short-circuited-error-result-details";
import { TechnicalErrorResultDetails } from "./error-result-details/technical-error-result-details";
import { UserErrorResultDetails } from "./error-result-details/user-error-result-details";

// Utilities
import { ObjectUtils } from "../objects/object.utilities";

type ErrorResultDetailsConstructor<TMakesErrorDetails extends AbstractErrorResultDetails> = Constructor<TMakesErrorDetails>;

/**
 * Abstract base class for all results.
 */
export abstract class AbstractResult {
  abstract readonly discriminantTag: ResultDiscriminantTag;
  abstract readonly name: string;
  abstract readonly isError: boolean;
  abstract readonly isOk: boolean;
  abstract readonly errorDetails: AbstractErrorResultDetails | undefined;

  /**
   * @returns true if this result is an error result with the given error details constructor.
   */
  isErrorDetailsInstanceOf<TErrorDetails extends AbstractErrorResultDetails>(
    ctor: ErrorResultDetailsConstructor<TErrorDetails>
  ): this is ErrorResult<TErrorDetails> {
    return this.isError && ObjectUtils.isInstanceOf(ctor, this.errorDetails);
  }

  /**
   * @returns true if the result is an `ApiErrorResult`.
   */
  isApiError(): this is ErrorResult<ApiErrorResultDetails> {
    return this.isErrorDetailsInstanceOf(ApiErrorResultDetails);
  }

  /**
   * @returns true if the result is an `AssertionFailedErrorResult`.
   */
  isAssertionFailedError(): this is ErrorResult<AssertionFailedErrorResultDetails> {
    return this.isErrorDetailsInstanceOf(AssertionFailedErrorResultDetails);
  }

  /**
   * @returns true if the result is a `TechnicalErrorResult`.
   */
  isTechnicalError(): this is ErrorResult<TechnicalErrorResultDetails> {
    return this.isErrorDetailsInstanceOf(TechnicalErrorResultDetails);
  }

  /**
   * @returns true if the result is a `UserErrorResult`.
   */
  isUserError(): this is ErrorResult<UserErrorResultDetails> {
    return this.isErrorDetailsInstanceOf(UserErrorResultDetails);
  }

  /**
   * @returns true if the result is a `ShortCircuitedErrorResult`.
   */
  isShortCircuitedError(): this is ErrorResult<ShortCircuitedErrorResultDetails> {
    return this.isErrorDetailsInstanceOf(ShortCircuitedErrorResultDetails);
  }
}

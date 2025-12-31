// Types
import type { AbstractErrorResultDetails } from './error-result-details/abstract-error-result-details';
import { Result, type AllErrorResultDetails, type ErrorResultFactory, type ResultOperations } from './result.types';
import { ResultDiscriminantTags } from './result.types';
import type { StandardLogPropertiesCore } from '../logging/logging.types';

// Error Result Details
import type { TechnicalErrorResultDetails } from './error-result-details/technical-error-result-details';

// Results
import { AbstractResult } from './abstract-result';

/**
 * A Result Pattern result that represents an error.
 */
export class ErrorResult<TErrorDetails extends AbstractErrorResultDetails> extends AbstractResult
    implements ResultOperations<never, TErrorDetails> {
  override readonly discriminantTag = ResultDiscriminantTags.ErrorResult;
  override readonly name = ErrorResult.name;
  override readonly isError = true as const;    // NOTE: this also is a discriminant tag.
  override readonly isOk = false as const; // NOTE: this also is a discriminant tag.
  readonly errorDetails: TErrorDetails;

  /**
   * Instantiates a new `ErrorResult`.
   * @param errorDetails 
   */
  constructor(errorDetails: TErrorDetails) {
    super();
    this.errorDetails = errorDetails;
  }

  /**
   * @returns the result as a tuple of [value, errorDetails].
   * If the result is an ok result, the errorDetails will be undefined.
   * If the result is an error result, the value will be undefined.
   * 
   * @example
   * ```typescript
   * const okRes = Result.ok(42);
   * const [value, errorDetails] = okRes.toTuple(); // [42, undefined]
   * ```
   */
  toTuple(): [undefined, TErrorDetails] {
    return [undefined, this.errorDetails];
  }

  /**
   * @returns the unwrapped value if the result is an ok result, or null if the result is an error result.
   */
  valueOrNull(): null { 
    return null;
  }

  /**
   * @returns the unwrapped value if the result is an ok result, or undefined if the result is an error result.
   */
  valueOrUndefined(): undefined { 
    return undefined;
  }

  /**
   * @returns the unwrapped value if the result is an ok result, or the given default value if the result is an error result.
   * @param defaultValue The default value to return if the result is an error result.
   * @example
   * ```typescript
   * const okRes = Result.ok(42);
   * const v = okRes.valueOrDefault(0); // 42
   * ```
   */
  valueOrDefault<TDefault>(defaultValue: TDefault): TDefault {
    return defaultValue;
  }

  /**
   * @returns the unwrapped value if the result is an ok result, or throws an error created by the given error factory if the result is an error result.
   * @param errorFactory The error factory to create an error if the result is an error result.
   * @throws {Error}
   * @example
   * ```typescript
   * const okRes = Result.ok(42);
   * const v = okRes.valueOrThrow(() => new Error('nope')); // 42
   * ```
   */
  valueOrThrow(errorFactory: (errorDetails: TErrorDetails) => Error): never {
    throw errorFactory(this.errorDetails);
  }

  /**
   * @returns the unwrapped value if the result is an ok result, or returns the value from the given function if the result is an error result.
   * @param fn The function to call if the result is an error result. 
   * @example
   * ```typescript
   * const okRes = Result.ok(42);
   * const v = okRes.valueOrElse(() => 0); // 42
   * ```
   */
  valueOrElse<TElseReturn>(onError: (errorDetails: TErrorDetails) => TElseReturn): TElseReturn {
    return onError(this.errorDetails);
  }
  
  /**
   * @returns the unwrapped error details if the result is an error result, or null if the result is an ok result.
   */
  errorDetailsOrNull(): TErrorDetails {
    return this.errorDetails;
  }

  /**
   * @returns the unwrapped error details if the result is an error result, or undefined if the result is an ok result.
   */
  errorDetailsOrUndefined(): TErrorDetails {
    return this.errorDetails;
  }

  /**
   * @returns the unwrapped error details if the result is an error result, or the given default value if the result is an ok result.
   */
  errorDetailsOrDefault<TDefault>(_defaultValue: TDefault): TErrorDetails {
    return this.errorDetails;
  }

  /**
   * @returns the unwrapped error details if the result is an error result, or throws an error created by the given error factory if the result is an ok result.
   * @param errorFactory The error factory to create an error if the result is an ok result.
   * @throws {Error}
   */
  errorDetailsOrThrow(_errorFactory: () => Error): TErrorDetails {
    return this.errorDetails;
  }

  /**
   * @returns the unwrapped error details if the result is an error result, or the result of the given function if the result is an ok result.
   * @param onOk The function to call if the result is an ok result.
   * @example
   * ```typescript
   * const okRes = Result.ok(42);
   * const v = okRes.errorDetailsOrElse(() => 0); // 42
   * ```
   */
  errorDetailsOrElse<TElseReturn>(_onOk: () => TElseReturn): TErrorDetails {
    return this.errorDetails;
  }

  /**
   * A functional style method to process and unwrap a `Result` using callbacks (as opposed to using if/else branches to check isOk).
   * @param onOk The callback to call if the result is an ok result.
   *             If the callback throws an error, it is NOT caught, so it will be propagated.
   * @param onError The callback to call if the result is an error result.
   * @returns the result of the callback if the result is an ok result, or the result of the error callback if the result is an error result.
   * @example
   * ```typescript
   * const okRes = Result.ok(42);
   * const response = okRes.foldNoCatch(value => { isSuccess: true }, error => { isSuccess: false });
   * ```
   */
  foldNoCatch<TNextOkValue, TErrorReturn>(
    _onOk: (value: never) => TNextOkValue,
    onError: (error: TErrorDetails) => TErrorReturn,
  ): TErrorReturn {
    return onError(this.errorDetails);
  }

  /**
   * A functional style method to process and unwrap a `Result` using callbacks (as opposed to using if/else branches to check isOk).
   * @param logProperties The log properties to use for logging if the onOk callback throws an error. 
   * @param onOk The callback to call if the result is an ok result.
   *             If the callback throws an error, it is caught, logged at the Error level using the given log properties, and a TechnicalErrorResult is returned.
   * @param onError The callback to call if the result is an error result.
   */
  foldCatchDefault<TNextOkValue, TErrorReturn>(
    _logProperties: StandardLogPropertiesCore,
    _onOk: (value: never) => TNextOkValue,
    onError: (error: TErrorDetails) => TErrorReturn): TErrorReturn {
      return onError(this.errorDetails);
    }

  /**
   * A functional style method to process and unwrap a `Result` using callbacks (as opposed to using if/else branches to check isOk).
   * @param onOk The callback to call if the result is an ok result.
   *             If the callback throws an error, it is caught, and the value returned from the onOkErrorResultFactory is returned.
   * @param onOkErrorResultFactory The error result factory to create an error result if the onOk callback throws an error.
   * @param onError The callback to call if the result is an error result.
   * @example
   * ```typescript
   * const okRes = Result.ok(42);
   * const response = okRes.foldCatch(value => { isSuccess: true }, error => .......), error => { isSuccess: false });
   * ```
   */
  foldCatch<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails, TOnErrorReturn>(
    _onOk: (value: never) => TNextOkValue,
    _onOkErrorResultFactory: ErrorResultFactory<TNextErrorDetails>,
    onError: (error: TErrorDetails) => TOnErrorReturn): TOnErrorReturn {
      return onError(this.errorDetails);
    }

  /**
   * Map to transform the ok value of the result, leaving errors unchanged.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is NOT caught, so it will be propagated.
   * NOTE: In an error result, the implementation always retypes the Result to a different ok value type.
   */
  mapNoCatch<TNextOkValue>(_onOk: (value: never) => TNextOkValue): ErrorResult<TErrorDetails>;
  mapNoCatch<TNextOkValue>(_onOk: (value: never) => TNextOkValue): Result<TNextOkValue, TErrorDetails> {
    return this as unknown as Result<TNextOkValue, TErrorDetails>;
  }

  /**
   * Map to transform the ok value of the result, leaving errors unchanged.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught, logged at the Error level using the given log properties, and a TechnicalErrorResult is returned.
   * NOTE: In an error result, the implementation always retypes the Result to a different ok value type.
   */
  mapCatchDefault<TNextOkValue>(_logProperties: StandardLogPropertiesCore, _onOk: (value: never) => TNextOkValue): ErrorResult<TErrorDetails | TechnicalErrorResultDetails>;
  mapCatchDefault<TNextOkValue>(_logProperties: StandardLogPropertiesCore, _onOk: (value: never) => TNextOkValue): Result<TNextOkValue, TErrorDetails | TechnicalErrorResultDetails> {
    return this as unknown as Result<TNextOkValue, TErrorDetails>;
  }

  /**
   * Map to transform the ok value of the result, leaving errors unchanged.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught and the value from the given error result factory is returned.
   * NOTE: In an error result, the implementation always retypes the Result to a different ok value type.
   * @example
   * ```typescript
   * const okRes = Result.ok(42);
   * const v = okRes.mapCatch(value => value + 1, error => ......); // 43
   * ```
   */
  mapCatch<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    _onOk: (value: never) => TNextOkValue,
    _errorResultFactory: ErrorResultFactory<TNextErrorDetails>,
  ): ErrorResult<TNextErrorDetails | TErrorDetails>;
  mapCatch<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    _onOk: (value: never) => TNextOkValue,
    _errorResultFactory: ErrorResultFactory<TNextErrorDetails>,
  ): Result<TNextOkValue, TNextErrorDetails | TErrorDetails> {
    return this as unknown as Result<TNextOkValue, TErrorDetails>;
  }

  /**
   * Map to transform an error result to a different error details type, leaving successes unchanged.
   * NOTE: In an ok result, the implementation simply retypes the current ok result instance to a different error type.
   */
  mapError<TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    onError: (errorDetails: TErrorDetails) => TNextErrorDetails
  ): Result<never, TNextErrorDetails> {
    return new ErrorResult(onError(this.errorDetails));
  }

  /**
   * A monadic bind / flatMap operator to sequence/chain operations that each return a Result.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is NOT caught, so it will be propagated.
   * NOTE: In an error result, the implementation always returns the current error details - the same as map(). 
   */
  andThenNoCatch<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    _onOk: (value: never) => Result<TNextOkValue, TNextErrorDetails>
  ): Result<TNextOkValue, TNextErrorDetails> {
    return this as unknown as Result<TNextOkValue, TNextErrorDetails>;
  }

  /**
   * A monadic bind / flatMap operator to sequence/chain operations that each return a Result.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught, logged at the Error level using the given log properties, and a TechnicalErrorResult is returned.
   * NOTE: In an error result, the implementation always returns the current error details - the same as map(). 
   */
  andThenCatchDefault<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    _logProperties: StandardLogPropertiesCore,
    _onOk: (value: never) => Result<TNextOkValue, TNextErrorDetails>,
  ): Result<TNextOkValue, TNextErrorDetails | TechnicalErrorResultDetails> {
    return this as unknown as Result<TNextOkValue, TNextErrorDetails>;
  }

  /**
   * A monadic bind / flatMap operator to sequence/chain operations that each return a Result.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught and the value from the given error result factory is returned.
   * NOTE: In an error result, the implementation always returns the current error details - the same as map(). 
   */
  andThenCatch<TNextOkValue, TNextOkErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails, TErrorResultFactoryErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    _onOk: (value: never) => Result<TNextOkValue, TNextOkErrorDetails>,
    _errorResultFactory: ErrorResultFactory<TErrorResultFactoryErrorDetails>,
  ): Result<TNextOkValue, TNextOkErrorDetails | TErrorResultFactoryErrorDetails | TErrorDetails> {
    return this as unknown as Result<TNextOkValue, TErrorDetails>;
  }

  /**
   * A monadic bind / flatMap operator to sequence/chain operations that each return a Result.
   * This transforms an error result to a new result instance (success or error).
   * This can be used to perform compensation actions when an error result is encountered.
   * NOTE: In an ok result, the implementation simply retypes the current ok result instance to a different error type - same as mapError().
   * NOTE: In an error result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught and the value from the given error result factory is returned.
   */
  orElseNoCatch<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    onError: (errorDetails: TErrorDetails) => Result<TNextOkValue, TNextErrorDetails>,
  ): Result<TNextOkValue, TNextErrorDetails> {
    return onError(this.errorDetails);
  }

  /**
   * A monadic bind / flatMap operator to sequence/chain operations that each return a Result.
   * This transforms an error result to a new result instance (success or error).
   * This can be used to perform compensation actions when an error result is encountered.
   * NOTE: In an ok result, the implementation simply retypes the current ok result instance to a different error type - same as mapError().
   * NOTE: In an error result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught, logged at the Error level using the given log properties, and a TechnicalErrorResult is returned.
   */
  orElseCatchDefault<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    logProperties: StandardLogPropertiesCore,
    onError: (errorDetails: TErrorDetails) => Result<TNextOkValue, TNextErrorDetails>,
  ): Result<TNextOkValue, TNextErrorDetails | TechnicalErrorResultDetails> {
    try {
      return onError(this.errorDetails);
    } catch (err) {
      return Result.technicalError(logProperties, 'UNEXPECTED', err);
    }
  }

  /**
   * A monadic bind / flatMap operator to sequence/chain operations that each return a Result.
   * This transforms an error result to a new result instance (success or error).
   * This can be used to perform compensation actions when an error result is encountered.
   * NOTE: In an ok result, the implementation simply retypes the current ok result instance to a different error type - same as mapError().
   * NOTE: In an error result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught and the value from the given error result factory is returned.
   */
  orElseCatch<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails, TErrorResultFactoryErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    onError: (errorDetails: TErrorDetails) => Result<TNextOkValue, TNextErrorDetails>,
    errorResultFactory: ErrorResultFactory<TErrorResultFactoryErrorDetails>,
  ): Result<TNextOkValue, TNextErrorDetails | TErrorResultFactoryErrorDetails> {
    try {
      return onError(this.errorDetails);
    } catch (err) {
      return errorResultFactory(err);
    }
  }
}

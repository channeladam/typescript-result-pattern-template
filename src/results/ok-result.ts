// Types
import type { AbstractErrorResultDetails } from './error-result-details/abstract-error-result-details';
import { Result, type AllErrorResultDetails, type ErrorResultFactory, type ResultOperations } from './result.types';
import { ResultDiscriminantTags } from './result.types';
import type { StandardLogPropertiesCore } from '../logging/logging.types';

// Error Result Details
import type { TechnicalErrorResultDetails } from './error-result-details/technical-error-result-details';

// Results
import type { ErrorResult } from './error-result';
import { AbstractResult } from './abstract-result';

/**
 * A Result Pattern result that represents a successful outcome.
 */
export class OkResult<TOkValue> extends AbstractResult
    implements ResultOperations<TOkValue, AbstractErrorResultDetails> {
  private _value: TOkValue;

  override readonly discriminantTag = ResultDiscriminantTags.OkResult;
  override readonly name = OkResult.name;
  override readonly isError = false as const;  // NOTE: this also is a discriminant tag.
  override readonly isOk = true as const; // NOTE: this also is a discriminant tag.
  override readonly errorDetails = undefined;

  /**
   * The value of the ok result.
   */
  get value(): TOkValue {
    return this._value;
  }

  /**
   * Instantiates a new `OkResult`.
   * @param okValue The value of the ok result.
   */
  constructor(okValue: TOkValue) {
    super();
    this._value = okValue;
  }

  /**
   * @returns the result with a void ok value type.
   */
  toVoidResult(): OkResult<void> {
    return new OkResult<void>(undefined);
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
  toTuple(): [TOkValue | undefined, undefined] {
    return [this.value, undefined];
  }

  /**
   * @returns the unwrapped value if the result is an ok result, or null if the result is an error result.
   */
  valueOrNull(): TOkValue {
    return this.value;
  }

  /**
   * @returns the unwrapped value if the result is an ok result, or undefined if the result is an error result.
   */
  valueOrUndefined(): TOkValue {
    return this.value;
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
  valueOrDefault<TDefault>(defaultValue: TDefault): TOkValue {
    return this.value;
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
  valueOrThrow(errorFactory: (errorDetails: never) => Error): TOkValue {
    return this.value;
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
  valueOrElse<TElseReturn>(onError: (errorDetails: never) => TElseReturn): TOkValue {
    return this.value;
  }
  
  /**
   * @returns the unwrapped error details if the result is an error result, or null if the result is an ok result.
   */
  errorDetailsOrNull(): null {
    return null;
  }

  /**
   * @returns the unwrapped error details if the result is an error result, or undefined if the result is an ok result.
   */
  errorDetailsOrUndefined(): undefined {
    return undefined;
  }

  /**
   * @returns the unwrapped error details if the result is an error result, or the given default value if the result is an ok result.
   */
  errorDetailsOrDefault<TDefault>(defaultValue: TDefault): TDefault {
    return defaultValue;
  }

  /**
   * @returns the unwrapped error details if the result is an error result, or throws an error created by the given error factory if the result is an ok result.
   * @param errorFactory The error factory to create an error if the result is an ok result.
   * @throws {Error}
   */
  errorDetailsOrThrow(errorFactory: () => Error): never {
    throw errorFactory();
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
  errorDetailsOrElse<TElseReturn>(onOk: () => TElseReturn): TElseReturn {
    return onOk();
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
    onOk: (value: TOkValue) => TNextOkValue,
    onError: (error: never) => TErrorReturn,
  ): TNextOkValue | TErrorReturn {
    return onOk(this.value);
  }

  /**
   * A functional style method to process and unwrap a `Result` using callbacks (as opposed to using if/else branches to check isOk).
   * @param logProperties The log properties to use for logging if the onOk callback throws an error. 
   * @param onOk The callback to call if the result is an ok result.
   *             If the callback throws an error, it is caught, logged at the Error level using the given log properties, and a TechnicalErrorResult is returned.
   * @param onError The callback to call if the result is an error result.
   */
  foldCatchDefault<TNextOkValue, TErrorReturn>(
    logProperties: StandardLogPropertiesCore,
    onOk: (value: TOkValue) => TNextOkValue,
    onError: (error: never) => TErrorReturn
  ): TNextOkValue | ErrorResult<TechnicalErrorResultDetails> | TErrorReturn {
    try {
      return onOk(this.value);
    } catch (err) {
      return Result.technicalError(logProperties, 'UNEXPECTED', err);
    }
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
   * const response = okRes.foldCatch(value => { isSuccess: true }, error => ......, error => { isSuccess: false });
   * ```
   */
  foldCatch<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails, TOnErrorReturn>(
    onOk: (value: TOkValue) => TNextOkValue,
    onOkErrorResultFactory: ErrorResultFactory<TNextErrorDetails>,
    onError: (error: never) => TOnErrorReturn
  ): TNextOkValue | ErrorResult<TNextErrorDetails> | TOnErrorReturn {
    try {
      return onOk(this.value);
    } catch (err) {
      return onOkErrorResultFactory(err);
    }
  }

  /**
   * Map to transform the ok value of the result, leaving errors unchanged.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is NOT caught, so it will be propagated.
   * NOTE: In an error result, the implementation always retypes the Result to a different ok value type.
   */
  mapNoCatch<TNextOkValue>(onOk: (value: TOkValue) => TNextOkValue): Result<TNextOkValue>;
  mapNoCatch<TNextOkValue>(onOk: (value: TOkValue) => TNextOkValue): OkResult<TNextOkValue>{
    return new OkResult(onOk(this.value));
  }

  /**
   * Map to transform the ok value of the result, leaving errors unchanged.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught, logged at the Error level using the given log properties, and a TechnicalErrorResult is returned.
   * NOTE: In an error result, the implementation always retypes the Result to a different ok value type.
   */
  mapCatchDefault<TNextOkValue>(logProperties: StandardLogPropertiesCore, onOk: (value: TOkValue) => TNextOkValue): Result<TNextOkValue, TechnicalErrorResultDetails>;
  mapCatchDefault<TNextOkValue>(logProperties: StandardLogPropertiesCore, onOk: (value: TOkValue) => TNextOkValue): OkResult<TNextOkValue> | ErrorResult<TechnicalErrorResultDetails> {
    try {
      return new OkResult(onOk(this.value));
    } catch (err) {
      return Result.technicalError(logProperties, 'UNEXPECTED', err);
    }
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
    onOk: (value: TOkValue) => TNextOkValue,
    errorResultFactory: ErrorResultFactory<TNextErrorDetails>,
  ): Result<TNextOkValue, TNextErrorDetails>;
  mapCatch<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    onOk: (value: TOkValue) => TNextOkValue,
    errorResultFactory: ErrorResultFactory<TNextErrorDetails>,
  ): OkResult<TNextOkValue> | ErrorResult<TNextErrorDetails> {
    try {
      return new OkResult(onOk(this.value));
    } catch (err) {
      return errorResultFactory(err);
    }
  }

  /**
   * Map to transform an error result to a different error details type, leaving successes unchanged.
   * NOTE: In an ok result, the implementation simply retypes the current ok result instance to a different error type.
   */
  mapError<TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    onError: (errorDetails: never) => TNextErrorDetails
  ): Result<TOkValue, TNextErrorDetails> {
    return this as unknown as Result<TOkValue, TNextErrorDetails>;
  }

  /**
   * A monadic bind / flatMap operator to sequence/chain operations that each return a Result.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is NOT caught, so it will be propagated.
   * NOTE: In an error result, the implementation always returns the current error details - the same as map(). 
   */
  andThenNoCatch<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    onOk: (value: TOkValue) => Result<TNextOkValue, TNextErrorDetails>
  ): Result<TNextOkValue, TNextErrorDetails> {
    return onOk(this.value);
  }

  /**
   * A monadic bind / flatMap operator to sequence/chain operations that each return a Result.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught, logged at the Error level using the given log properties, and a TechnicalErrorResult is returned.
   * NOTE: In an error result, the implementation always returns the current error details - the same as map(). 
   */
  andThenCatchDefault<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    logProperties: StandardLogPropertiesCore,
    onOk: (value: TOkValue) => Result<TNextOkValue, TNextErrorDetails>,
  ): Result<TNextOkValue, TNextErrorDetails | TechnicalErrorResultDetails> {
    try {
      return onOk(this.value);
    } catch (err) {
      return Result.technicalError(logProperties, 'UNEXPECTED', err);
    }
  }

  /**
   * A monadic bind / flatMap operator to sequence/chain operations that each return a Result.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught and the value from the given error result factory is returned.
   * NOTE: In an error result, the implementation always returns the current error details - the same as map(). 
   */
  andThenCatch<TNextOkValue, TNextOkErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails, TErrorResultFactoryErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    onOk: (value: TOkValue) => Result<TNextOkValue, TNextOkErrorDetails>,
    errorResultFactory: ErrorResultFactory<TErrorResultFactoryErrorDetails>,
  ): Result<TNextOkValue, TNextOkErrorDetails | TErrorResultFactoryErrorDetails> {
    try {
      return onOk(this.value);
    } catch (err) {
      return errorResultFactory(err);
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
  orElseNoCatch<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    onError: (errorDetails: never) => Result<TNextOkValue, TNextErrorDetails>,
  ): Result<TOkValue | TNextOkValue, TNextErrorDetails> {
    return this as unknown as Result<TOkValue, TNextErrorDetails>;
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
    onError: (errorDetails: never) => Result<TNextOkValue, TNextErrorDetails>,
  ): Result<TOkValue | TNextOkValue, TNextErrorDetails | TechnicalErrorResultDetails> {
    return this as unknown as Result<TOkValue, TNextErrorDetails>;
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
    onError: (errorDetails: never) => Result<TNextOkValue, TNextErrorDetails>,
    errorResultFactory: ErrorResultFactory<TErrorResultFactoryErrorDetails>,
  ): Result<TOkValue | TNextOkValue, TNextErrorDetails | TErrorResultFactoryErrorDetails> {
    return this as unknown as Result<TOkValue, TNextErrorDetails>;
  }
}

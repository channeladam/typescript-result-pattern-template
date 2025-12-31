// Types
import type { StandardLogPropertiesCore } from '../logging/logging.types';

// Results (type only to avoid circular dependencies)
import type { ErrorResult } from './error-result';
import type { OkResult } from './ok-result';

// Error Result Details (type only to avoid circular dependencies)
import type { AbstractErrorResultDetails } from './error-result-details/abstract-error-result-details';
import type { ApiErrorResultDetails } from './error-result-details/api-error-result-details';
import type { AssertionFailedErrorResultDetails } from './error-result-details/assertion-failed-error-result-details';
import type { ShortCircuitedErrorResultDetails } from './error-result-details/short-circuited-error-result-details';
import type { TechnicalErrorResultDetails } from './error-result-details/technical-error-result-details';
import type { UserErrorResultDetails } from './error-result-details/user-error-result-details';

// Utilities
import { ResultFactory } from './result.factory';

/**
 * A union of all the ErrorResultDetails types.
 */
export type AllErrorResultDetails = AllStandardErrorResultDetails | AllCustomErrorResultDetails;

/**
 * A union of all the custom ErrorResultDetails types.
 */
type AllCustomErrorResultDetails = never; // TODO: Add your custom ErrorResultDetails types here. 

/**
 * A union of all the out of the box ErrorResultDetails types.
 */
type AllStandardErrorResultDetails =
  | ApiErrorResultDetails
  | AssertionFailedErrorResultDetails
  | ShortCircuitedErrorResultDetails
  | TechnicalErrorResultDetails
  | UserErrorResultDetails;

/**
 * A factory function to create an `ErrorResult`.
 */
export type ErrorResultFactory<TErrorDetails extends AbstractErrorResultDetails> = (err: unknown) => ErrorResult<TErrorDetails>;

/**
 * A namespace for Result types.
 */
export namespace Result {
  export type Ok<TOkValue> = OkResult<TOkValue>;
  export type Error<TErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails> = ErrorResult<TErrorDetails>; 
}

/**
 * The main `Result` type to return from your synchronous functions.
 * NOTE: the check on `never` unfortunately makes `Result.Ok<number> | Result.Error<BlahErrorDetails>`
 *       NOT assignable to `Result<number, BlahErrorDetails>`, but it does make it more correct.
 */
export type Result<TOkValue, TErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails> =
  [TOkValue] extends [never]
    ? Result.Error<TErrorDetails>
    : Result.Ok<TOkValue> | Result.Error<TErrorDetails>;

/**
 * The main `Result` value that you will use - an shorter alias for the ResultFactory.
 */
export const Result = ResultFactory;

/**
 * Constant values for all the result discriminant tags.
 */
export const ResultDiscriminantTags = { 
  OkResult: 'OkResult',
  ErrorResult: 'ErrorResult',
} as const;

/**
 * A type for all the Result discriminant tags.
 */
export type ResultDiscriminantTag = typeof ResultDiscriminantTags[keyof typeof ResultDiscriminantTags];

/**
 * The main `Result` type to return from your asynchronous functions.
 */
export type AsyncResult<TOkValue, TErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails> = Promise<Result<TOkValue, TErrorDetails>>;

/**
 * A convenience type for `Result` with an `ApiErrorResultDetails` error details.
 */
export type ApiResult<TOkValue> = Result<TOkValue, ApiErrorResultDetails>;

/**
 * Options for creating an `error result details`.
 */
export type ErrorResultDetailsConstructorOptions = StandardLogPropertiesCore & {
  /**
   * A code that represents the error.
   */
  errorCode?: string | undefined;

  /** 
   * Human-readable description of the error.
   */
  errorMessage?: string | undefined;
}

/**
 * Options for creating an `api error` result in the Result Factory.
 * NOTE: The HttpApiProblemDetails type contains an instanceId and the title which maps to errorInstanceId and errorMessage.
 */
export type ApiErrorResultConstructorOptions = Omit<ErrorResultDetailsConstructorOptions, 'errorInstanceId' | 'errorMessage'>;

/**
 * Options for logging when creating an `error` result in the Result Factory.
 */
export type ErrorResultFactoryLoggingOptions = {
  /**
   * Whether to write to the log.
   */
  log?: boolean;
};

/**
 * All default options for creating an `error` result in the Result Factory (with logging).
 */
export type DefaultErrorResultFactoryOptions = StandardLogPropertiesCore & ErrorResultFactoryLoggingOptions;

// /**
//  * All default options for creating an `error` result in the Result Factory (without performing logging).
//  */
// export type DefaultErrorResultFactoryOptionsWithoutLogging = StandardLogPropertiesCore;

/**
 * Options for creating an `api error` result in the Result Factory (with logging).
 * NOTE: The HttpApiProblemDetails type contains an instanceId and the title which maps to errorInstanceId and errorMessage.
 */
export type ApiErrorResultFactoryOptions = ApiErrorResultConstructorOptions & ErrorResultFactoryLoggingOptions;

/**
 * Options for creating an `api error` result in the Result Factory (without performing logging).
 * NOTE: The HttpApiProblemDetails type contains an instanceId and the title which maps to errorInstanceId and errorMessage.
 */
export type ApiErrorResultFactoryOptionsWithoutLogging = ApiErrorResultConstructorOptions;

/**
 * An interface for methods to operate on a `Result`.
 */
export interface ResultOperations<TOkValue, TErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails> {
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
  toTuple(): [TOkValue | undefined, TErrorDetails | undefined];

  /**
   * @returns the unwrapped value if the result is an ok result, or null if the result is an error result.
   */
  valueOrNull(): TOkValue | null;

  /**
   * @returns the unwrapped value if the result is an ok result, or undefined if the result is an error result.
   */
  valueOrUndefined(): TOkValue | undefined;

  /**
   * @returns the unwrapped value if the result is an ok result, or the given default value if the result is an error result.
   * @param defaultValue The default value to return if the result is an error result.
   * @example
   * ```typescript
   * const okRes = Result.ok(42);
   * const v = okRes.valueOrDefault(0); // 42
   * ```
   */
  valueOrDefault<TDefault>(defaultValue: TDefault): TOkValue | TDefault;

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
  valueOrThrow(errorFactory: (errorDetails: TErrorDetails) => Error): TOkValue | never;

  /**
   * @returns the unwrapped value if the result is an ok result, or returns the value from the given function if the result is an error result.
   * @param fn The function to call if the result is an error result. 
   * @example
   * ```typescript
   * const okRes = Result.ok(42);
   * const v = okRes.valueOrElse(() => 0); // 42
   * ```
   */
  valueOrElse<TElseReturn>(onError: (errorDetails: TErrorDetails) => TElseReturn): TOkValue | TElseReturn;
  
  /**
   * @returns the unwrapped error details if the result is an error result, or null if the result is an ok result.
   */
  errorDetailsOrNull(): TErrorDetails | null;

  /**
   * @returns the unwrapped error details if the result is an error result, or undefined if the result is an ok result.
   */
  errorDetailsOrUndefined(): TErrorDetails | undefined;

  /**
   * @returns the unwrapped error details if the result is an error result, or the given default value if the result is an ok result.
   */
  errorDetailsOrDefault<TDefault>(defaultValue: TDefault): TErrorDetails | TDefault;

  /**
   * @returns the unwrapped error details if the result is an error result, or throws an error created by the given error factory if the result is an ok result.
   * @param errorFactory The error factory to create an error if the result is an ok result.
   * @throws {Error}
   */
  errorDetailsOrThrow(errorFactory: () => Error): TErrorDetails | never;

  /**
   * @returns the unwrapped error details if the result is an error result, or the result of the given function if the result is an ok result.
   * @param onOk The function to call if the result is an ok result.
   * @example
   * ```typescript
   * const okRes = Result.ok(42);
   * const v = okRes.errorDetailsOrElse(() => 0); // 42
   * ```
   */
  errorDetailsOrElse<TElseReturn>(onOk: () => TElseReturn): TErrorDetails | TElseReturn;

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
    onError: (error: TErrorDetails) => TErrorReturn,
  ): TNextOkValue | TErrorReturn;

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
    onError: (error: TErrorDetails) => TErrorReturn): TNextOkValue | ErrorResult<TechnicalErrorResultDetails> | TErrorReturn;

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
    onError: (error: TErrorDetails) => TOnErrorReturn): TNextOkValue | ErrorResult<TNextErrorDetails> | TOnErrorReturn;

  /**
   * Map to transform the ok value of the result, leaving errors unchanged.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is NOT caught, so it will be propagated.
   * NOTE: In an error result, the implementation always retypes the Result to a different ok value type.
   */
  mapNoCatch<TNextOkValue>(onOk: (value: TOkValue) => TNextOkValue): Result<TNextOkValue, TErrorDetails>;
  mapNoCatch<TNextOkValue>(onOk: (value: TOkValue) => TNextOkValue): OkResult<TNextOkValue> | ErrorResult<TErrorDetails>;

  /**
   * Map to transform the ok value of the result, leaving errors unchanged.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught, logged at the Error level using the given log properties, and a TechnicalErrorResult is returned.
   * NOTE: In an error result, the implementation always retypes the Result to a different ok value type.
   */
  mapCatchDefault<TNextOkValue>(logProperties: StandardLogPropertiesCore, onOk: (value: TOkValue) => TNextOkValue): Result<TNextOkValue, TErrorDetails | TechnicalErrorResultDetails>;
  mapCatchDefault<TNextOkValue>(logProperties: StandardLogPropertiesCore, onOk: (value: TOkValue) => TNextOkValue): OkResult<TNextOkValue> | ErrorResult<TErrorDetails | TechnicalErrorResultDetails>;

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
  ): Result<TNextOkValue, TNextErrorDetails | TErrorDetails>;
  mapCatch<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    onOk: (value: TOkValue) => TNextOkValue,
    errorResultFactory: ErrorResultFactory<TNextErrorDetails>,
  ): OkResult<TNextOkValue> | ErrorResult<TNextErrorDetails | TErrorDetails>;

  /**
   * Map to transform an error result to a different error details type, leaving successes unchanged.
   * NOTE: In an ok result, the implementation simply retypes the current ok result instance to a different error type.
   */
  mapError<TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    onError: (errorDetails: TErrorDetails) => TNextErrorDetails
  ): Result<TOkValue, TNextErrorDetails>;

  /**
   * A monadic bind / flatMap operator to sequence/chain operations that each return a Result.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is NOT caught, so it will be propagated.
   * NOTE: In an error result, the implementation always returns the current error details - the same as map(). 
   */
  andThenNoCatch<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    onOk: (value: TOkValue) => Result<TNextOkValue, TNextErrorDetails>
  ): Result<TNextOkValue, TNextErrorDetails>;

  /**
   * A monadic bind / flatMap operator to sequence/chain operations that each return a Result.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught, logged at the Error level using the given log properties, and a TechnicalErrorResult is returned.
   * NOTE: In an error result, the implementation always returns the current error details - the same as map(). 
   */
  andThenCatchDefault<TNextOkValue, TNextErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    logProperties: StandardLogPropertiesCore,
    onOk: (value: TOkValue) => Result<TNextOkValue, TNextErrorDetails>,
  ): Result<TNextOkValue, TNextErrorDetails | TechnicalErrorResultDetails>;

  /**
   * A monadic bind / flatMap operator to sequence/chain operations that each return a Result.
   * NOTE: In an ok result, the implementation always calls the given function.
   *       If an error is thrown in the given function, it is caught and the value from the given error result factory is returned.
   * NOTE: In an error result, the implementation always returns the current error details - the same as map(). 
   */
  andThenCatch<TNextOkValue, TNextOkErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails, TErrorResultFactoryErrorDetails extends AbstractErrorResultDetails = AllErrorResultDetails>(
    onOk: (value: TOkValue) => Result<TNextOkValue, TNextOkErrorDetails>,
    errorResultFactory: ErrorResultFactory<TErrorResultFactoryErrorDetails>,
  ): Result<TNextOkValue, TNextOkErrorDetails | TErrorResultFactoryErrorDetails | TErrorDetails>;

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
  ): Result<TOkValue | TNextOkValue, TNextErrorDetails>;

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
  ): Result<TOkValue | TNextOkValue, TNextErrorDetails | TechnicalErrorResultDetails>;

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
  ): Result<TOkValue | TNextOkValue, TNextErrorDetails | TErrorResultFactoryErrorDetails>;
}
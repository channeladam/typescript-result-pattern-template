import type { AbstractErrorResultDetails } from './error-result-details/abstract-error-result-details';
import type { ApiErrorResultFactoryOptions, ApiErrorResultFactoryOptionsWithoutLogging, AsyncResult, DefaultErrorResultFactoryOptions, ErrorResultDetailsConstructorOptions, ErrorResultFactory } from './result.types';
import type { AnyAsyncFunction, AnyFunction, NotError } from '../objects/object.types';
import type { Result } from './result.types';
import type { StandardApiErrorResponse } from '../apis/api.types';
import type { StandardLogPropertiesCore } from '../logging/logging.types';

// Errors
import { AssertionFailedError } from '../errors/assertion-failed-error';

// Results
import { ErrorResult } from './error-result';
import { OkResult } from './ok-result';

// Error Result Details
import { ApiErrorResultDetails } from './error-result-details/api-error-result-details';
import { AssertionFailedErrorResultDetails } from './error-result-details/assertion-failed-error-result-details';
import { ShortCircuitedErrorResultDetails } from './error-result-details/short-circuited-error-result-details';
import { TechnicalErrorResultDetails } from './error-result-details/technical-error-result-details';
import { UserErrorResultDetails } from './error-result-details/user-error-result-details';

// Utilities
import { ErrorUtils } from '../errors/error.utilities';
import { LOG } from '../logging/logging.utilities';
import { ObjectUtils } from '../objects/object.utilities';

const classContext = 'ResultFactory';

/**
 * Factory functions to create instances of Result Pattern Results.
 */
export abstract class ResultFactory {
  /**
   * Creates a Result Pattern OkResult (does not log).
   */
  static ok<TOkValue>(okValue: TOkValue): OkResult<TOkValue> {
    return new OkResult<TOkValue>(okValue);
  }

  /**
   * Creates a Result Pattern ErrorResult with ApiErrorResultDetails (does not log).
   */
  static apiErrorNoLog(options: ApiErrorResultFactoryOptionsWithoutLogging, errorDetails: StandardApiErrorResponse): ErrorResult<ApiErrorResultDetails> {
    return new ErrorResult<ApiErrorResultDetails>(new ApiErrorResultDetails(options, errorDetails));
  }

  /**
   * Creates a Result Pattern ErrorResult with ApiErrorResultDetails (and logs at the Error level if options.log is not false).
   * NOTE: Only call this if you have already inspected the HTTP status code and error details and you are sure that you want to log the API error for the support team to investigate.
   */
  static apiError(options: ApiErrorResultFactoryOptions, errorDetails: StandardApiErrorResponse): ErrorResult<ApiErrorResultDetails> {
    if (options.log !== false) {
      // LOG the API error (so it possibly can be sent to a logging service for monitoring by the support team)
      const contextPrefix = `${classContext} - ApiErrorResult`;
      const amendedOptions = {
        ...options,
        context: options.context ? [contextPrefix, ...options.context] : [contextPrefix],
      };
      const amendedParams = [`ErrorCode: ${options.errorCode}`];
      LOG.apiError(amendedOptions, errorDetails, ...amendedParams);
    }

    return new ErrorResult<ApiErrorResultDetails>(new ApiErrorResultDetails(options, errorDetails));
  }

  /**
   * Creates a Result Pattern ErrorResult with AssertionFailedErrorResultDetails (and logs at the Error level if options.log is not false).
   */
  static assertionFailedError(
    options: DefaultErrorResultFactoryOptions,
    errorCode: string | undefined,
    assertionFailedErrorMessage: string | Error | NotError<Record<string, unknown>> | unknown | undefined,
    ...optionalParams: NotError<unknown>[]
  ): ErrorResult<AssertionFailedErrorResultDetails> {
    if (options.log !== false) {
      // LOG the error (so it possibly can be sent to a logging service for monitoring by the support team)
      const contextPrefix = `${classContext} - AssertionFailedErrorResult`;
      const amendedOptions = {
        ...options,
        context: options.context ? [contextPrefix, ...options.context] : [contextPrefix],
      };
      const amendedParams = [`ErrorCode: ${errorCode}`, ...optionalParams];
      LOG.assertionFailed(amendedOptions, assertionFailedErrorMessage, ...amendedParams);
    }

    const createOptions = this._createErrorResultConstructorOptions(options, errorCode, assertionFailedErrorMessage, optionalParams);
    return new ErrorResult<AssertionFailedErrorResultDetails>(new AssertionFailedErrorResultDetails(createOptions));
  }

  /**
   * Creates a Result Pattern ErrorResult with TechnicalErrorResultDetails (and logs at the Error level if options.log is not false).
   */
  static technicalError(
    options: DefaultErrorResultFactoryOptions,
    errorCode: string | undefined,
    technicalErrorMessage: string | Error | NotError<Record<string, unknown>> | unknown | undefined,
    ...optionalParams: NotError<unknown>[]
  ): ErrorResult<TechnicalErrorResultDetails> {
    if (options.log !== false) {
      // LOG the error (so it possibly can be sent to a logging service for monitoring by the support team)
      const contextPrefix = `${classContext} - TechnicalErrorResult`;
      const amendedOptions = {
        ...options,
        context: options.context ? [contextPrefix, ...options.context] : [contextPrefix],
      };
      const amendedParams = [`ErrorCode: ${errorCode}`, ...optionalParams];
      LOG.technicalError(amendedOptions, technicalErrorMessage, ...amendedParams);
    }

    const createOptions = this._createErrorResultConstructorOptions(options, errorCode, technicalErrorMessage, optionalParams);
    return new ErrorResult<TechnicalErrorResultDetails>(new TechnicalErrorResultDetails(createOptions));
  }

  /**
   * Creates a Result Pattern ErrorResult with UserErrorResultDetails (and logs at the Debug level if options.log is not false).
   */
  static userError(
    options: DefaultErrorResultFactoryOptions,
    errorCode: string | undefined,
    userErrorMessage: string
  ): ErrorResult<UserErrorResultDetails> {
    if (options.log !== false) {
      const contextPrefix = `${classContext} - UserErrorResult`;
      const amendedOptions = {
        ...options,
        context: options.context ? [contextPrefix, ...options.context] : [contextPrefix],
      };
      const amendedParams = [`ErrorCode: ${errorCode}`];
      LOG.debug(amendedOptions, userErrorMessage, ...amendedParams);
    }

    const createOptions = this._createErrorResultConstructorOptions(options, errorCode, userErrorMessage, []);
    return new ErrorResult<UserErrorResultDetails>(new UserErrorResultDetails(createOptions));
  }

  /**
   * Creates a Result Pattern ErrorResult with ShortCircuitedErrorResultDetails (and logs at the Debug level if options.log is not false).
   */
  static shortCircuitedError(
    options: DefaultErrorResultFactoryOptions,
    errorCode: string | undefined,
    shortCircuitedErrorMessage: string
  ): ErrorResult<ShortCircuitedErrorResultDetails> {
    if (options.log !== false) {
      const contextPrefix = `${classContext} - ShortCircuitedErrorResult`;
      const amendedOptions = {
        ...options,
        context: options.context ? [contextPrefix, ...options.context] : [contextPrefix],
      };
      const amendedParams = [`ErrorCode: ${errorCode}`];
      LOG.debug(amendedOptions, shortCircuitedErrorMessage, ...amendedParams);
    }

    const createOptions = this._createErrorResultConstructorOptions(options, errorCode, shortCircuitedErrorMessage, []);
    return new ErrorResult<ShortCircuitedErrorResultDetails>(new ShortCircuitedErrorResultDetails(createOptions));
  }

  /**
   * Creates a Result Pattern `Result` from the given error object (and logs at the Error level).
   */
  static fromErrorObject(logProperties: StandardLogPropertiesCore, err: unknown): Result<never, AssertionFailedErrorResultDetails | TechnicalErrorResultDetails> {
    if (ObjectUtils.isNullOrUndefined(err) || !ObjectUtils.isTypeOfObject(err)) {
      return ResultFactory.technicalError(logProperties, /* errorCode */ undefined, ErrorUtils.toErrorString(err));
    }

    if (AssertionFailedError.isInstance(err)) {
      return ResultFactory.assertionFailedError(logProperties, /* errorCode */ undefined, err);
    }

    return ResultFactory.technicalError(logProperties, /* errorCode */ undefined, ErrorUtils.toErrorString(err));
  }

  /**
   * Creates a Result Pattern `Result` from executing the given synchronous function.
   * If the function throws an error, it is caught, logged (at the Error level) and returned as an ErrorResult with TechnicalErrorResultDetails or AssertionFailedErrorResultDetails.
   */
  static tryCatchDefault<TOkValue>( 
    logProperties: StandardLogPropertiesCore,
    fn: () => TOkValue
  ): Result<TOkValue, AssertionFailedErrorResultDetails | TechnicalErrorResultDetails>;
  static tryCatchDefault<TOkValue>( 
    logProperties: StandardLogPropertiesCore,
    fn: () => TOkValue
  ): OkResult<TOkValue> | ErrorResult<AssertionFailedErrorResultDetails | TechnicalErrorResultDetails> {
    try {
      return ResultFactory.ok(fn());
    } catch (err: unknown) {
      return this.fromErrorObject(logProperties, err);
    }
  }

  /**
   * Creates a Result Pattern `Result` from executing the given asynchronous function.
   * If the function throws an error, it is caught, logged (at the Error level) and returned as an ErrorResult with TechnicalErrorResultDetails or AssertionFailedErrorResultDetails.
   */
  static async tryCatchDefaultAsync<TOkValue>( 
    logProperties: StandardLogPropertiesCore,
    fn: () => Promise<TOkValue>
  ): AsyncResult<TOkValue, AssertionFailedErrorResultDetails | TechnicalErrorResultDetails>;
  static async tryCatchDefaultAsync<TOkValue>( 
    logProperties: StandardLogPropertiesCore,
    fn: () => Promise<TOkValue>
  ): Promise<OkResult<TOkValue> | ErrorResult<AssertionFailedErrorResultDetails | TechnicalErrorResultDetails>> {
    try {
      return ResultFactory.ok(await fn());
    } catch (err: unknown) {
      return this.fromErrorObject(logProperties, err);
    }
  }

  /**
   * Creates a Result Pattern `Result` from executing the given synchronous function.
   * If the function throws an error, it is caught and the given error result factory is called.
   */
  static tryCatch<TOkValue, TErrorDetails extends AbstractErrorResultDetails>( 
    fn: () => TOkValue,
    errorResultFactory: ErrorResultFactory<TErrorDetails>,
  ): Result<TOkValue, TErrorDetails>;
  static tryCatch<TOkValue, TErrorDetails extends AbstractErrorResultDetails>( 
    fn: () => TOkValue,
    errorResultFactory: ErrorResultFactory<TErrorDetails>,
  ): OkResult<TOkValue> | ErrorResult<TErrorDetails> {
    try {
      return ResultFactory.ok(fn());
    } catch (err: unknown) {
      return errorResultFactory(err);
    }
  }

  /**
   * Creates a Result Pattern `Result` from executing the given asynchronous function.
   * If the function throws an error, it is caught and the given error result factory is called.
   */
  static async tryCatchAsync<TOkValue, TErrorDetails extends AbstractErrorResultDetails>( 
    fn: () => Promise<TOkValue>,
    errorResultFactory: ErrorResultFactory<TErrorDetails>,
  ): AsyncResult<TOkValue, TErrorDetails>;
  static async tryCatchAsync<TOkValue, TErrorDetails extends AbstractErrorResultDetails>( 
    fn: () => Promise<TOkValue>,
    errorResultFactory: ErrorResultFactory<TErrorDetails>,
  ): Promise<OkResult<TOkValue> | ErrorResult<TErrorDetails>> {
    try {
      return ResultFactory.ok(await fn());
    } catch (err: unknown) {
      return errorResultFactory(err);
    }
  }

  /**
   * @returns a function that wraps the given function in a try-catch block. If the function throws an error, it is caught, logged at the Error level and the default error result factory is called.
   * 
   * @param logProperties the log properties to use when logging the error
   * @param fn the function to wrap 
   */
  static wrapDefault<TFunction extends AnyFunction>(
    logProperties: StandardLogPropertiesCore,
    fn: TFunction
  ): (...args: Parameters<TFunction>) => Result<ReturnType<TFunction>, AssertionFailedErrorResultDetails | TechnicalErrorResultDetails>;
  static wrapDefault<TFunction extends AnyFunction>(
    logProperties: StandardLogPropertiesCore,
    fn: TFunction
  ): (...args: Parameters<TFunction>) => OkResult<ReturnType<TFunction>> | ErrorResult<AssertionFailedErrorResultDetails | TechnicalErrorResultDetails> {
    return function wrapped(...args: Parameters<TFunction>) {
      return ResultFactory.tryCatchDefault(logProperties, () => fn(...args));
    };
  }

  /**
   * @returns a function that wraps the given function in a try-catch block. If the function throws an error, it is caught, logged at the Error level and the default error result factory is called.
   * 
   * @param logProperties the log properties to use when logging the error
   * @param fn the function to wrap 
   */
  static wrapDefaultAsync<TFunction extends AnyAsyncFunction>(
    logProperties: StandardLogPropertiesCore,
    fn: TFunction
  ): (...args: Parameters<TFunction>) => AsyncResult<Awaited<ReturnType<TFunction>>, AssertionFailedErrorResultDetails | TechnicalErrorResultDetails>;
  static wrapDefaultAsync<TFunction extends AnyAsyncFunction>(
    logProperties: StandardLogPropertiesCore,
    fn: TFunction
  ): (...args: Parameters<TFunction>) => Promise<OkResult<Awaited<ReturnType<TFunction>>> | ErrorResult<AssertionFailedErrorResultDetails | TechnicalErrorResultDetails>> {
    return function wrappedAsync(...args: Parameters<TFunction>) {
      return ResultFactory.tryCatchDefaultAsync(logProperties, () => fn(...args));
    };
  }

  /**
   * @returns a function that wraps the given function in a try-catch block. If the function throws an error, it is caught and the given error result factory is called.
   * It is the responsibility of the errorResultFactory to log the error appropriately.
   * 
   * @param fn the function to wrap 
   * @param errorResultFactory optional error result factory to use when the function throws an error
   */
  static wrap<TFunction extends AnyFunction, TErrorDetails extends AbstractErrorResultDetails>(
    fn: TFunction,
    errorResultFactory: ErrorResultFactory<TErrorDetails>
  ): (...args: Parameters<TFunction>) => Result<ReturnType<TFunction>, TErrorDetails>;
  static wrap<TFunction extends AnyFunction, TErrorDetails extends AbstractErrorResultDetails>(
    fn: TFunction,
    errorResultFactory: ErrorResultFactory<TErrorDetails>
  ): (...args: Parameters<TFunction>) => OkResult<ReturnType<TFunction>> | ErrorResult<TErrorDetails> {
    return function wrapped(...args: Parameters<TFunction>) {
      return ResultFactory.tryCatch(() => fn(...args), errorResultFactory);
    };
  }

  /**
   * @returns a function that wraps the given function in a try-catch block. If the function throws an error, it is caught and the given error result factory is called.
   * It is the responsibility of the errorResultFactory to log the error appropriately.
   * 
   * @param logProperties the log properties to use when logging the error
   * @param errorResultFactory optional error result factory to use when the function throws an error
   */
  static wrapAsync<TFunction extends AnyAsyncFunction, TErrorDetails extends AbstractErrorResultDetails>(
    fn: TFunction,
    errorResultFactory: ErrorResultFactory<TErrorDetails>
  ): (...args: Parameters<TFunction>) => AsyncResult<Awaited<ReturnType<TFunction>>, TErrorDetails>;
  static wrapAsync<TFunction extends AnyAsyncFunction, TErrorDetails extends AbstractErrorResultDetails>(
    fn: TFunction,
    errorResultFactory: ErrorResultFactory<TErrorDetails>
  ): (...args: Parameters<TFunction>) => Promise<OkResult<Awaited<ReturnType<TFunction>>> | ErrorResult<TErrorDetails>> {
    return function wrappedAsync(...args: Parameters<TFunction>) {
      return ResultFactory.tryCatchAsync(() => fn(...args), errorResultFactory);
    };
  }

  /**
   * Creates a Result Pattern ErrorResult constructor options object.
   * @param options 
   * @param errorCode 
   * @param assertionFailedErrorMessage 
   * @param optionalParams 
   * @returns 
   */
  private static _createErrorResultConstructorOptions(
    options: DefaultErrorResultFactoryOptions,
    errorCode: string | undefined,
    assertionFailedErrorMessage: string | Error | NotError<Record<string, unknown>> | unknown | undefined,
    optionalParams: NotError<unknown>[]    
  ): ErrorResultDetailsConstructorOptions {
    // Format the error message and optional parameters
    let formattedMessage = ErrorUtils.toErrorString(assertionFailedErrorMessage);
    if (optionalParams?.length > 0) {
      formattedMessage += ` - ${ErrorUtils.toErrorString(optionalParams)}`;
    }

    const createOptions: ErrorResultDetailsConstructorOptions = {
      context: options.context,
      errorInstanceId: options.errorInstanceId,
      errorMessage: formattedMessage,
      errorCode,
      correlationId: options.correlationId,
    }

    return createOptions;
  }
}

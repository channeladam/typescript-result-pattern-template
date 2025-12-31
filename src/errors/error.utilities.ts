// Types
import type { NotError } from '../objects/object.types';
import type { StandardLogPropertiesCore } from '../logging/logging.types';

// Errors
import { AssertionFailedError } from './assertion-failed-error';
import { UnreachableError } from './unreachable-error';

// Utilities
import { LOG, LoggingUtils } from '../logging/logging.utilities';
import { StringUtils } from '../string.utilities';
 
type ErrorMessage = string | Error | NotError<Record<string, unknown>> | unknown | undefined;

/**
 * Error-related utility functions.
 * Customize this class to add your own error utilities.
 */
export abstract class ErrorUtils {
  private static readonly _errorInstanceIdCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  /**
   * Creates a random error instance identifier / support reference identifier.
   */
  static createErrorInstanceId(): string {
    const pickCharacter = () =>
      ErrorUtils._errorInstanceIdCharacters[Math.floor(Math.random() * ErrorUtils._errorInstanceIdCharacters.length)];

    const c1 = pickCharacter();
    const c2 = pickCharacter();
    const c3 = pickCharacter();
    const c4 = pickCharacter();
    const c5 = pickCharacter();
    const c6 = pickCharacter();
    const c7 = pickCharacter();
    const c8 = pickCharacter();

    return `${c1}${c2}${c3}${c4}-${c5}${c6}${c7}${c8}`;
  }

  /**
   * Converts a given value caught in a try/catch to a string.
   * @param error
   * @returns string
   */
  static toErrorString(error: unknown): string {
    if (StringUtils.isString(error)) return String(error);

    // NOTE: The `Error` object does NOT behave like a normal object and does not serialize with JSON.stringify().
    if (error instanceof Error)
      return JSON.stringify({
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause,
      });

    try {
      return JSON.stringify(error);
    } catch {
      // NOTE: An error could be thrown if the object has a circular reference.
      return String(error);
    }
  }

  /**
   * A function that should never be called, and should never return.
   * NOTE: putting this function inside a class/object (unless it is static) prevents Typescript from truly understanding the control flow and that it does not return (as per the `never` return type).
   *       That is why it is static in this utility class.
   * 
   * @throws {UnreachableError}
   */
  static throwUnreachableError(): never {
    throw new UnreachableError();
  }

  /**
   * Throws an error with the given technical message (and logs it). Never returns.
   * NOTE: putting this function inside a class/object (unless it is static) prevents Typescript from truly understanding the control flow and that it does not return (as per the `never` return type).
   *       That is why it is static in this utility class.
   *
   * @throws {AssertionFailedError}
   */
  static throwAssertionFailedError(
    context: string | StandardLogPropertiesCore,
    technicalMessage?: ErrorMessage,
    ...optionalParams: NotError<unknown>[]
  ): never {
    // LOG the technical error (to a logging service for monitoring by a support team)
    LOG.assertionFailed(context, technicalMessage, ...optionalParams);

    // throw
    const formattedContext = LoggingUtils.formatLogPropertiesCallerContext(context);
    let formattedMessage = ErrorUtils.toErrorString(`${formattedContext} - ${technicalMessage}`);
    if (optionalParams?.length > 0) {
      formattedMessage += ` - ${ErrorUtils.toErrorString(optionalParams)}`;
    }
    throw new AssertionFailedError(formattedMessage);
  }

  // /**
  //  * Throws a blah error...
  //  */
  // static throwMyBlahError(
  //   context: string | StandardLogPropertiesCore,
  //   message?: ErrorMessage,
  //   ...optionalParams: NotError<unknown>[]
  // ): never {
  //   LOG.blah(context, message, ...optionalParams);
  //   ...
  //   throw new MyBlahError(formattedMessage);
  // } 
}

// Types
import type { Logger, StandardLogPropertiesCore } from "./logging.types";
import type { NotError } from "../objects/object.types";
import type { StandardApiErrorResponse } from "../apis/api.types";

// Utilities
import { ErrorUtils } from "../errors/error.utilities";
import { LoggingUtils } from "./logging.utilities";
import { StringUtils } from "../string.utilities";

/**
 * A class used to log messages to the console.
 */
export class ConsoleLogger implements Logger {
  /**
   *
   */
  log(context: string | StandardLogPropertiesCore, message?: string | NotError<Record<string, unknown>> | unknown, ...optionalParams: unknown[]): void {
    this._logCore('LOG', context, message, ...optionalParams);
  }

  /**
   *
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logRaw(...data: any[]): void {
    console.log(...data);
  }

  /**
   *
   */
  start(context: string | StandardLogPropertiesCore, message?: string, ...optionalParams: NotError<unknown>[]): void {
    this._infoCore('START', context, message, ...optionalParams);
  }

  /**
   *
   */
  end(context: string | StandardLogPropertiesCore, message?: string, ...optionalParams: NotError<unknown>[]): void {
    this._infoCore('END', context, message, ...optionalParams);
  }

  /**
   *
   */
  effect(context: string | StandardLogPropertiesCore, message?: string, ...optionalParams: NotError<unknown>[]): void {
    this._infoCore('EFFECT', context, message, ...optionalParams);
  }

  /**
   *
   */
  eventHandler(context: string | StandardLogPropertiesCore, message?: string, ...optionalParams: NotError<unknown>[]): void {
    this._infoCore('EVENT_HANDLER', context, message, ...optionalParams);
  }

  /**
   *
   */
  debug(context: string | StandardLogPropertiesCore, message?: string | NotError<Record<string, unknown>> | unknown, ...optionalParams: NotError<unknown>[]): void {
    this._debugCore('DEBUG', context, message, ...optionalParams);
  }

  /**
   *
   */
  success(context: string | StandardLogPropertiesCore, message?: string | NotError<Record<string, unknown>> | unknown, ...optionalParams: NotError<unknown>[]): void {
    this._infoCore('SUCCESS', context, message, ...optionalParams);
  }

  /**
   *
   */
  info(context: string | StandardLogPropertiesCore, message?: string | NotError<Record<string, unknown>> | unknown, ...optionalParams: NotError<unknown>[]): void {
    this._infoCore('INFO', context, message, ...optionalParams);
  }

  /**
   *
   */
  warn(context: string | StandardLogPropertiesCore, message?: string | NotError<Record<string, unknown>> | unknown, ...optionalParams: NotError<unknown>[]): void {
    this._warnCore('WARN', context, message, ...optionalParams);
  }

  /**
   *
   */
  error(context: string | StandardLogPropertiesCore, message?: string | Error | NotError<Record<string, unknown>> | unknown | undefined, ...optionalParams: NotError<unknown>[]): void {
    this._errorCore('ERROR', context, message, ...optionalParams);
  }

  /**
   *
   */
  technicalError(context: string | StandardLogPropertiesCore, message: string | Error | NotError<Record<string, unknown>> | unknown | undefined, ...optionalParams: NotError<unknown>[]): void {
    this._errorCore('TECHNICAL_ERROR', context, message, ...optionalParams);
  }

  /**
   *
   */
  apiError(context: string | StandardLogPropertiesCore, errorDetails: StandardApiErrorResponse, ...optionalParams: NotError<unknown>[]): void {
    this._errorCore('API_ERROR', context, errorDetails, ...optionalParams);
  }

  /**
   *
   */
  assertionFailed(context: string | StandardLogPropertiesCore, message: string | Error | NotError<Record<string, unknown>> | unknown | undefined, ...optionalParams: NotError<unknown>[]): void {
    this._errorCore('ASSERTION_FAILED', context, message, ...optionalParams);
  }

  /**
   *
   */
  private _logCore(
    prefixText: string,
    context: string | StandardLogPropertiesCore,
    message?: string | NotError<Record<string, unknown>> | NotError<unknown> | undefined,
    ...optionalParams: NotError<unknown>[]
  ): void {
    console.log(this._formatLogMessage(prefixText, context, message), ...optionalParams);
  }

  /**
   *
   */
  private _debugCore(
    prefixText: string,
    context: string | StandardLogPropertiesCore,
    message?: string | NotError<Record<string, unknown>> | NotError<unknown> | undefined,
    ...optionalParams: NotError<unknown>[]
  ): void {
    console.debug(this._formatLogMessage(prefixText, context, message), ...optionalParams);
  }

  /**
   *
   */
  private _infoCore(
    prefixText: string,
    context: string | StandardLogPropertiesCore,
    message?: string | NotError<Record<string, unknown>> | NotError<unknown> | undefined,
    ...optionalParams: NotError<unknown>[]
  ): void {
    console.info(this._formatLogMessage(prefixText, context, message), ...optionalParams);
  }

  /**
   *
   */
  private _warnCore(
    prefixText: string,
    context: string | StandardLogPropertiesCore,
    message?: string | NotError<Record<string, unknown>> | NotError<unknown> | undefined,
    ...optionalParams: NotError<unknown>[]
  ): void {
    console.warn(this._formatLogMessage(prefixText, context, message), ...optionalParams);
  }

  /**
   *
   */
  private _errorCore(prefixText: string, context: string | StandardLogPropertiesCore, message?: string | Error | Record<string, unknown> | unknown | undefined, ...optionalParams: NotError<unknown>[]): void {
    console.error(this._formatLogMessage(prefixText, context, message), ...optionalParams);
  }

  /**
   * Formats a log message into a single string.
   */
  private _formatLogMessage(prefixText: string, context: string | StandardLogPropertiesCore, message?: string | Error | Record<string, unknown> | unknown | undefined): string {
    const timePrefix = new Date().toISOString();
    const formattedContext = LoggingUtils.formatLogPropertiesCallerContext(context);
    let formatted = `${timePrefix} ${prefixText}: ${formattedContext}`;

    if (!StringUtils.isString(context)) {
      if (context.correlationId) {
        formatted += ` - CorrelationId: ${context.correlationId}`;
      }
      if (context.errorInstanceId) {
        formatted += ` - ErrorInstanceId: ${context.errorInstanceId}`;
      }
    }

    if (!message || StringUtils.isString(message)) {
      formatted += (message ? ` - ${message}` : '');
    } else {
      formatted += ErrorUtils.toErrorString(message);
    }

    return formatted;
  }
}

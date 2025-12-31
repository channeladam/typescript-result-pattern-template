import type { NotError } from "../objects/object.types";
import type { StandardApiErrorResponse } from "../apis/api.types";

/**
 * The shape of the standard log properties to use for all log entries in your application.
 */
export type StandardLogProperties = StandardLogPropertiesCore & Record<string, unknown>

/**
 * The core properties of a log entry.
 */
export type StandardLogPropertiesCore = {
  /**
   * The context of the caller that is logging the entry.
   */
  context?: StandardCallerContext | undefined;

  /**
   * A unique identifier for the error - intended as a support reference identifier.
   */
  errorInstanceId?: string | undefined;

  /**
   * A correlation identifier for the error.
   */
  correlationId?: string | undefined;
}

/**
 * An array of strings that represent the context of the caller.
 */
export type StandardCallerContext = Array<string>;

/**
 * An interface that defines the methods of a logger.
 */
export interface Logger {
  log(
    context: string | StandardLogPropertiesCore,
    message?: string | NotError<Record<string, unknown>> | unknown
  ): void;

  logRaw(): void;

  start(context: string | StandardLogPropertiesCore, message?: string): void;

  end(context: string | StandardLogPropertiesCore, message?: string): void;

  effect(context: string | StandardLogPropertiesCore, message?: string): void;

  eventHandler(context: string | StandardLogPropertiesCore, message?: string): void;

  debug(
    context: string | StandardLogPropertiesCore,
    message?: string | NotError<Record<string, unknown>> | unknown
  ): void;

  success(
    context: string | StandardLogPropertiesCore,
    message?: string | NotError<Record<string, unknown>> | unknown
  ): void;

  info(
    context: string | StandardLogPropertiesCore,
    message?: string | NotError<Record<string, unknown>> | unknown
  ): void;

  warn(
    context: string | StandardLogPropertiesCore,
    message?: string | NotError<Record<string, unknown>> | unknown
  ): void;

  error(
    context: string | StandardLogPropertiesCore,
    message?: string | Error | NotError<Record<string, unknown>> | unknown | undefined
  ): void;

  technicalError(
    context: string | StandardLogPropertiesCore,
    message: string | Error | NotError<Record<string, unknown>> | unknown | undefined
  ): void;

  apiError(
    context: string | StandardLogPropertiesCore,
    errorDetails: StandardApiErrorResponse
  ): void;

  assertionFailed(
    context: string | StandardLogPropertiesCore,
    message: string | Error | NotError<Record<string, unknown>> | unknown | undefined
  ): void;
}

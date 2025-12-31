// Types
import type { StandardCallerContext, StandardLogPropertiesCore } from "./logging.types";

// Utilities
import { ConsoleLogger } from "./console-logger";
import { StringUtils } from "../string.utilities";

/**
 * A singleton instance of the Logger class.
 * Customize this as necessary for your application.
 */
export const LOG = new ConsoleLogger();

/**
 * Logging-related utilities.
 */
export abstract class LoggingUtils {
  /**
   * Formats a caller context (as a string or from a StandardLogPropertiesCore object) into a string.
   */
  static formatLogPropertiesCallerContext(contextStringOrObject: string | StandardLogPropertiesCore) {
    if (StringUtils.isString(contextStringOrObject)) {
      return contextStringOrObject;
    }
    return LoggingUtils.formatStandardCallerContext(contextStringOrObject.context);
  }

  /**
   * Formats a caller context object into a string.
   */
  static formatStandardCallerContext(callerContext: StandardCallerContext | undefined): string {
    if (!callerContext || callerContext.length === 0) {
      return 'UNKNOWN CONTEXT';
    }
    return callerContext.join('.');
  }
}
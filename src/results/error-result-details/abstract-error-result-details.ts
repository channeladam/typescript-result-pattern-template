// Types
import type { ErrorResultDetailsDiscriminantTag } from '../error-result-details.types';
import type { ErrorResultDetailsConstructorOptions } from '../result.types';
import type { StandardCallerContext } from '../../logging/logging.types';

// Utilities
import { ErrorUtils } from '../../errors/error.utilities';
import { ObjectUtils } from '../../objects/object.utilities';
import { LoggingUtils } from '../../logging/logging.utilities';

const defaultErrorMessage = 'Sorry, something went wrong.';

/**
 * Abstract base class for all standard error result details classes.
 */
export abstract class AbstractErrorResultDetails {
  private _context: StandardCallerContext | undefined;
  private _errorMessage: string | undefined;  
  private _errorCode: string | undefined;
  private _errorInstanceId: string | undefined;
  private _correlationId: string | undefined;

  /**
   * The discriminant tag of the error result details.
   */
  abstract readonly discriminantTag: ErrorResultDetailsDiscriminantTag;

  /**
   * The name of the error result details.
   */
  abstract readonly name: string;

  /**
   * Convert all the values into an ErrorResultDetailsConstructorOptions typed object.
   */
  protected toErrorResultDetailsConstructorOptions(): ErrorResultDetailsConstructorOptions {
    return {
      context: this._context,
      errorCode: this._errorCode,
      errorMessage: this._errorMessage,
      errorInstanceId: this._errorInstanceId,
      correlationId: this._correlationId,
    }
  }

  /**
   * The caller context in which the error happened.
   */
  get context(): StandardCallerContext | undefined {
    return this._context;
  }

  /**
   * A code that represents the error.
   */
  get errorCode(): string | undefined {
    return this._errorCode;
  }

  /**
   * The human-readable description of the error.
   */
  get errorMessage(): string {
    return this._errorMessage ?? defaultErrorMessage;
  }

  /**
   * A unique identifier for the error - intended as a support reference identifier.
   */
  get errorInstanceId(): string | undefined {
    if (ObjectUtils.isNullOrUndefined(this._errorInstanceId)) {
      this._errorInstanceId = ErrorUtils.createErrorInstanceId();
    }
    return this._errorInstanceId;
  }

  /**
   * A correlation identifier for the error.
   */
  get correlationId(): string | undefined {
    return this._correlationId;
  }

  /**
   * Instantiates a new `AbstractStandardErrorResult`.
   * @param options The options for the error result.
   */
  constructor(options: ErrorResultDetailsConstructorOptions) {
    this._context = options.context;
    this._errorCode = options.errorCode;
    this._errorMessage = options.errorMessage;
    this._errorInstanceId = options.errorInstanceId;
    this._correlationId = options.correlationId;
  }

  /**
   * Formats the error result error details into a string.
   */
  formatErrorResult(): string {
    const formattedContext = LoggingUtils.formatStandardCallerContext(this.context);
    const errorCode = ObjectUtils.isNullOrUndefined(this.errorCode) ? '' : String(this.errorCode);
    const errorMessage = ObjectUtils.isNullOrUndefined(this.errorMessage) ? '' : String(this.errorMessage);
    return `${formattedContext} - ${errorCode} - ${errorMessage}`;
  }
}

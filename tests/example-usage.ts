// Types
import { type ApiResult, type AsyncResult, Result } from '../src/results/result.types';
import { ErrorResultDetailsDiscriminantTags } from "../src/results/error-result-details.types";
import type { StandardLogProperties } from "../src/logging/logging.types";

// Utilities
import { ApiErrorResultDetails } from "../src/results/error-result-details/api-error-result-details";
import { LOG } from "../src/logging/logging.utilities";
import { ErrorResult } from '../src/results/error-result';

/**
 *
 */
export interface BlahType {
    stuff: string;
}

const domainContext = "MyDomain";
const appContext = "MyApp";
const classContext = "MyService";
const contextPrefix = [domainContext, appContext, classContext];

/**
 *
 */
class MyService {

  /**
   * @returns an ok result.
   */
  private _fakeSuccessfulOperation(someId: string | undefined): Result<BlahType> {
    return Result.ok<BlahType>({ stuff: 'we have stuff' });
  }

  /**
   * Example Usage
   */
  async retrieveSomeBlah(someId: string | undefined): AsyncResult<BlahType> {
    const logProperties: StandardLogProperties = {
      context: [...contextPrefix, this.retrieveSomeBlah.name],
      someId: someId
    }

    LOG.start(logProperties);

    // Pre-conditions / Guards
    if (!someId) {
      return Result.assertionFailedError(logProperties, 'MyErrorCode', 'someId is undefined');
    }

    // Business logic
    const someResult = this._fakeSuccessfulOperation(someId);

    // (a) Functional-style result processing
    someResult.foldNoCatch((ok) => {
      // Do something with success
      LOG.success(logProperties, ok.stuff);
      // return 5;
    }, (error) => {
      // Do something with error
      const formattedError = error.formatErrorResult();
      LOG.error(logProperties, formattedError);      
    });

    const okValue1 = someResult.valueOrThrow((errorDetails) => new Error(errorDetails.formatErrorResult()));
    LOG.success(logProperties, okValue1.stuff);

    const okValue2 = someResult.valueOrThrow((error) => {
      const formattedError = error.formatErrorResult();
      LOG.error(logProperties, formattedError);
      return new Error(formattedError);
    });
    LOG.success(logProperties, okValue2.stuff);

    //
    // OR:
    if (someResult.isError) {
        // Pattern: Log as close to the problem occurrence as possible
        const formattedError = someResult.errorDetails.formatErrorResult();
        LOG.error(logProperties, formattedError);
    } else {
        // Do something with success
        LOG.success(logProperties, someResult.value.stuff);
    }

    //
    // OR:
    if (someResult.isOk) {
        // Do something with success
        // someResult.value
    } else {
      // Do something with error
      // someResult.errorMessage
    }

    //
    // OR:
    if (someResult.isApiError()) {
      // Do something with API error
      LOG.error(logProperties, someResult.errorDetails.errorResponse.instance);
    } else if (someResult.isError) {
      // Pattern: Log as close to the problem occurrence as possible
      const formattedError = someResult.errorDetails.formatErrorResult();
      LOG.error(logProperties, formattedError);
    } else {
      // Do something with success
      LOG.success(logProperties, someResult.value.stuff);
    }

    //
    // OR:
    // if (someResult.isMyCustomError()) {
    //   someResult.errorMessage or whatever properties MyCustomErrorResult has
    // }


    const okResult = Result.ok(42);
    
    const foldedValue1 = okResult.foldCatchDefault(logProperties, (ok) => ok, (error) => error);
    if (foldedValue1 instanceof ErrorResult) {
      const errorDetails1 = foldedValue1.errorDetails;
    }

    const foldedValue2 = okResult.foldCatchDefault(logProperties, (ok) => { if (ok === 40) throw new Error('boom'); }, (error) => error);
    if (foldedValue2 instanceof ErrorResult) {
      const errorDetails2 = foldedValue2.errorDetails;
    }

    LOG.end(logProperties);

    return someResult;
    // return someResult.toVoidResult()
  }

  toMessage(result: Result<{ name: string }>) {
    if (result.isError) {
      return `failed: ${String(result.errorDetails.errorMessage)}`;
    }

    return `hello ${result.value.name}`;
  }

  validatePositive(n: number): Result<number> {
    if (n <= 0) {
      return Result.userError({ context: ["validatePositive"] }, "Invalid", "Must be > 0");
    }
    return Result.ok(n);
  }

  compute(input: string): Result<number> {
    return Result.ok(input)
      .mapNoCatch((s) => Number.parseInt(s, 10))
      .andThenNoCatch((n) => this.validatePositive(n))
      .mapNoCatch((n) => n * 2);
  }

  withFallback(result: Result<number>): Result<number> {
    return result.orElseNoCatch((_err) => Result.ok(0));
  }

  async loadUser(id: string): AsyncResult<{ id: string }> {
    if (!id) {
      return Result.assertionFailedError({ context: ["loadUser"] }, "Invalid", "id is required");
    }

    return Result.tryCatchDefaultAsync({ context: ["loadUser"] }, async () => {
      const user = await Promise.resolve({ id });
      return user;
    });
  }

  async tryCatchExample() {
    const logProperties: StandardLogProperties = { context: [...contextPrefix, this.tryCatchExample.name], correlationId: "corr-1" };

    const r3 = Result.tryCatch(
      () => 42,
      (err) => Result.technicalError(logProperties, "TryCatchFailed", err),
    );

    const r4 = await Result.tryCatchAsync(
      async () => Promise.resolve({ id: "123" }),
      (err) => Result.technicalError(logProperties, "TryCatchAsyncFailed", err),
    );    
  }

  async wrapExample() {
    const logProperties: StandardLogProperties = { context: [...contextPrefix, this.wrapExample.name], correlationId: "corr-1" };

    const safeFn1 = Result.wrap(
      () => 42,
      (err) => Result.technicalError(logProperties, "WrapFailed", err)
    );
    const result1 = safeFn1();

    const safeFn2 = Result.wrapAsync(
      async () => Promise.resolve(42),     
      (err) => Result.technicalError(logProperties, "WrapAsyncFailed", err)
    );
    const result2 = await safeFn2();

    const safeFn3 = Result.wrapDefault(logProperties, () => 42);
    const result3 = safeFn3();

    const safeFn4 = Result.wrapDefaultAsync(logProperties, () => Promise.resolve(42));
    const result4 = await safeFn4();
  }

  typeNarrowingExample() {
    const apiR: ApiResult<number> = Result.ok(1);
    const apiR2 = apiR.isApiError(); // `&& apiR.errorDetails` does not evaluate because the left side is false

    const map1 = apiR
      .mapNoCatch((n) => n * 2)
      .mapNoCatch((n) => n * 3);

    const apiR3: ApiResult<number> = Result.ok(1) as ApiResult<number>;
    const apiR4 = apiR3.isApiError() && apiR3.errorDetails.errorResponse;
    
    const apiR5: ApiResult<number> = Result.apiError({ context: [...contextPrefix, 'test'], correlationId: 'corr-1' }, { type: 'about:test', title: 'Bad Request', status: 400, detail: 'Invalid', instance: '/x' });
    const apiR6 = apiR5.isError && apiR5.errorDetails.errorResponse;
    const apiR7 = apiR5.isApiError() && apiR5.errorDetails.errorResponse;
    
    const apiR8 = apiR5 as Result<number, ApiErrorResultDetails>;
    const apiR9 = apiR8.isError && apiR8.errorDetails.errorResponse;
    const apiR10 = apiR8.isApiError() && apiR8.errorDetails.errorResponse;

    const apiR11 = apiR5 as Result<number>;
    const apiR12 = apiR11.isError && apiR11.errorDetails.correlationId; // errorResponse is not available
    const apiR13 = apiR11.isApiError() && apiR11.errorDetails.errorResponse;

    const r1 = apiR5 as Result<number>;

    switch (r1.errorDetails?.discriminantTag) {
      case ErrorResultDetailsDiscriminantTags.ApiError:
        const instanceId = r1.errorDetails.errorResponse.instance;
        break;
      case ErrorResultDetailsDiscriminantTags.AssertionFailedError:
        const errorMessage1 = r1.errorDetails.errorMessage;
        break;
      case ErrorResultDetailsDiscriminantTags.UserError:
        const errorMessage2 = r1.errorDetails.errorMessage;
        break;
      case ErrorResultDetailsDiscriminantTags.TechnicalError:
        const errorMessage3 = r1.errorDetails.errorMessage;
        break;
      case ErrorResultDetailsDiscriminantTags.ShortCircuitedError:
        const errorMessage4 = r1.errorDetails.errorMessage;
        break;
      default:
        break;
    }
  }
}

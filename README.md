# Typescript Result Pattern Template

## Overview

A Result Pattern implementation for TypeScript, using discriminated unions of `OkResult`/`ErrorResult` and discriminated unions of error-details class instances.

This repo provides a `Result` implementation intended as a template to be copied and modified to suit your needs.

In this template, `Result` is an alias for the `ResultFactory` (so `Result.ok(...)`, `Result.tryCatchDefault(...)`, etc. are factory helpers).

The core types are:

- **`Result<TOk, TErrorDetails>`**
- **`AsyncResult<TOk, TErrorDetails>`** (alias for `Promise<Result<...>>`)

The concrete runtime classes are:

- **`OkResult<TOk>`**
- **`ErrorResult<TErrorDetails>`**

## Example Usage

The examples below import directly from `src` (since this template is not published as a package).

```ts
import { Result, AsyncResult } from "./src/results/result.types";
```

## Creating Results (Result)

### Ok results

```ts
import { Result } from "./src/results/result.types";

const okResult = Result.ok({ id: "123" });
```

### Error results (all factory methods)

Most error-factory methods expect `options` shaped like `StandardLogProperties` (commonly `{ context: string[] }`).

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

const logProperties: StandardLogProperties = {
  context: ["MyDomain", "MyApp", "MyService", "myMethod"],
  correlationId: "corr-123",
  errorInstanceId: "err-456",
};

// Assertion / guard failures
const assertionFailed = Result.assertionFailedError(logProperties, "MyErrorCode", "someId is undefined");

// Technical errors (unexpected failures)
const technical = Result.technicalError(logProperties, "MyErrorCode", new Error("boom"));

// User-facing errors (typically non-exceptional)
const user = Result.userError(logProperties, "MyErrorCode", "Please check your input");

// Short-circuit errors (used to intentionally abort a flow)
const shortCircuit = Result.shortCircuitedError(logProperties, "MyErrorCode", "Aborted");
```

### API errors

`apiErrorNoLog` never logs. `apiError` logs by default (unless `options.log === false`).

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

const logProperties: StandardLogProperties = {
  context: ["MyService", "fetchSomething"],
};

const apiErrorResponse = {
  type: "https://example.com/problem",
  title: "Bad Request",
  status: 400,
  detail: "Invalid input",
  instance: "trace-123",
};

const apiErrorNoLog = Result.apiErrorNoLog(logProperties, apiErrorResponse);
const apiErrorWithLogging = Result.apiError({ ...logProperties, log: true, errorCode: "ApiError" }, apiErrorResponse);
```

### Try/catch helpers

Use these when you need to convert thrown exceptions into results.

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

const logProperties: StandardLogProperties = {
  context: ["MyService", "parse"],
  correlationId: "corr-1",
};

// Default behavior: exceptions are converted via Result.fromErrorObject(logProperties, err)
const r1 = Result.tryCatchDefault(logProperties, () => JSON.parse("{\"x\":1}"));

const r2 = await Result.tryCatchDefaultAsync(logProperties, async () => {
  const value = await Promise.resolve({ id: "123" });
  return value;
});

// Custom behavior: provide an error result factory (logging should be done in your error result factory)
const r3 = Result.tryCatch(
  () => JSON.parse("{\"x\":1}"),
  (err) => Result.technicalError(logProperties, "ParseFailed", err),
);

const r4 = await Result.tryCatchAsync(
  async () => Promise.resolve({ id: "123" }),
  (err) => Result.technicalError(logProperties, "LoadFailed", err),
);
```

### Wrap helpers

Use these when you want to wrap an existing function so that callers receive a `Result` instead of needing their own try/catch.

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

const logProperties: StandardLogProperties = {
  context: ["MyService", "parse"],
  correlationId: "corr-1",
};

const safeParseJson = Result.wrapDefault(logProperties, (input: string) => JSON.parse(input) as unknown);
const r1 = safeParseJson("{\"x\":1}");

const safeFetchUser = Result.wrapDefaultAsync(logProperties, async (id: string) => {
  if (!id) {
    throw new Error("id required");
  }
  return Promise.resolve({ id });
});
const r2 = await safeFetchUser("123");

const parseJsonWithCustomError = Result.wrap(
  (input: string) => JSON.parse(input) as unknown,
  (err) => Result.technicalError(logProperties, "ParseFailed", err),
);
const r3 = parseJsonWithCustomError("{\"x\":1}");

const fetchUserWithCustomError = Result.wrapAsync(
  async (id: string) => Promise.resolve({ id }),
  (err) => Result.technicalError(logProperties, "LoadFailed", err),
);
const r4 = await fetchUserWithCustomError("123");
```

### Convert unknown error objects

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

const logProperties: StandardLogProperties = {
  context: ["MyService", "handler"],
  correlationId: "corr-1",
};

try {
  throw new Error("boom");
} catch (err: unknown) {
  const result = Result.fromErrorObject(logProperties, err);
}
```

## Destructuring Result functions

If you prefer calling functions directly instead of `Result.xxx`, you can destructure from `Result`.

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

const {
  ok,
  apiError,
  apiErrorNoLog,
  assertionFailedError,
  technicalError,
  userError,
  shortCircuitedError,
  fromErrorObject,
  tryCatch,
  tryCatchAsync,
  tryCatchDefault,
  tryCatchDefaultAsync,
  wrap,
  wrapAsync,
  wrapDefault,
  wrapDefaultAsync,
} = Result;

const logProperties: StandardLogProperties = {
  context: ["MyService", "myMethod"],
};

const success = ok({ id: "123" });
const failure = technicalError(logProperties, "MyErrorCode", "Something failed");

const fromTryCatch = tryCatch(
  () => 10 / 2,
  (err) => technicalError(logProperties, "MyErrorCode", err),
);
const fromTryCatchAsync = await tryCatchAsync(
  async () => 10 / 2,
  (err) => technicalError(logProperties, "MyErrorCode", err),
);
const fromUnknown = fromErrorObject(logProperties, new Error("boom"));

const apiErrorNoLogging = apiErrorNoLog(logProperties, {
  type: "https://example.com/problem",
  title: "Bad Request",
  status: 400,
  detail: "Invalid input",
  instance: "trace-123",
});

const apiErrorWithLogging = apiError({ ...logProperties, log: true, errorCode: "ApiError" }, apiErrorNoLogging.errorDetails.errorResponse);
```

## Operations on a Result

All operations below are available on both `OkResult` and `ErrorResult` via the `ResultOperations` interface.

### `foldNoCatch(onOk, onError)`

```ts
import { Result } from "./src/results/result.types";

function handle(result: Result<number>) {
  return result.foldNoCatch(
    (value) => `ok: ${value}`,
    (error) => `error: ${String(error.errorMessage ?? error)}`,
  );
}
```

### `foldCatchDefault(logProperties, onOk, onError)`

Use this when you want *exceptions thrown inside `onOk`* to be caught and converted into a `TechnicalErrorResult`.

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

function handleWithDefaultCatch(result: Result<number>) {
  const logProperties: StandardLogProperties = {
    context: ["handleWithDefaultCatch"],
  };
  return result.foldCatchDefault(
    logProperties,
    (value) => {
      if (value === 0) {
        throw new Error("boom");
      }
      return `ok: ${value}`;
    },
    (error) => `error: ${String(error.errorMessage ?? error)}`,
  );
}
```

### `foldCatch(onOk, onOkErrorResultFactory, onError)`

Use this when you want exceptions thrown inside `onOk` to be converted into a custom error result.

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

function handleWithCustomCatch(result: Result<number>) {
  const logProperties: StandardLogProperties = {
    context: ["handleWithCustomCatch"],
  };
  return result.foldCatch(
    (value) => value + 1,
    (err) => Result.userError({ ...logProperties, log: false }, "Invalid", String(err)),
    () => 0,
  );
}
```

### `valueOrThrow(errorFactory)`

```ts
import { Result } from "./src/results/result.types";

function mustBeOk(result: Result<number>) {
  return result.valueOrThrow((errorDetails) => new Error(String(errorDetails.errorMessage))) + 1;
}
```

### `valueOrThrow(errorFactory)` (with formatted error)

```ts
import { Result } from "./src/results/result.types";

function mustBeOkWithCustomError(result: Result<number>) {
  return result.valueOrThrow((errorDetails) => new Error(errorDetails.formatErrorResult())) + 1;
}
```

### `valueOrNull()` / `valueOrUndefined()` / `valueOrDefault(defaultValue)` / `valueOrElse(onError)`

```ts
import { Result } from "./src/results/result.types";

function getOrDefault(result: Result<number>) {
  return result.valueOrDefault(0);
}

function getOrElse(result: Result<number>) {
  return result.valueOrElse(() => 0);
}
```

### `errorDetailsOrNull()` / `errorDetailsOrUndefined()` / `errorDetailsOrDefault(defaultValue)` / `errorDetailsOrElse(onOk)`

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

function errorOrFallbackMessage(result: Result<number>) {
  const logProperties: StandardLogProperties = {
    context: ["fallback"],
  };
  return result
    .errorDetailsOrElse(() => Result.userError({ ...logProperties, log: false }, undefined, "no error").errorDetails)
    .errorMessage;
}
```

### `errorDetailsOrThrow(errorFactory)`

```ts
import { Result } from "./src/results/result.types";

function mustBeError(result: Result<number>) {
  return result.errorDetailsOrThrow(() => new Error("Expected error"));
}
```

### `toTuple()`

```ts
import { Result } from "./src/results/result.types";

function toTuple(result: Result<number>) {
  const [value, errorDetails] = result.toTuple();
  return { value, errorDetails };
}
```

## If / then style branching

The simplest "if/then" style is branching using the discriminants `isOk` / `isError`.

```ts
import { Result } from "./src/results/result.types";

function toMessage(result: Result<{ name: string }>) {
  if (result.isError) {
    return `failed: ${String(result.errorDetails.errorMessage)}`;
  }

  return `hello ${result.value.name}`;
}
```

```ts
import { Result } from "./src/results/result.types";

function toUppercaseIfOk(result: Result<string>) {
  if (result.isOk) {
    return result.value.toUpperCase();
  }

  return `failed: ${String(result.errorDetails.errorMessage)}`;
}
```

### Error type-guards

All results share helper type-guard functions (useful for narrowing `errorDetails`).

```ts
import { Result } from "./src/results/result.types";

function handleErrorVariants(result: Result<unknown>) {
  if (result.isApiError()) {
    // result.errorDetails is ApiErrorResultDetails
    return result.errorDetails.errorResponse.instance;
  }

  if (result.isAssertionFailedError()) {
    return result.errorDetails.errorMessage;
  }

  if (result.isTechnicalError()) {
    return result.errorDetails.errorMessage;
  }

  if (result.isUserError()) {
    return result.errorDetails.errorMessage;
  }

  if (result.isShortCircuitedError()) {
    return result.errorDetails.errorMessage;
  }

  if (result.isError) {
    return String(result.errorDetails);
  }

  return "ok";
}
```

Alternatively, the `discriminantTag` can be used directly to narrow the type.

```ts
const r1: Result<number>;

switch (r1.errorDetails.discriminantTag) {
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
```

## Transforming / composing results

### `mapNoCatch(fn)`

Transforms the ok value (errors pass through unchanged).

```ts
import { Result } from "./src/results/result.types";

function parseNumber(input: string): Result<number> {
  const result = Result.ok(input); 
  return result.mapNoCatch((s) => Number.parseInt(s, 10));
}
```

### `mapCatchDefault(logProperties, fn)`

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

function parseNumberSafe(input: string) {
  const logProperties: StandardLogProperties = {
    context: ["parseNumberSafe"],
  };
  return Result.ok(input).mapCatchDefault(
    logProperties,
    (s) => Number.parseInt(s, 10),
  );
}
```

### `mapCatch(fn, errorResultFactory)`

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

function parseNumberWithCustomError(input: string) {
  const logProperties: StandardLogProperties = {
    context: ["parseNumberWithCustomError"],
  };
  return Result.ok(input).mapCatch(
    (s) => Number.parseInt(s, 10),
    (err) => Result.userError({ ...logProperties, log: false }, "Invalid", String(err)),
  );
}
```

### `mapError(fn)`

Transforms error details (ok results pass through unchanged).

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

function addContext(result: Result<number>) {
  const logProperties: StandardLogProperties = {
    context: ["addContext"],
  };
  return result.mapError((err) =>
    Result.technicalError(logProperties, err.errorCode ?? "Unknown", err.errorMessage).errorDetails
  );
}
```

### `andThenNoCatch(fn)`

Sequentially composes operations that each return a `Result` (aka bind/flatMap).

```ts
import { Result } from "./src/results/result.types";

function validatePositive(n: number): Result<number> {
  if (n <= 0) {
    const logProperties: StandardLogProperties = {
      context: ["validatePositive"],
    };
    return Result.userError(logProperties, "Invalid", "Must be > 0");
  }
  return Result.ok(n);
}

function compute(input: string): Result<number> {
  return Result.ok(input)
    .mapNoCatch((s) => Number.parseInt(s, 10))
    .andThenNoCatch(validatePositive)
    .mapNoCatch((n) => n * 2);
}
```

### `andThenCatchDefault(logProperties, fn)`

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

function computeSafe(input: string): Result<number> {
  const logProperties: StandardLogProperties = {
    context: ["computeSafe"],
  };
  return Result.ok(input)
    .mapNoCatch((s) => Number.parseInt(s, 10))
    .andThenCatchDefault(logProperties, validatePositive)
    .mapNoCatch((n) => n * 2);
}
```

### `andThenCatch(fn, errorResultFactory)`

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

function computeWithCustomCatch(input: string): Result<number> {
  const logProperties: StandardLogProperties = {
    context: ["computeWithCustomCatch"],
  };
  return Result.ok(input)
    .mapNoCatch((s) => Number.parseInt(s, 10))
    .andThenCatch(
      validatePositive,
      (err) => Result.userError({ ...logProperties, log: false }, "Invalid", String(err)),
    )
    .mapNoCatch((n) => n * 2);
}
```

### `orElseNoCatch(fn)`

Handles/replaces an error with a new `Result` (ok results pass through unchanged).

```ts
import { Result } from "./src/results/result.types";

function withFallback(result: Result<number>): Result<number> {
  return result.orElseNoCatch((_err) => Result.ok(0));
}
```

### `orElseCatchDefault(logProperties, fn)`

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

function withFallbackSafe(result: Result<number>): Result<number> {
  const logProperties: StandardLogProperties = {
    context: ["withFallbackSafe"],
  };
  return result.orElseCatchDefault(
    logProperties,
    () => Result.ok(0),
  );
}
```

### `orElseCatch(fn, errorResultFactory)`

```ts
import { Result } from "./src/results/result.types";
import type { StandardLogProperties } from "./src/logging/logging.types";

function withFallbackCustomCatch(result: Result<number>): Result<number> {
  const logProperties: StandardLogProperties = {
    context: ["withFallbackCustomCatch"],
  };
  return result.orElseCatch(
    () => {
      throw new Error("boom");
    },
    (err) => Result.technicalError({ ...logProperties, log: false }, "Unexpected", err),
  );
}
```

## Async usage (AsyncResult)

```ts
import type { AsyncResult } from "./src/results/result.types";
import { Result } from "./src/results/result.types";

async function loadUser(id: string): AsyncResult<{ id: string }> {
  const logProperties: StandardLogProperties = {
    context: ["loadUser"],
  };

  if (!id) {
    return Result.assertionFailedError(logProperties, "Invalid", "id is required");
  }

  return Result.tryCatchDefaultAsync(logProperties, async () => {
    const user = await Promise.resolve({ id });
    return user;
  });
}
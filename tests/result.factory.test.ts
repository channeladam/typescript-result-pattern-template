import assert from 'node:assert/strict';
import { describe, test, beforeEach, afterEach, mock, type Mock } from 'node:test';

// Errors
import { AssertionFailedError } from '../src/errors/assertion-failed-error';

// Error Result Details
import { ApiErrorResultDetails } from '../src/results/error-result-details/api-error-result-details';
import { AssertionFailedErrorResultDetails } from '../src/results/error-result-details/assertion-failed-error-result-details';
import { ShortCircuitedErrorResultDetails } from '../src/results/error-result-details/short-circuited-error-result-details';
import { TechnicalErrorResultDetails } from '../src/results/error-result-details/technical-error-result-details';
import { UserErrorResultDetails } from '../src/results/error-result-details/user-error-result-details';

// Results
import { ErrorResult } from '../src/results/error-result';

// Factories
import { ResultFactory } from '../src/results/result.factory';

let logSpy: Mock<(typeof console)['log']>;
let debugSpy: Mock<(typeof console)['debug']>;
let infoSpy: Mock<(typeof console)['info']>;
let warnSpy: Mock<(typeof console)['warn']>;
let errorSpy: Mock<(typeof console)['error']>;

beforeEach(() => {
  logSpy = mock.method(console, 'log', () => undefined);
  debugSpy = mock.method(console, 'debug', () => undefined);
  infoSpy = mock.method(console, 'info', () => undefined);
  warnSpy = mock.method(console, 'warn', () => undefined);
  errorSpy = mock.method(console, 'error', () => undefined);
});

afterEach(() => {
  mock.restoreAll();
});

const context = ['Domain', 'App', 'Service', 'op'];
const correlationId = 'corr-1';
const errorInstanceId = 'err-1';

const assertNoConsoleCalls = () => {
  assert.equal(logSpy.mock.calls.length, 0);
  assert.equal(debugSpy.mock.calls.length, 0);
  assert.equal(infoSpy.mock.calls.length, 0);
  assert.equal(warnSpy.mock.calls.length, 0);
  assert.equal(errorSpy.mock.calls.length, 0);
}

describe('ResultFactory - creation helpers', () => {
  test('apiErrorNoLog returns ApiErrorResult', () => {
    const errorInstanceId = '/x';
    const r = ResultFactory.apiErrorNoLog({ context, correlationId }, { title: 'Bad', detail: 'oops', instance: errorInstanceId });
    assert.ok(r instanceof ErrorResult);
    assert.ok(r.errorDetails instanceof ApiErrorResultDetails);
    assert.equal(r.errorDetails.correlationId, correlationId);
    assert.equal(r.errorDetails.errorInstanceId, errorInstanceId);
    assertNoConsoleCalls();
  });

  test('apiError logs and returns ApiErrorResult', () => {
    const errorInstanceId = '/x';
    const r = ResultFactory.apiError({ context, correlationId },  { title: 'Bad', detail: 'oops', instance: errorInstanceId });
    assert.ok(r instanceof ErrorResult);
    assert.ok(r.errorDetails instanceof ApiErrorResultDetails);
    assert.equal(r.errorDetails.correlationId, correlationId);
    assert.equal(r.errorDetails.errorInstanceId, errorInstanceId);
    assert.ok(errorSpy.mock.calls.length > 0);
  });

  test('apiError with log:false does not log and returns ApiErrorResult', () => {
    const errorInstanceId = '/x';
    const r = ResultFactory.apiError({ context, correlationId, errorCode: 'AP', log: false }, { title: 'Bad', detail: 'oops', instance: errorInstanceId });
    assert.ok(r instanceof ErrorResult);
    assert.ok(r.errorDetails instanceof ApiErrorResultDetails);
    assert.equal(r.errorDetails.correlationId, correlationId);
    assert.equal(r.errorDetails.errorInstanceId, errorInstanceId);
    assertNoConsoleCalls();
  });

  test('assertionFailedError logs and returns AssertionFailedErrorResult', () => {
    const r = ResultFactory.assertionFailedError({ context, correlationId, errorInstanceId }, 'AF', 'failed');
    assert.ok(r instanceof ErrorResult);
    assert.ok(r.errorDetails instanceof AssertionFailedErrorResultDetails);
    assert.equal(r.errorDetails.correlationId, correlationId);
    assert.equal(r.errorDetails.errorInstanceId, errorInstanceId);
    assert.ok(errorSpy.mock.calls.length > 0);
  });

  test('assertionFailedError with log:false does not log and returns AssertionFailedErrorResult', () => {
    const r = ResultFactory.assertionFailedError({ context, correlationId, errorInstanceId, log: false }, 'AF', 'failed');
    assert.ok(r instanceof ErrorResult);
    assert.ok(r.errorDetails instanceof AssertionFailedErrorResultDetails);
    assert.equal(r.errorDetails.correlationId, correlationId);
    assert.equal(r.errorDetails.errorInstanceId, errorInstanceId);
    assertNoConsoleCalls();
  });

  test('technicalError logs and returns TechnicalErrorResult', () => {
    const r = ResultFactory.technicalError({ context, correlationId, errorInstanceId }, 'TE', 'boom');
    assert.ok(r instanceof ErrorResult);
    assert.ok(r.errorDetails instanceof TechnicalErrorResultDetails);
    assert.equal(r.errorDetails.correlationId, correlationId);
    assert.equal(r.errorDetails.errorInstanceId, errorInstanceId);
    assert.ok(errorSpy.mock.calls.length > 0);
  });

  test('technicalError with log:false does not log and returns TechnicalErrorResult', () => {
    const r = ResultFactory.technicalError({ context, correlationId, errorInstanceId, log: false }, 'TE', 'boom');
    assert.ok(r instanceof ErrorResult);
    assert.ok(r.errorDetails instanceof TechnicalErrorResultDetails);
    assert.equal(r.errorDetails.correlationId, correlationId);
    assert.equal(r.errorDetails.errorInstanceId, errorInstanceId);
    assertNoConsoleCalls();
  });

  test('userError logs debug and returns UserErrorResult', () => {
    const r = ResultFactory.userError({ context, correlationId, errorInstanceId }, 'UE', 'nope');
    assert.ok(r instanceof ErrorResult);
    assert.ok(r.errorDetails instanceof UserErrorResultDetails);
    assert.equal(r.errorDetails.correlationId, correlationId);
    assert.equal(r.errorDetails.errorInstanceId, errorInstanceId);
    assert.ok(debugSpy.mock.calls.length > 0);
  });

  test('userError with log:false does not log and returns UserErrorResult', () => {
    const r = ResultFactory.userError({ context, correlationId, errorInstanceId, log: false }, 'UE', 'nope');
    assert.ok(r instanceof ErrorResult);
    assert.ok(r.errorDetails instanceof UserErrorResultDetails);
    assert.equal(r.errorDetails.correlationId, correlationId);
    assert.equal(r.errorDetails.errorInstanceId, errorInstanceId);
    assertNoConsoleCalls();
  });

  test('shortCircuitedError logs debug and returns ShortCircuitedErrorResult', () => {
    const r = ResultFactory.shortCircuitedError({ context, correlationId, errorInstanceId }, 'SC', 'skip');
    assert.ok(r instanceof ErrorResult);
    assert.ok(r.errorDetails instanceof ShortCircuitedErrorResultDetails);
    assert.equal(r.errorDetails.correlationId, correlationId);
    assert.equal(r.errorDetails.errorInstanceId, errorInstanceId);
    assert.ok(debugSpy.mock.calls.length > 0);
  });

  test('shortCircuitedError with log:false does not log and returns ShortCircuitedErrorResult', () => {
    const r = ResultFactory.shortCircuitedError({ context, correlationId, errorInstanceId, log: false }, 'SC', 'skip');
    assert.ok(r instanceof ErrorResult);
    assert.ok(r.errorDetails instanceof ShortCircuitedErrorResultDetails);
    assert.equal(r.errorDetails.correlationId, correlationId);
    assert.equal(r.errorDetails.errorInstanceId, errorInstanceId);
    assertNoConsoleCalls();
  });
});

describe('ResultFactory - tryCatchDefault', () => {
  test('returns success when function does not throw', () => {
    const r = ResultFactory.tryCatchDefault({ context }, () => 42);
    r.foldNoCatch((v) => assert.equal(v, 42), () => assert.fail('should be success'));
  });

  test('returns AssertionFailedErrorResult when function throws AssertionFailedError', () => {
    const r = ResultFactory.tryCatchDefault({ context }, () => {
      throw new AssertionFailedError('bad');
    });
    assert.equal(r.isError, true);
    assert.ok(r.isAssertionFailedError());
    assert.ok(r.errorDetails instanceof AssertionFailedErrorResultDetails);
    assert.ok(errorSpy.mock.calls.length > 0);
  });

  test('returns TechnicalErrorResult when function throws generic Error', () => {
    const r = ResultFactory.tryCatchDefault({ context }, () => {
      throw new Error('bad');
    });
    assert.equal(r.isError, true);
    assert.ok(r.isTechnicalError());
    assert.ok(r.errorDetails instanceof TechnicalErrorResultDetails);
    assert.ok(errorSpy.mock.calls.length > 0);
  });

  test('returns TechnicalErrorResult when function throws non-object value', () => {
    const r = ResultFactory.tryCatchDefault({ context }, () => {
      // eslint-disable-next-line no-throw-literal
      throw 'bad';
    });
    assert.equal(r.isError, true);
    assert.ok(r.isTechnicalError());
    assert.ok(r.errorDetails instanceof TechnicalErrorResultDetails);
    assert.ok(errorSpy.mock.calls.length > 0);
  });
});

describe('ResultFactory - tryCatchDefaultAsync', () => {
  test('returns success when async function does not throw', async () => {
    const r = await ResultFactory.tryCatchDefaultAsync({ context }, async () => 42);
    r.foldNoCatch((v) => assert.equal(v, 42), () => assert.fail('should be success'));
  });

  test('returns TechnicalErrorResultDetails when async function throws generic Error', async () => {
    const r = await ResultFactory.tryCatchDefaultAsync({ context }, async () => {
      throw new Error('bad');
    });
    assert.equal(r.isError, true);
    assert.ok(r.isTechnicalError());
    assert.ok(r.errorDetails instanceof TechnicalErrorResultDetails);
    assert.ok(errorSpy.mock.calls.length > 0);
  });
});

describe('ResultFactory - tryCatch (errorFactory)', () => {
  test('returns success when function does not throw (and does not call errorFactory)', () => {
    const r = ResultFactory.tryCatch(() => 42, () => {
      return assert.fail('should not call errorFactory');
    });
    r.foldNoCatch((v) => assert.equal(v, 42), () => assert.fail('should be success'));
  });

  test('returns ErrorResult created by errorFactory when function throws', () => {
    const r = ResultFactory.tryCatch(
      () => {
        throw new Error('bad');
      },
      (err: unknown) => {
        assert.ok(err instanceof Error);
        return ResultFactory.userError({ context, log: false }, 'UE', 'handled');
      },
    );

    assert.equal(r.isError, true);
    assert.ok(r.isUserError());
    assert.ok(r.errorDetails instanceof UserErrorResultDetails);
    assertNoConsoleCalls();
  });
});

describe('ResultFactory - wrapDefault', () => {
  test('returns a function that returns success when wrapped function does not throw', () => {
    const fn = (a: number, b: number) => a + b;
    const wrapped = ResultFactory.wrapDefault({ context }, fn);
    const r = wrapped(2, 3);
    r.foldNoCatch((v) => assert.equal(v, 5), () => assert.fail('should be success'));
  });

  test('returns a function that returns AssertionFailedErrorResult when wrapped function throws AssertionFailedError', () => {
    const fn = () => {
      throw new AssertionFailedError('bad');
    };
    const wrapped = ResultFactory.wrapDefault({ context }, fn);
    const r = wrapped();
    assert.equal(r.isError, true);
    assert.ok(r.isAssertionFailedError());
    assert.ok(r.errorDetails instanceof AssertionFailedErrorResultDetails);
    assert.ok(errorSpy.mock.calls.length > 0);
  });

  test('returns a function that returns TechnicalErrorResult when wrapped function throws generic Error', () => {
    const fn = () => {
      throw new Error('bad');
    };
    const wrapped = ResultFactory.wrapDefault({ context }, fn);
    const r = wrapped();
    assert.equal(r.isError, true);
    assert.ok(r.isTechnicalError());
    assert.ok(r.errorDetails instanceof TechnicalErrorResultDetails);
    assert.ok(errorSpy.mock.calls.length > 0);
  });
});

describe('ResultFactory - wrapDefaultAsync', () => {
  test('returns a function that returns success when wrapped async function does not throw', async () => {
    const fn = async (n: number) => n + 1;
    const wrapped = ResultFactory.wrapDefaultAsync({ context }, fn);
    const r = await wrapped(41);
    r.foldNoCatch((v) => assert.equal(v, 42), () => assert.fail('should be success'));
  });

  test('returns a function that returns TechnicalErrorResult when wrapped async function throws', async () => {
    const fn = async () => {
      throw new Error('bad');
    };
    const wrapped = ResultFactory.wrapDefaultAsync({ context }, fn);
    const r = await wrapped();
    assert.equal(r.isError, true);
    assert.ok(r.isTechnicalError());
    assert.ok(r.errorDetails instanceof TechnicalErrorResultDetails);
    assert.ok(errorSpy.mock.calls.length > 0);
  });
});

describe('ResultFactory - wrap (errorFactory)', () => {
  test('returns a function that returns success when wrapped function does not throw (and does not call errorFactory)', () => {
    const fn = (n: number) => n + 1;
    const errorFactory: (err: unknown) => ErrorResult<UserErrorResultDetails> = () => {
      return assert.fail('should not call errorFactory');
    };

    const wrapped = ResultFactory.wrap(fn, errorFactory);
    const r = wrapped(41);
    r.foldNoCatch((v) => assert.equal(v, 42), () => assert.fail('should be success'));
  });

  test('returns a function that returns ErrorResult created by errorFactory when wrapped function throws', () => {
    const fn = () => {
      throw new Error('bad');
    };

    let callCount = 0;
    const errorFactory: (err: unknown) => ErrorResult<UserErrorResultDetails> = (err: unknown) => {
      callCount += 1;
      assert.ok(err instanceof Error);
      return ResultFactory.userError({ context, log: false }, 'UE', 'handled');
    };

    const wrapped = ResultFactory.wrap(fn, errorFactory);
    const r = wrapped();
    assert.equal(callCount, 1);
    assert.equal(r.isError, true);
    assert.ok(r.isUserError());
    assert.ok(r.errorDetails instanceof UserErrorResultDetails);
    assertNoConsoleCalls();
  });
});

describe('ResultFactory - wrapAsync (errorFactory)', () => {
  test('returns a function that returns success when wrapped async function does not throw (and does not call errorFactory)', async () => {
    const fn = async (n: number) => n + 1;
    const errorFactory: (err: unknown) => ErrorResult<UserErrorResultDetails> = () => {
      return assert.fail('should not call errorFactory');
    };

    const wrapped = ResultFactory.wrapAsync(fn, errorFactory);
    const r = await wrapped(41);
    r.foldNoCatch((v) => assert.equal(v, 42), () => assert.fail('should be success'));
  });

  test('returns a function that returns ErrorResult created by errorFactory when wrapped async function throws', async () => {
    const fn = async () => {
      throw new Error('bad');
    };

    let callCount = 0;
    const errorFactory: (err: unknown) => ErrorResult<UserErrorResultDetails> = (err: unknown) => {
      callCount += 1;
      assert.ok(err instanceof Error);
      return ResultFactory.userError({ context, log: false }, 'UE', 'handled');
    };

    const wrapped = ResultFactory.wrapAsync(fn, errorFactory);
    const r = await wrapped();
    assert.equal(callCount, 1);
    assert.equal(r.isError, true);
    assert.ok(r.isUserError());
    assert.ok(r.errorDetails instanceof UserErrorResultDetails);
    assertNoConsoleCalls();
  });
});

describe('ResultFactory - tryCatchAsync (errorFactory)', () => {
  test('returns success when async function does not throw (and does not call errorFactory)', async () => {
    const r = await ResultFactory.tryCatchAsync(async () => 42, () => {
      return assert.fail('should not call errorFactory');
    });
    r.foldNoCatch((v) => assert.equal(v, 42), () => assert.fail('should be success'));
  });

  test('returns ErrorResult created by errorFactory when async function throws', async () => {
    const r = await ResultFactory.tryCatchAsync(
      async () => {
        throw new Error('bad');
      },
      (err: unknown) => {
        assert.ok(err instanceof Error);
        return ResultFactory.userError({ context, log: false }, 'UE', 'handled');
      },
    );

    assert.equal(r.isError, true);
    assert.ok(r.isUserError());
    assert.ok(r.errorDetails instanceof UserErrorResultDetails);
    assertNoConsoleCalls();
  });
});

import assert from 'node:assert/strict';
import { describe, test, beforeEach, afterEach, mock, type Mock } from 'node:test';

// Results
import { OkResult } from '../src/results/ok-result';
import { ErrorResult } from '../src/results/error-result';

// Error Result Details
import { AssertionFailedErrorResultDetails } from '../src/results/error-result-details/assertion-failed-error-result-details';
import { TechnicalErrorResultDetails } from '../src/results/error-result-details/technical-error-result-details';
import { UserErrorResultDetails } from '../src/results/error-result-details/user-error-result-details';

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

describe('Result processing and type guard methods', () => {
  test('foldNoCatch routes to onError for error results and provides correct instance', () => {
    const err = new ErrorResult<TechnicalErrorResultDetails>(
      new TechnicalErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'TE', errorMessage: 'boom' })
    );
    const out = err.foldNoCatch(
      () => 'success-path',
      (e) => {
        assert.ok(e instanceof TechnicalErrorResultDetails);
        return 'error-path';
      },
    );
    assert.equal(out, 'error-path');
  });

  test('ErrorResult valueOrNull / valueOrUndefined / valueOrDefault / valueOrElse behave as error result', () => {
    const err = new ErrorResult<UserErrorResultDetails>(
      new UserErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'UE', errorMessage: 'nope' })
    );

    assert.equal(err.valueOrNull(), null);
    assert.equal(err.valueOrUndefined(), undefined);
    assert.equal(err.valueOrDefault(123), 123);
    assert.equal(err.valueOrElse((e) => e.errorCode ?? 'missing'), 'UE');
  });

  test('ErrorResult errorDetailsOrNull / errorDetailsOrUndefined / errorDetailsOrDefault / errorDetailsOrElse return error details', () => {
    const errDetails = new TechnicalErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'TE', errorMessage: 'boom' });
    const err = new ErrorResult<TechnicalErrorResultDetails>(errDetails);

    assert.equal(err.errorDetailsOrNull(), errDetails);
    assert.equal(err.errorDetailsOrUndefined(), errDetails);
    assert.equal(err.errorDetailsOrDefault('x'), errDetails);
    assert.equal(err.errorDetailsOrElse(() => 'fallback'), errDetails);
  });

  test('ErrorResult errorDetailsOrThrow returns the error details and does not call error factory', () => {
    const errDetails = new TechnicalErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'TE', errorMessage: 'boom' });
    const err = new ErrorResult<TechnicalErrorResultDetails>(errDetails);
    const errorFactory = mock.fn(() => new Error('should not be called'));

    const out = err.errorDetailsOrThrow(errorFactory);
    assert.equal(out, errDetails);
    assert.equal(errorFactory.mock.calls.length, 0);
  });

  test('ErrorResult toTuple returns [undefined, errorDetails]', () => {
    const errDetails = new TechnicalErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'TE', errorMessage: 'boom' });
    const err = new ErrorResult<TechnicalErrorResultDetails>(errDetails);
    const tuple = err.toTuple();
    assert.deepEqual(tuple, [undefined, errDetails]);
  });

  test('mapNoCatch on error results returns the same error instance (re-typed) and does not call the mapper', () => {
    const err = new ErrorResult<UserErrorResultDetails>(
      new UserErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'UE', errorMessage: 'nope' })
    );
    const mapper = mock.fn(() => 'should-not-run');

    const out = err.mapNoCatch(mapper);

    assert.equal(mapper.mock.calls.length, 0);
    assert.equal(out, err);
    assert.ok(out instanceof ErrorResult);
    assert.ok(out.errorDetails instanceof UserErrorResultDetails);
  });

  test('mapError on error results calls the mapper and returns a new error details instance', () => {
    const err = new ErrorResult<UserErrorResultDetails>(
      new UserErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'UE', errorMessage: 'nope' })
    );
    const mapper = mock.fn(() => new TechnicalErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'TE2', errorMessage: 'mapped' }));

    const out = err.mapError(mapper);

    assert.equal(mapper.mock.calls.length, 1);
    assert.ok(out instanceof ErrorResult);
    assert.ok(out.errorDetails instanceof TechnicalErrorResultDetails);
    assert.equal(out.errorDetails.errorCode, 'TE2');
  });

  test('foldCatchDefault returns TechnicalErrorResult when onOk callback throws', () => {
    const ok = ResultFactory.ok(42);
    const out = ok.foldCatchDefault(
      { context },
      () => {
        throw new Error('boom');
      },
      () => 'unreachable'
    );

    assert.ok(out instanceof ErrorResult);
    assert.ok(out.errorDetails instanceof TechnicalErrorResultDetails);
    assert.ok(errorSpy.mock.calls.length > 0);
  });

  test('andThenNoCatch on error results returns the same error instance (re-typed) and does not call the function', () => {
    const err = new ErrorResult<TechnicalErrorResultDetails>(
      new TechnicalErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'TE', errorMessage: 'boom' })
    );
    const fn = mock.fn(() => ResultFactory.ok('should-not-run'));

    const out = err.andThenNoCatch(fn);

    assert.equal(fn.mock.calls.length, 0);
    assert.equal(out, err);
    assert.ok(out instanceof ErrorResult);
    assert.ok(out.errorDetails instanceof TechnicalErrorResultDetails);
  });

  test('orElseNoCatch on error results calls the function and returns its result', () => {
    const err = new ErrorResult<TechnicalErrorResultDetails>(
      new TechnicalErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'TE', errorMessage: 'boom' })
    );

    const fn = mock.fn(() => ResultFactory.ok(123));
    const out = err.orElseNoCatch(fn);
    assert.equal(fn.mock.calls.length, 1);
    assert.ok(out instanceof OkResult);
    assert.equal(out.value, 123);

    const fn2 = mock.fn(() => ResultFactory.assertionFailedError({}, 'ERR2', 'A different error'));
    const out2 = err.orElseNoCatch(fn2);
    assert.equal(fn2.mock.calls.length, 1);
    assert.ok(out2 instanceof ErrorResult);
    assert.ok(out2.errorDetails instanceof AssertionFailedErrorResultDetails);
    assert.equal(out2.errorDetails.errorCode, 'ERR2');
  });

  test('valueOrThrow throws the Error created by the provided factory for error results', () => {
    const err = new ErrorResult<UserErrorResultDetails>(
      new UserErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'UE', errorMessage: 'nope' })
    );
    assert.throws(
      () => err.valueOrThrow((e) => new Error(String(e.errorMessage))),
      Error,
    );
  });

  test('valueOrThrow throws custom Error created by factory', () => {
    const err = new ErrorResult<AssertionFailedErrorResultDetails>(
      new AssertionFailedErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'AF', errorMessage: 'assert' })
    );
    assert.throws(
      () => err.valueOrThrow(() => new Error('custom')),
      (thrown: unknown) => {
        assert.ok(thrown instanceof Error);
        assert.equal(thrown.message, 'custom');
        return true;
      },
    );
  });

  test('isX type guards discriminate specific error kinds', () => {
    const a = ResultFactory.apiError({ context, correlationId, log: false }, { title: 't' });
    const af = ResultFactory.assertionFailedError({ context, correlationId, errorInstanceId, log: false }, 'AF', 'm');
    const te = ResultFactory.technicalError({ context, correlationId, errorInstanceId, log: false }, 'TE', 'm');
    const ue = ResultFactory.userError({ context, correlationId, errorInstanceId, log: false }, 'UE', 'm');
    const sc = ResultFactory.shortCircuitedError({ context, correlationId, errorInstanceId, log: false }, 'SC', 'm');

    assert.equal(a.isApiError(), true);
    assert.equal(a.isAssertionFailedError(), false);

    assert.equal(af.isAssertionFailedError(), true);
    assert.equal(af.isTechnicalError(), false);

    assert.equal(te.isTechnicalError(), true);
    assert.equal(te.isUserError(), false);

    assert.equal(ue.isUserError(), true);
    assert.equal(ue.isShortCircuitedError(), false);

    assert.equal(sc.isShortCircuitedError(), true);
    assert.equal(sc.isApiError(), false);
  });
});

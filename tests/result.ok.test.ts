import assert from 'node:assert/strict';
import { describe, test, mock } from 'node:test';

// Results
import { OkResult } from '../src/results/ok-result';

// Factories
import { ResultFactory } from '../src/results/result.factory';

describe('OkResult', () => {
  test('success returns a OkResult with correct discriminants and value', () => {
    const payload = { stuff: 'we have stuff' };
    const res = ResultFactory.ok(payload);

    assert.ok(res instanceof OkResult);
    assert.equal(res.isOk, true);
    assert.equal(res.isError, false);
    assert.equal(res.discriminantTag, 'OkResult');
    assert.equal(res.errorDetails, undefined);
    assert.deepEqual(res.value, payload);
  });

  test('mapNoCatch returns a OkResult with mapped value', () => {
    const res = ResultFactory.ok({ a: 1 });
    const mapped = res.mapNoCatch((v) => (v.a + 1).toString());

    assert.ok(mapped instanceof OkResult);
    assert.equal(mapped.isOk, true);
    assert.equal(mapped.discriminantTag, 'OkResult');
    assert.equal(mapped.value, '2');
  });

  test('mapNoCatch propagates errors thrown by the mapper function', () => {
    const res = ResultFactory.ok(1);
    assert.throws(() => res.mapNoCatch(() => {
      throw new Error('boom');
    }), Error);
  });

  test('andThenNoCatch on success calls the function and returns its result', () => {
    const res = ResultFactory.ok(1);
    const fn = mock.fn((n: number) => ResultFactory.ok(n + 1));
    const next = res.andThenNoCatch(fn);

    assert.equal(fn.mock.calls.length, 1);
    assert.ok(next instanceof OkResult);
    assert.equal(next.value, 2);
  });

  test('orElseNoCatch on success returns the original ok result and does not call the function', () => {
    const res = ResultFactory.ok(1);
    const fn = mock.fn(() => {
      throw new Error('should not be called');
    });
    const out = res.orElseNoCatch(fn);

    assert.equal(fn.mock.calls.length, 0);
    assert.equal(out, res);
    assert.ok(out instanceof OkResult);
    assert.equal(out.value, 1);
  });

  test('mapError on success returns the same ok instance and does not call the mapper', () => {
    const res = ResultFactory.ok(1);
    const mapper = mock.fn(() => {
      throw new Error('should not be called');
    });

    const out = res.mapError(mapper);

    assert.equal(mapper.mock.calls.length, 0);
    assert.equal(out, res);
    assert.ok(out instanceof OkResult);
    assert.equal(out.value, 1);
  });

  test('foldNoCatch calls onOk and returns its result', () => {
    const res = ResultFactory.ok({ a: 1 });

    const output = res.foldNoCatch(
      (value) => value.a + 1,
      () => -1,
    );

    assert.equal(output, 2);
  });

  test('valueOrThrow returns unwrapped value', () => {
    const res = ResultFactory.ok(41);
    const v = res.valueOrThrow(() => new Error('unreachable')) + 1;
    assert.equal(v, 42);
  });

  test('valueOrThrow does not call error factory on ok results', () => {
    const res = ResultFactory.ok('x');
    const v = res.valueOrThrow(() => new Error('should not be used')) + 'y';
    assert.equal(v, 'xy');
  });

  test('valueOrNull / valueOrUndefined / valueOrDefault / valueOrElse return the unwrapped ok value', () => {
    const res = ResultFactory.ok(42);

    assert.equal(res.valueOrNull(), 42);
    assert.equal(res.valueOrUndefined(), 42);
    assert.equal(res.valueOrDefault(0), 42);
    assert.equal(res.valueOrElse(() => 0), 42);
  });

  test('errorDetailsOrNull / errorDetailsOrUndefined / errorDetailsOrDefault / errorDetailsOrElse behave as ok result', () => {
    const res = ResultFactory.ok(42);

    assert.equal(res.errorDetailsOrNull(), null);
    assert.equal(res.errorDetailsOrUndefined(), undefined);
    assert.equal(res.errorDetailsOrDefault('x'), 'x');
    assert.equal(res.errorDetailsOrElse(() => 'fallback'), 'fallback');
  });

  test('errorDetailsOrThrow throws the Error created by the provided factory for ok results', () => {
    const res = ResultFactory.ok(42);
    const errorFactory = mock.fn(() => new Error('Expected error'));

    assert.throws(
      () => res.errorDetailsOrThrow(errorFactory),
      (thrown: unknown) => {
        assert.ok(thrown instanceof Error);
        assert.equal(thrown.message, 'Expected error');
        return true;
      },
    );
    assert.equal(errorFactory.mock.calls.length, 1);
  });

  test('toTuple returns [value, undefined] for ok results', () => {
    const res = ResultFactory.ok(42);
    const tuple = res.toTuple();
    assert.deepEqual(tuple, [42, undefined]);
  });

  test('toVoidResult returns OkResult<void> with undefined value', () => {
    const res = ResultFactory.ok('value');
    const voidRes = res.toVoidResult();

    assert.ok(voidRes instanceof OkResult);
    assert.equal(voidRes.isOk, true);
    assert.equal(voidRes.discriminantTag, 'OkResult');
    assert.equal(voidRes.value, undefined);
  });
});

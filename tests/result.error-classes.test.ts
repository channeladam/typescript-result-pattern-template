import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

// Types
import { type HttpApiProblemDetails, HttpStatusCode } from '../src/apis/http.ietf.types';

// Error Result Details
import { ApiErrorResultDetails } from '../src/results/error-result-details/api-error-result-details';
import { AssertionFailedErrorResultDetails } from '../src/results/error-result-details/assertion-failed-error-result-details';
import { ShortCircuitedErrorResultDetails } from '../src/results/error-result-details/short-circuited-error-result-details';
import { TechnicalErrorResultDetails } from '../src/results/error-result-details/technical-error-result-details';
import { UserErrorResultDetails } from '../src/results/error-result-details/user-error-result-details';
import { LoggingUtils } from '../src/logging/logging.utilities';

const context = ['Domain', 'App', 'Service', 'op'];
const correlationId = 'corr-1';
const errorInstanceId = 'err-1';

describe('Error Result Classes', () => {
  test('formatErrorResult returns formatted string', () => {
    const err = new TechnicalErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'TE', errorMessage: 'boom' });
    const s = err.formatErrorResult();
    const formattedContext = LoggingUtils.formatStandardCallerContext(context);
    assert.equal(s, `${formattedContext} - TE - boom`);
  });

  test('AssertionFailedErrorResultDetails basic shape', () => {
    const err = new AssertionFailedErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'AF', errorMessage: 'failed' });
    assert.equal(err.discriminantTag, 'AssertionFailedError');
    assert.equal(err.errorCode, 'AF');
    assert.equal(err.errorMessage, 'failed');
    assert.equal(err.context, context);
    assert.equal(err.correlationId, correlationId);
    assert.equal(err.errorInstanceId, errorInstanceId);
    assert.equal(AssertionFailedErrorResultDetails.isInstance(err), true);
  });

  test('TechnicalErrorResultDetails basic shape', () => {
    const err = new TechnicalErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'TE', errorMessage: 'boom' });
    assert.equal(err.discriminantTag, 'TechnicalError');
    assert.equal(err.correlationId, correlationId);
    assert.equal(err.errorInstanceId, errorInstanceId);
    assert.equal(TechnicalErrorResultDetails.isInstance(err), true);
  });

  test('UserErrorResultDetails basic shape', () => {
    const err = new UserErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'UE', errorMessage: 'nope' });
    assert.equal(err.discriminantTag, 'UserError');
    assert.equal(err.correlationId, correlationId);
    assert.equal(err.errorInstanceId, errorInstanceId);
    assert.equal(UserErrorResultDetails.isInstance(err), true);
  });

  test('ShortCircuitedErrorResultDetails basic shape', () => {
    const err = new ShortCircuitedErrorResultDetails({ context, correlationId, errorInstanceId, errorCode: 'SC', errorMessage: 'skipped' });
    assert.equal(err.discriminantTag, 'ShortCircuitedError');
    assert.equal(err.correlationId, correlationId);
    assert.equal(err.errorInstanceId, errorInstanceId);
    assert.equal(ShortCircuitedErrorResultDetails.isInstance(err), true);
  });

  test('ApiErrorResultDetails uses title as error message', () => {
    const details: HttpApiProblemDetails = {
      type: 'about:test',
      title: 'Bad Request',
      status: HttpStatusCode.BadInvalidRequest400,
      detail: 'Invalid',
      instance: '/x'
    };
    const err = new ApiErrorResultDetails({ context, correlationId }, details);
    assert.equal(err.discriminantTag, 'ApiError');
    assert.equal(ApiErrorResultDetails.isInstance(err), true);
    // message is title or detail
    assert.equal(err.errorMessage, 'Bad Request');
    assert.equal(err.correlationId, correlationId);
    assert.equal(err.errorInstanceId, details.instance);
  });

  test('ErrorInstanceId is auto-generated when not provided', () => {
    const err = new TechnicalErrorResultDetails({ context, correlationId, errorCode: 'TE', errorMessage: 'boom' });
    const generated1 = err.errorInstanceId;
    const generated2 = err.errorInstanceId;

    assert.ok(typeof generated1 === 'string');
    assert.ok(generated1.length > 0);
    assert.equal(generated1, generated2);
    assert.match(generated1, /^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });
});

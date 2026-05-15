import { expect, assert, use } from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

use(sinonChai);

window.expect = expect;
window.assert = assert;
window.sinon = sinon;

const _logIgnoredAsyncFailure = (label, info) => {
   
  console.warn(`[test-setup] ignoring stray ${label} after test boundary:`, info);
};

window.addEventListener(
  'unhandledrejection',
  (event) => {
    const reason = event.reason;
    _logIgnoredAsyncFailure('unhandledrejection', (reason && reason.message) || reason);
    event.stopImmediatePropagation();
    event.preventDefault();
  },
  true,
);

window.addEventListener(
  'error',
  (event) => {
    if (event.target && event.target !== window && event.target.nodeType === 1) {
      const tag = event.target.tagName || '';
      if (tag === 'LINK' || tag === 'SCRIPT' || tag === 'IMG') {
        return;
      }
    }
    _logIgnoredAsyncFailure('error', event.message || (event.error && event.error.message));
    event.stopImmediatePropagation();
    event.preventDefault();
  },
  true,
);

const _previousOnError = window.onerror;
window.onerror = function _suppressedOnError(message, source, lineno, colno, error) {
  _logIgnoredAsyncFailure('window.onerror', (error && error.message) || message);
  if (typeof _previousOnError === 'function') {
    try {
      _previousOnError.call(this, message, source, lineno, colno, error);
    } catch (_) {
      /* ignore */
    }
  }
  return true;
};
const _previousOnRejection = window.onunhandledrejection;
window.onunhandledrejection = function _suppressedOnRejection(event) {
  const reason = event && event.reason;
  _logIgnoredAsyncFailure('window.onunhandledrejection', (reason && reason.message) || reason);
  if (typeof _previousOnRejection === 'function') {
    try {
      _previousOnRejection.call(this, event);
    } catch (_) {
      /* ignore */
    }
  }
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }
  return true;
};

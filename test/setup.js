/**
@license
©2026 Hyland Software, Inc. and its affiliates. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * Shared Mocha bootstrap for all nuxeo-elements packages (core, ui, dataviz).
 * Loaded first from each package's test/load-all-tests.js barrel.
 *
 * What this file does:
 * - Registers Chai, Sinon, and common globals (`expect`, `assert`, `sinon`) expected by legacy tests.
 * - Installs error/rejection suppression so stray async failures between tests don't abort the run.
 * - Patches sinon.stub to handle non-configurable Polymer element properties.
 * - Auto-restores leaked sinon fakes/clocks after each test.
 *
 * Coverage strategy:
 * Istanbul source instrumentation (via rollup-plugin-istanbul in web-test-runner.config.mjs) only
 * reports modules that the browser actually loaded. Files never imported by any test are NOT
 * bulk-loaded here — they are added as 0% records by `scripts/test/unit/inject-zero-coverage.js`
 * after the run. This keeps coverage honest: only code that tests actually exercise gets a
 * non-zero percentage.
 */

import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.config.includeStack = true;
chai.use(sinonChai);

// Globals previously provided by legacy Karma HTML test pages; many suites assume these exist.
globalThis.chai = chai;
globalThis.sinon = sinon;

// Sinon refuses to stub non-configurable accessors (common on Polymer / Nuxeo.Element:
// `i18n`, `navigateTo`, etc.). Shadow the property with a configurable own data property whose
// value is an anonymous `sinon.stub()` so existing patterns keep working:
// `sinon.stub(el, 'i18n').callsFake(fn)` and `const s = sinon.stub(el, 'navigateTo')`.
(function patchSinonStubForNonConfigurableProps() {
  const origStub = sinon.stub.bind(sinon);
  const isNonConfigurableStubError = (err) =>
    err instanceof TypeError &&
    (String(err.message).includes('non-configurable') || String(err.message).includes('non configurable'));

  sinon.stub = function stubPatched(...args) {
    // Only the two-argument form `sinon.stub(obj, prop)` can hit the non-configurable-property error,
    // so forward every other arity (0-arg `sinon.stub()`, 1-arg `sinon.stub(obj)`, 3+-arg fakes)
    // untouched to preserve Sinon's exact behavior.
    if (args.length !== 2) {
      return origStub(...args);
    }
    const [obj, prop] = args;
    try {
      return origStub(obj, prop);
    } catch (err) {
      if (!isNonConfigurableStubError(err) || obj == null || typeof prop !== 'string') {
        throw err;
      }
      const fake = sinon.stub();
      Object.defineProperty(obj, prop, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: fake,
      });
      const innerRestore = typeof fake.restore === 'function' ? fake.restore.bind(fake) : () => {};
      fake.restore = () => {
        try {
          delete obj[prop];
        } catch (_) {
          /* ignore */
        }
        innerRestore();
      };
      return fake;
    }
  };
})();

// Common assertion entry points used throughout the test suite.
globalThis.expect = chai.expect;
globalThis.assert = chai.assert;

// Prevent stray async errors from killing the entire mocha run.
//
// Why: a few suites trigger fetches / Polymer observers whose async work resolves AFTER the
// triggering test has already passed. When those requests reject as 404 / Aborted / Invalid json
// AFTER the test ends, the unhandled rejection / window error reaches mocha and the test runner,
// which can abort the run and treat it as complete. Result: the remaining tests in the offending
// suite (and every suite registered after it) never execute, the test count is artificially low,
// and coverage on those modules looks like 0%.
//
// The capture-phase listeners below intercept stray events before mocha's listeners can see them,
// but only after Mocha has actually started running suites AND no test is actively running. Benign
// 404 / Invalid json noise is silently dropped; other stray failures are logged via console.debug
// so they don't pollute CI output but remain available when debugging locally.
//
// `_mochaStarted` guards against suppressing errors thrown during initial test-module loading and
// suite registration (before any Mocha hook has run). Without that guard, real import failures
// would be silently swallowed and the run would continue with missing suites.
let _testRunning = false;
let _mochaStarted = false;

if (typeof window.suiteSetup === 'function') {
  window.suiteSetup(() => {
    _mochaStarted = true;
    _testRunning = true;
  });
}

if (typeof window.setup === 'function') {
  window.setup(() => {
    _testRunning = true;
  });
}

if (typeof window.teardown === 'function') {
  window.teardown(function _markTestBoundaryEnd() {
    // Defer flipping the flag until after all other teardown hooks have run, so genuine errors
    // thrown during fixture cleanup are not suppressed. A microtask is used instead of setTimeout
    // so it is unaffected by Sinon fake timers that may still be active during teardown.
    Promise.resolve().then(() => {
      _testRunning = false;
    });
  });
}

if (typeof window.suiteTeardown === 'function') {
  window.suiteTeardown(() => {
    _testRunning = false;
  });
}

const _shouldSuppressStrayAsyncFailure = () => _mochaStarted && !_testRunning;

const _isBenignNuxeoNetworkFailure = (info) => {
  if (info == null) {
    return false;
  }
  const message = String(typeof info === 'object' && info.message != null ? info.message : info);
  const hasBenignMessage =
    message.includes('Invalid json') ||
    message.includes('No message') ||
    /NetworkError|Failed to fetch|Load failed|Unexpected end of JSON input|Could not find requested file/i.test(
      message,
    );
  if (!hasBenignMessage) {
    return false;
  }
  if (typeof info === 'object' && info.status != null) {
    return info.status === 404;
  }
  return message.includes('404') || /NetworkError|Failed to fetch|Load failed/i.test(message);
};

const _logIgnoredAsyncFailure = (label, info) => {
  if (_isBenignNuxeoNetworkFailure(info)) {
    return;
  }
  const display = typeof info === 'object' && info.message != null ? info.message : info;
  // Downgraded to `debug` so it does not pollute the WTR console output for every suppressed
  // post-teardown rejection. Set `WTR_VERBOSE=1` (or open DevTools) to see them.
  // eslint-disable-next-line no-console
  console.debug(`[test-setup] ignoring stray ${label} after test boundary:`, display);
};

// Wrap ResizeObserver to defer notifications via requestAnimationFrame. Chrome occasionally
// dispatches "ResizeObserver loop completed with undelivered notifications" as an uncaught error
// during fixture rendering; mocha's hook runner treats that as a hook failure even though it is
// benign. Deferring callbacks one frame avoids the loop and the error.
if (typeof window.ResizeObserver === 'function') {
  const _OriginalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class _SafeResizeObserver extends _OriginalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        const run = () => {
          try {
            callback(entries, observer);
          } catch (err) {
            if (_testRunning) {
              throw err;
            }
            _logIgnoredAsyncFailure('ResizeObserver', err);
          }
        };
        if (typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(run);
        } else {
          run();
        }
      });
    }
  };
}

window.addEventListener(
  'unhandledrejection',
  (event) => {
    if (!_shouldSuppressStrayAsyncFailure()) {
      return;
    }
    const reason = event.reason;
    if (_isBenignNuxeoNetworkFailure(reason)) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }
    _logIgnoredAsyncFailure('unhandledrejection', reason);
    event.stopImmediatePropagation();
    event.preventDefault();
  },
  true,
);

window.addEventListener(
  'error',
  (event) => {
    // Ignore resource load errors (LINK/SCRIPT/IMG) regardless of test boundary — they are noise.
    const target = event.target;
    const isResourceLoadError =
      target && target !== window && target.nodeType === 1 && ['LINK', 'SCRIPT', 'IMG'].includes(target.tagName || '');
    if (isResourceLoadError) {
      return;
    }
    if (!_shouldSuppressStrayAsyncFailure()) {
      return;
    }
    _logIgnoredAsyncFailure('error', event.error || event.message);
    event.stopImmediatePropagation();
    event.preventDefault();
  },
  true,
);

// Belt-and-braces: mocha's browser bundle installs a `window.onerror` IDL handler which is invoked
// even after `stopImmediatePropagation()` on the error event in some Chrome builds.
const _previousOnError = window.onerror;
window.onerror = function _suppressedOnError(message, source, lineno, colno, error) {
  if (!_shouldSuppressStrayAsyncFailure()) {
    if (typeof _previousOnError === 'function') {
      return _previousOnError.call(this, message, source, lineno, colno, error);
    }
    return false;
  }
  _logIgnoredAsyncFailure('window.onerror', error || message);
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
  if (!_shouldSuppressStrayAsyncFailure()) {
    if (typeof _previousOnRejection === 'function') {
      return _previousOnRejection.call(this, event);
    }
    return false;
  }
  const reason = event && event.reason;
  _logIgnoredAsyncFailure('window.onunhandledrejection', reason);
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

// Restore leaked sinon fakes between every test.
//
// Why: several suites install `sinon.useFakeTimers()` / `sinon.useFakeXMLHttpRequest()` /
// `sinon.fakeServer.create()` and call `clock.restore()` (or equivalent) AFTER assertions. When an
// assertion fails, the restore line never runs and the global `setTimeout` / `Date` / `XHR` stay
// overridden. The next test's timer-bound async work then hangs and mocha reports a hook timeout.
// This safety net disposes of any global sinon doubles left in place after every test.
const _restoreLeakedSinonGlobals = () => {
  try {
    if (sinon.clock && typeof sinon.clock.restore === 'function') {
      sinon.clock.restore();
    }
  } catch (_) {
    /* ignore */
  }
  try {
    if (typeof setTimeout.clock !== 'undefined' && typeof setTimeout.clock.restore === 'function') {
      setTimeout.clock.restore();
    }
  } catch (_) {
    /* ignore */
  }
  try {
    if (window.XMLHttpRequest && window.XMLHttpRequest.restore) {
      window.XMLHttpRequest.restore();
    }
  } catch (_) {
    /* ignore */
  }
  try {
    sinon.restore();
  } catch (_) {
    /* ignore */
  }
};

if (typeof window.teardown === 'function') {
  window.teardown(_restoreLeakedSinonGlobals);
}

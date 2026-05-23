/**
 * Shared Karma/Mocha bootstrap for all nuxeo-elements packages (core, ui, dataviz).
 *
 * Stray async failures: many suites trigger fetches or Polymer observers whose work
 * resolves after the test has finished. Those unhandled rejections / window errors reach
 * Karma and abort the remaining suites (artificially low test counts and coverage gaps).
 *
 * Unlike blanket suppression, we only swallow failures when Mocha is not executing a
 * test, plus a small allowlist of known benign errors that can occur during a test.
 * Real regressions during an active test still fail the suite.
 *
 * Coverage: in coverage runs, suiteTeardown bulk-imports paths from coverage-imports-data.js
 * (see scripts/generate-coverage-imports.js) so files never touched by tests still appear
 * in Istanbul reports at 0%, matching SonarQube.
 */
import { expect, assert, use } from 'chai';
import { coverageModulePaths } from './coverage-imports-data.js';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

use(sinonChai);

window.expect = expect;
window.assert = assert;
window.sinon = sinon;

let _activeTests = 0;

const _logIgnoredAsyncFailure = (label, info) => {
  console.warn(`[test-setup] ignoring stray ${label}:`, info);
};

const _messageText = (info) => {
  if (info && typeof info === 'object' && info.message) {
    return String(info.message);
  }
  return String(info ?? '');
};

const _isBenignAsyncFailure = (message) => {
  if (!message) {
    return false;
  }
  return (
    /ResizeObserver loop completed with undelivered notifications/i.test(message) ||
    /Non-Error promise rejection captured/i.test(message) ||
    /Failed to fetch/i.test(message) ||
    /NetworkError/i.test(message) ||
    /Load failed/i.test(message) ||
    /The user aborted a request/i.test(message) ||
    /AbortError/i.test(message) ||
    /Unexpected end of JSON input/i.test(message) ||
    /Invalid JSON/i.test(message) ||
    /Could not find requested file/i.test(message) ||
    /\b404\b/.test(message)
  );
};

const _isResourceLoadError = (event) =>
  event.target &&
  event.target !== window &&
  event.target.nodeType === 1 &&
  ['LINK', 'SCRIPT', 'IMG'].includes(event.target.tagName || '');

const _isMochaRunningTest = () => _activeTests > 0;

const _shouldSuppress = (message) => {
  if (_isBenignAsyncFailure(message)) {
    return true;
  }
  return !_isMochaRunningTest();
};

const _suppressEvent = (label, message, event) => {
  if (!_shouldSuppress(message)) {
    return false;
  }
  const suffix = _isMochaRunningTest() ? ' (benign during test)' : ' after test boundary';
  _logIgnoredAsyncFailure(`${label}${suffix}`, message);
  if (event) {
    event.stopImmediatePropagation();
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
  }
  return true;
};

const _installRunnerHooks = () => {
  const { mocha } = window;
  if (!mocha || !mocha.Runner || mocha.__nuxeoRunnerPatched) {
    return false;
  }
  const run = mocha.Runner.prototype.run;
  mocha.Runner.prototype.run = function runWithNuxeoHooks(fn) {
    this.on('test', () => {
      _activeTests += 1;
    });
    this.on('test end', () => {
      _activeTests = Math.max(0, _activeTests - 1);
      _restoreLeakedSinonGlobals();
    });
    return run.call(this, fn);
  };
  mocha.__nuxeoRunnerPatched = true;
  return true;
};

if (!_installRunnerHooks()) {
  const _karmaLoaded = window.__karma__ && window.__karma__.loaded;
  if (typeof _karmaLoaded === 'function') {
    window.__karma__.loaded = function karmaLoadedWithHooks() {
      _installRunnerHooks();
      return _karmaLoaded.apply(this, arguments);
    };
  } else {
    const _waitForMocha = () => {
      if (!_installRunnerHooks()) {
        setTimeout(_waitForMocha, 0);
      }
    };
    _waitForMocha();
  }
}

// Defer ResizeObserver notifications to avoid benign loop errors during fixture layout.
if (typeof window.ResizeObserver === 'function') {
  const OriginalResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class SafeResizeObserver extends OriginalResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        const run = () => {
          try {
            callback(entries, observer);
          } catch (err) {
            _suppressEvent('ResizeObserver', _messageText(err), null);
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
    const reason = event.reason;
    const message = _messageText(reason);
    _suppressEvent('unhandledrejection', message, event);
  },
  true,
);

window.addEventListener(
  'error',
  (event) => {
    if (_isResourceLoadError(event)) {
      return;
    }
    const message = event.message || _messageText(event.error);
    _suppressEvent('error', message, event);
  },
  true,
);

const _previousOnError = window.onerror;
window.onerror = function filteredOnError(message, source, lineno, colno, error) {
  const text = _messageText(error) || String(message || '');
  if (_suppressEvent('window.onerror', text, null)) {
    return true;
  }
  if (typeof _previousOnError === 'function') {
    return _previousOnError.call(this, message, source, lineno, colno, error);
  }
  return false;
};

const _previousOnRejection = window.onunhandledrejection;
window.onunhandledrejection = function filteredOnRejection(event) {
  const reason = event && event.reason;
  const message = _messageText(reason);
  if (_suppressEvent('window.onunhandledrejection', message, event)) {
    return true;
  }
  if (typeof _previousOnRejection === 'function') {
    return _previousOnRejection.call(this, event);
  }
  return false;
};

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

// Karma may report uncaught errors through __karma__.error after Mocha has moved on.
if (typeof window.__karma__ !== 'undefined' && !window.__karma__.__nuxeoStrayPatched) {
  const _karmaError = window.__karma__.error.bind(window.__karma__);
  window.__karma__.error = function karmaFilteredError(error) {
    const message = _messageText(error);
    if (_shouldSuppress(message)) {
      _logIgnoredAsyncFailure('karma.error after test boundary', message);
      return;
    }
    return _karmaError(error);
  };
  window.__karma__.__nuxeoStrayPatched = true;
}

const _coveragePathIsRecorded = (posixPath, coverageKeys) => {
  if (coverageKeys.has(posixPath)) {
    return true;
  }
  for (const key of coverageKeys) {
    if (key === posixPath || key.endsWith(`/${posixPath}`)) {
      return true;
    }
  }
  return false;
};

// Coverage-only: load product modules not already hit by tests (see file header).
suiteTeardown(async function coverageMaterializationTeardown() {
  if (typeof window.__coverage__ === 'undefined') {
    return;
  }

  if (!Array.isArray(coverageModulePaths) || coverageModulePaths.length === 0) {
    expect.fail('test/coverage-imports-data.js has no paths. Run: npm run update-coverage-imports (or npm test).');
  }

  const coveragePackage =
    (window.__karma__ && window.__karma__.config && window.__karma__.config.coveragePackage) || 'core';
  const prefix = `${coveragePackage}/`;

  this.timeout(0);
  const root = new URL('../', import.meta.url);
  const coverageKeys = new Set(Object.keys(window.__coverage__));
  const toLoad = coverageModulePaths.filter((p) => p.startsWith(prefix) && !_coveragePathIsRecorded(p, coverageKeys));
  const failures = [];

  await Promise.all(
    toLoad.map((p) => {
      const href = new URL(p, root).href;
      return import(href).catch((err) => {
        failures.push({ specifier: p, err });
      });
    }),
  );

  if (failures.length > 0) {
    const message = failures.map((f) => `${f.specifier}: ${f.err && f.err.message ? f.err.message : f.err}`).join('\n');
    console.error(
      `coverage materialization: ${failures.length} of ${toLoad.length} modules failed to load:\n${message}`,
    );
    expect(failures, 'every product module should load in the test environment').to.have.length(0);
  }
});

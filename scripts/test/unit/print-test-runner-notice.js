#!/usr/bin/env node
/**
 * Prints a short explanation before Web Test Runner starts for a given package.
 * WTR progress shows "1/1 test files" even though dozens of Mocha tests run — this clarifies that.
 *
 * Usage: node scripts/test/unit/print-test-runner-notice.js <core|ui|dataviz>
 */
const glob = require('glob');
const path = require('path');

const root = path.join(__dirname, '../../..');
const VALID_PACKAGES = ['core', 'ui', 'dataviz'];

// Selected out of the allow-list instead of used as given, so the name is provably one of the three
// known packages before it reaches a filesystem path or an output line. The rejected value is
// deliberately not echoed — it is untrusted input, and Veracode reports it as CWE-312 in a log sink.
const requested = process.argv[2] || process.env.NX_PACKAGE || 'core';
const pkg = VALID_PACKAGES.find((name) => name === requested);
if (!pkg) {
  throw new Error(`Unknown package requested — expected one of: ${VALID_PACKAGES.join(', ')}`);
}

const suiteFiles = new Set();
for (const file of glob.sync('**/*.test.js', { cwd: path.join(root, pkg, 'test'), nodir: true })) {
  suiteFiles.add(file.replace(/\\/g, '/'));
}

console.log('');
console.log(`Unit tests [${pkg}] — @web/test-runner + Mocha (TDD)`);
console.log(`  Runner entry : ${pkg}/test/load-all-tests.js  →  Web Test Runner reports 1 test file`);
console.log(`  Suite modules: ${suiteFiles.size} *.test.js files imported in one static graph`);
console.log('  Pass/fail    : counts individual Mocha tests (suites × cases), not runner files');
console.log('  Config       : web-test-runner.config.mjs (NX_PACKAGE=' + pkg + ')');
console.log('');

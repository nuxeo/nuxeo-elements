#!/usr/bin/env node
/**
 * Print a single combined line-coverage percentage across all packages, mirroring how
 * SonarCloud aggregates the per-package lcov reports listed in `sonar.javascript.lcov.reportPaths`.
 *
 * Each package's `web-test-runner --coverage` run (plus inject-zero-coverage.js) writes
 * coverage/<package>/lcov.info. Sonar parses all of them and rolls them up into ONE project
 * coverage number that is line-weighted (pooled lines hit / pooled lines found), not an average
 * of the three percentages. This script reproduces that pooled number locally so the end of
 * `npm test` shows the same kind of figure Sonar reports.
 *
 * Caveat: Sonar additionally applies `sonar.coverage.exclusions`, so its published number can
 * differ slightly. The lcov files here already reflect each package's instrumented source scope,
 * so this is the closest local approximation.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '../../..');
const PACKAGES = ['core', 'ui', 'dataviz'];

function summarizeLcov(lcov) {
  let lf = 0;
  let lh = 0;
  for (const line of lcov.split('\n')) {
    if (line.startsWith('LF:')) {
      lf += Number(line.slice(3));
    } else if (line.startsWith('LH:')) {
      lh += Number(line.slice(3));
    }
  }
  return { lf, lh };
}

function pct(lh, lf) {
  return lf > 0 ? (100 * lh) / lf : 0;
}

function main() {
  let totalLf = 0;
  let totalLh = 0;
  const rows = [];

  for (const pkg of PACKAGES) {
    const lcovFile = path.join(root, 'coverage', pkg, 'lcov.info');
    if (!fs.existsSync(lcovFile)) {
      console.warn(`print-total-coverage: missing ${path.relative(root, lcovFile)} — skipping ${pkg}`);
      continue;
    }
    const { lf, lh } = summarizeLcov(fs.readFileSync(lcovFile, 'utf8'));
    totalLf += lf;
    totalLh += lh;
    rows.push({ pkg, lf, lh });
  }

  const width = 8;
  const lines = [
    '',
    '──────────────────────────────────────────────────────────',
    ' Combined code coverage (lcov, line-weighted — Sonar-style)',
    '──────────────────────────────────────────────────────────',
  ];
  for (const { pkg, lf, lh } of rows) {
    lines.push(`  ${pkg.padEnd(10)} ${`${pct(lh, lf).toFixed(2)} %`.padStart(width)}   (${lh}/${lf} lines)`);
  }
  lines.push('──────────────────────────────────────────────────────────');
  lines.push(
    `  ${'TOTAL'.padEnd(10)} ${`${pct(totalLh, totalLf).toFixed(2)} %`.padStart(
      width,
    )}   (${totalLh}/${totalLf} lines)`,
  );
  lines.push('──────────────────────────────────────────────────────────');
  lines.push('');

  console.log(lines.join('\n'));
}

main();

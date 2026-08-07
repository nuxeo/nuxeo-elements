#!/usr/bin/env node
/**
 * Generate the `analysis.json` consumed by Storybook, replacing `polymer analyze .`.
 *
 * `polymer-cli` was dropped because it is unmaintained and pulled in the bulk of the repo's
 * Dependabot alerts (see ELEMENTS-2018). Only its `analyze` command was actually needed, and
 * that command is a thin wrapper around `polymer-analyzer`, which has no open advisories and is
 * now depended on directly. This script reproduces the wrapper byte for byte:
 *
 *   - `polymer analyze .` expands `.` to every file under the package (globby auto-expands
 *     directory patterns), which `glob('**\/*')` matches exactly.
 *   - the analyzer is built the same way `ProjectConfig#initializeAnalyzer` builds it, with the
 *     package root as both loader root and `packageDir`, and node module resolution.
 *   - `generateAnalysis` is given the same filter, which drops anything under a `test/` segment.
 *
 * Run from the package directory, e.g. `cd ui && node ../scripts/analyze.js analysis.json`.
 * With no output path the JSON goes to stdout.
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { Analyzer, FsUrlLoader, PackageUrlResolver, generateAnalysis } = require('polymer-analyzer');

const isInTests = /(\b|\/|\\)(test)(\/|\\)/;
const isNotTest = (feature) => feature.sourceRange != null && !isInTests.test(feature.sourceRange.file);

async function main() {
  const root = process.cwd();
  const urlResolver = new PackageUrlResolver({ packageDir: root });
  const analyzer = new Analyzer({
    urlLoader: new FsUrlLoader(root),
    urlResolver,
    moduleResolution: 'node',
  });

  // Sorted so the output is reproducible: feature order follows the order files are handed to the
  // analyzer, and a bare directory walk returns entries in filesystem order, which differs between
  // a developer's macOS checkout and Linux CI.
  const sources = glob.sync('**/*', { nodir: true }).sort();
  const analysis = await analyzer.analyze(sources);
  const json = `${JSON.stringify(generateAnalysis(analysis, urlResolver, isNotTest), null, 2)}\n`;

  const out = process.argv[2];
  if (!out) {
    process.stdout.write(json);
    return;
  }
  // Write via a temp file so a failed run cannot leave a truncated analysis.json behind for
  // Storybook to import.
  const tmp = `${out}.tmp`;
  fs.writeFileSync(tmp, json);
  fs.renameSync(tmp, path.resolve(out));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Build script: writes `test/coverage-imports-data.js` (gitignored).
 *
 * Istanbul only records modules loaded in the browser. Files never imported by tests are
 * omitted from local HTML/LCOV when `skipFilesWithNoCoverage` is true — while SonarQube
 * still lists every file under sonar.sources at 0%. This script lists all product `.js`
 * paths; `test/setup.js` bulk-imports them in a coverage-only suiteTeardown.
 *
 * Scope mirrors sonar-project.properties (core, ui, dataviz + sonar.exclusions), minus
 * package barrel entry files (nuxeo-elements.js, nuxeo-ui-elements.js, nuxeo-dataviz-elements.js).
 *
 * Run: `npm run update-coverage-imports` (also runs at the start of `npm test`).
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outFile = path.join(root, 'test', 'coverage-imports-data.js');

const SOURCE_PACKAGES = ['core', 'ui', 'dataviz'];

const EXCLUDE_DIR_NAMES = new Set(['test', 'storybook', 'testing-helpers', 'node_modules', 'coverage']);

const EXCLUDE_PREFIXES = ['ui/viewers/pdfjs/', 'ui/js-interpreter/', 'storybook/', 'testing-helpers/'];

// Package entry barrels (re-export only). Sonar treats them as generated bundles.
const EXCLUDE_BARRELS = new Set([
  'core/nuxeo-elements.js',
  'dataviz/nuxeo-dataviz-elements.js',
  'ui/nuxeo-ui-elements.js',
]);

const shouldSkipDir = (name) => EXCLUDE_DIR_NAMES.has(name);

const shouldSkipFile = (posixPath) =>
  posixPath.endsWith('.test.js') ||
  EXCLUDE_BARRELS.has(posixPath) ||
  EXCLUDE_PREFIXES.some((prefix) => posixPath.startsWith(prefix));

const walkPackageJs = (packageDir) => {
  const results = [];
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ent.isDirectory()) {
        if (shouldSkipDir(ent.name)) {
          continue;
        }
        walk(path.join(dir, ent.name));
        continue;
      }
      if (!ent.name.endsWith('.js')) {
        continue;
      }
      const rel = path.relative(root, path.join(dir, ent.name)).replace(/\\/g, '/');
      if (shouldSkipFile(rel)) {
        continue;
      }
      results.push(rel);
    }
  };
  walk(packageDir);
  return results;
};

const seen = new Set();
for (const pkg of SOURCE_PACKAGES) {
  const pkgDir = path.join(root, pkg);
  if (!fs.existsSync(pkgDir)) {
    console.warn('generate-coverage-imports: skipping missing package dir %s', pkg);
    continue;
  }
  for (const rel of walkPackageJs(pkgDir)) {
    seen.add(rel);
  }
}

const relImports = Array.from(seen).sort();

if (relImports.length === 0) {
  console.error('generate-coverage-imports: matched 0 modules under', SOURCE_PACKAGES.join(', '));
  process.exit(1);
}

const banner = `/**
 * AUTO-GENERATED — do not edit. Regenerate: npm run update-coverage-imports (runs in npm test).
 *
 * Exports \`coverageModulePaths\`: every source module under core/, ui/, and dataviz/
 * (mirroring sonar.sources, minus excludes in generate-coverage-imports.js). Used only for
 * Istanbul: test/setup.js imports these after all tests in coverage mode so local reports
 * match Sonar (untested files appear at 0% instead of being hidden).
 */
`;

const content = `${banner}export const coverageModulePaths = ${JSON.stringify(relImports, null, 2)};
`;

fs.writeFileSync(outFile, content, 'utf8');
// eslint-disable-next-line no-console
console.log('generate-coverage-imports: wrote %d module paths to test/coverage-imports-data.js', relImports.length);

# Unit Test Migration: Karma → Web Test Runner

**JIRA**: ELEMENTS-1972 (mirrors WEBUI-2038 in `nuxeo-web-ui`)
**Branch**: `maintenance-3.1.x` (LTS-2023)
**Reference**: `nuxeo-web-ui` PRs #3209 (LTS-2023) / #3210 (LTS-2025)

---

## Table of Contents

1. [Why Migrate](#why-migrate)
2. [What Changed](#what-changed)
3. [How It Was Done](#how-it-was-done)
4. [Architecture Overview](#architecture-overview)
5. [Monorepo Specifics](#monorepo-specifics)
6. [Coverage](#coverage)
7. [Troubleshooting](#troubleshooting)
8. [Recommendations](#recommendations)

---

## Why Migrate

`nuxeo-elements` is a Lerna / npm-workspaces monorepo with three published packages — `core`,
`ui`, and `dataviz`. Each package was previously tested with Karma. The same problems that drove
the `nuxeo-web-ui` migration apply here.

### Problems with Karma

| Problem                             | Impact                                                                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Deprecated**                      | Karma was deprecated in April 2023 (karma-runner/karma#3804). No further maintenance.                                                    |
| **@open-wc/karma-esm unmaintained** | The ESM plugin enabling native module loading in Karma has no active maintainers and breaks with Node 18+ and modern dependencies.       |
| **Node.js compatibility**           | `karma-esm` relies on legacy hashing that throws on Node 17+ (OpenSSL 3) without `--openssl-legacy-provider`.                            |
| **SauceLabs coupling**              | `karma-sauce-launcher` was already disabled (incompatible with SauceLabs v4).                                                            |
| **Stale Karma packages**            | A dozen `karma-*` plugins, all unmaintained.                                                                                             |
| **CI instability**                  | Karma's suite-registration race (`__karma__.loaded()` firing before all suites register) caused intermittent "fewer tests run" failures. |

### Benefits of Web Test Runner

| Benefit                          | Detail                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Modern, maintained**           | Part of the [@modernweb](https://modern-web.dev/) ecosystem; aligns with the Open WC community.               |
| **Native ESM**                   | Serves modules as-is via a dev server; no Babel or bundling for test execution.                               |
| **Istanbul coverage (no Babel)** | `rollup-plugin-istanbul` instruments sources at serve time; fast and accurate.                                |
| **Puppeteer Chromium**           | Bundled browser avoids system Chrome version mismatches in CI.                                                |
| **Single config**                | One `web-test-runner.config.mjs`, parametrized per package, replaces the Karma config + plugins + ESM config. |
| **Node ≥ 18 native**             | No legacy providers or hacks.                                                                                 |

---

## What Changed

### Dependencies

#### Removed (Karma ecosystem)

```
@open-wc/karma-esm
karma
karma-chrome-launcher
karma-coverage-istanbul-reporter
karma-firefox-launcher
karma-mocha
karma-mocha-reporter
karma-sauce-launcher
karma-source-map-support
karma-sourcemap-loader
karma-static
istanbul-instrumenter-loader
```

#### Added (WTR ecosystem)

```
@web/test-runner          ^0.20.2
@web/test-runner-chrome   ^0.18.1
@web/test-runner-mocha    ^0.9.0
@web/dev-server-rollup    ^0.6.4
puppeteer                 ^24.0.0
rollup-plugin-istanbul    ^5.0.0
cross-env                 ^7.0.3
glob                      ^7.1.3
```

`chai`, `sinon`, `sinon-chai`, `mocha`, and `npm-run-all` are retained (Mocha's browser bundle is
provided by `@web/test-runner-mocha`).

### Files

| Action       | File                                                    | Purpose                                                                                              |
| ------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Removed**  | `karma.conf.js`                                         | Old Karma configuration                                                                              |
| **Added**    | `web-test-runner.config.mjs`                            | WTR configuration (ESM), parametrized by `NX_PACKAGE`                                                |
| **Added**    | `scripts/test/unit/generate-test-load-all.js`           | Writes one barrel per package: `<pkg>/test/load-all-tests.js`                                        |
| **Added**    | `scripts/test/unit/generate-coverage-imports.js`        | Writes the source manifest `test/coverage-imports-data.js`                                           |
| **Added**    | `scripts/test/unit/inject-zero-coverage.js`             | Post-run: adds 0% LCOV records for manifest modules no test loaded (per package)                     |
| **Added**    | `scripts/test/unit/print-test-runner-notice.js`         | Prints an explanatory notice before WTR starts (per package)                                         |
| **Added**    | `scripts/test/unit/web-test-runner-fallback-plugin.mjs` | Serves fallback JSON/JPEG for unstubbed API calls; lets missing layout/template `.html` 404 honestly |
| **Modified** | `test/setup.js`                                         | Shared bootstrap: Chai/Sinon globals, error suppression, sinon patching, leaked-sandbox cleanup      |
| **Modified** | `package.json`                                          | Scripts + devDependencies                                                                            |
| **Modified** | `eslint.config.mjs`                                     | `scripts/**` allowlist; CJS/ESM blocks for the new scripts and config                                |
| **Modified** | `.gitignore`                                            | Ignores the generated barrels and manifest                                                           |
| **Modified** | `sonar-project.properties`                              | Karma → WTR comments; three per-package lcov report paths                                            |
| **Modified** | `.github/workflows/test.yaml`                           | Removed SauceLabs comments; documents the bundled Puppeteer Chromium                                 |

### npm Scripts

| Script                                   | Before (Karma)             | After (WTR)                                                                                                                                  |
| ---------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `test`                                   | `karma start` per package  | `update-coverage-imports && update-test-load-all && npm-run-all test:core test:ui test:dataviz`                                              |
| `test:core` / `test:ui` / `test:dataviz` | `karma start --browsers …` | `print-test-runner-notice <pkg> && cross-env NX_PACKAGE=<pkg> web-test-runner --coverage && cross-env NX_PACKAGE=<pkg> inject-zero-coverage` |
| `test:watch`                             | `karma start --auto-watch` | `update-coverage-imports && update-test-load-all && web-test-runner --watch` (set `NX_PACKAGE` to target ui/dataviz; defaults to `core`)                                                                                                          |
| `pretest`                                | (none)                     | `puppeteer browsers install chrome`                                                                                                          |
| `update-coverage-imports`                | same                       | same                                                                                                                                         |
| `update-test-load-all`                   | same                       | same                                                                                                                                         |

---

## How It Was Done

### 1. Replace Dependencies

```bash
npm uninstall @open-wc/karma-esm karma karma-chrome-launcher \
  karma-coverage-istanbul-reporter karma-firefox-launcher karma-mocha \
  karma-mocha-reporter karma-sauce-launcher karma-source-map-support \
  karma-sourcemap-loader karma-static istanbul-instrumenter-loader

npm install --save-dev @web/test-runner @web/test-runner-chrome \
  @web/test-runner-mocha @web/dev-server-rollup puppeteer \
  rollup-plugin-istanbul cross-env glob
```

### 2. Create `web-test-runner.config.mjs`

A single ESM config parametrized by the `NX_PACKAGE` env var (`core`, `ui`, or `dataviz`):

- `files: ['<pkg>/test/load-all-tests.js']` — the sole entry per run.
- Istanbul instrumentation via `rollup-plugin-istanbul` through `@web/dev-server-rollup`'s
  `fromRollup()` adapter, with native V8 instrumentation disabled (`nativeInstrumentation: false`).
- `appSources: ['<pkg>/**/*.js']` and a shared `coverageExclude` list.
- `chromeLauncher` driving a bundled Puppeteer Chromium (with `--no-sandbox`).
- `filterBrowserLogs` to suppress benign 404 / abort / ResizeObserver noise.
- `testFramework: { config: { ui: 'tdd', timeout: 3000 } }` (Mocha TDD `suite`/`test`).
- `preserveSymlinks: true` so a locally linked `@nuxeo/*` checkout resolves correctly.

### 3. Per-package barrels

`generate-test-load-all.js` writes one barrel per package (`core` → 12, `ui` → 93, `dataviz` → 4
suites). Each barrel imports the shared `test/setup.js` first, then every `*.test.js` in that
package. The single-entry pattern preserves the deterministic suite registration that Karma's
`load-all-tests.js` provided, avoiding registration races.

### 4. Shared `test/setup.js`

One bootstrap shared by all three packages (imported first by every barrel):

- Registers Chai + Sinon globals (`expect`, `assert`, `sinon`).
- Patches `sinon.stub` to tolerate non-configurable Polymer accessors (Sinon's stubbing strictness).
- Suppresses stray async errors / unhandled rejections that fire **after** a test boundary
  (benign `nuxeo-client` 404 / abort noise) without hiding real load-time failures.
- Wraps `ResizeObserver` to defer notifications one frame (avoids the "loop completed" uncaught error).
- Auto-restores leaked sinon fakes/clocks/XHR after every test (`teardown`).

### 5. Coverage helper scripts

- `generate-coverage-imports.js` walks `core/`, `ui/`, `dataviz/` and writes a manifest of all
  instrumentable source paths to `test/coverage-imports-data.js` (148 paths).
- `inject-zero-coverage.js` runs after each package's WTR run, filters the manifest by the current
  `NX_PACKAGE` prefix, and appends 0% LCOV records for any source file no test loaded — so
  `coverage/<pkg>/lcov.info` reflects the whole package, not just exercised files.

### 6. Delete `karma.conf.js` and update CI

`.github/workflows/test.yaml` installs dependencies and runs `npm run test`; the `pretest` hook
provisions the bundled Chromium. The SonarCloud workflow (`sonar.yaml`) is unchanged: it installs
dependencies with `npm install --ignore-scripts` (which skips install lifecycle hooks such as
`postinstall`), but the Chromium install is wired to the `pretest` hook of `npm test` rather than
to an install hook, so it still runs when the Sonar job executes `npm test`.

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            npm test pipeline                              │
├──────────────────────────────────────────────────────────────────────────┤
│  1. generate-coverage-imports.js → test/coverage-imports-data.js (manifest)│
│  2. generate-test-load-all.js    → <pkg>/test/load-all-tests.js × 3        │
│  3. npm-run-all test:core test:ui test:dataviz                            │
│       for each <pkg>:                                                     │
│         a. print-test-runner-notice.js <pkg>     → console notice         │
│         b. NX_PACKAGE=<pkg> web-test-runner      → coverage/<pkg>/lcov.info │
│         c. NX_PACKAGE=<pkg> inject-zero-coverage → coverage/<pkg>/lcov.info │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                  Web Test Runner Execution (one package)                  │
├──────────────────────────────────────────────────────────────────────────┤
│  web-test-runner.config.mjs (NX_PACKAGE=<pkg>)                            │
│  ├── files: ['<pkg>/test/load-all-tests.js']   (sole entry)              │
│  ├── plugins: [ nuxeoTestFallbackPlugin(), fromRollup(istanbul) ]        │
│  ├── browsers: [ chromeLauncher(puppeteer, --no-sandbox) ]               │
│  ├── coverageConfig: { include: ['<pkg>/**/*.js'], exclude: [...] }      │
│  └── filterBrowserLogs: (suppress benign noise)                          │
│                                                                          │
│  <pkg>/test/load-all-tests.js                                            │
│  ├── import '../../test/setup.js'              (shared bootstrap)        │
│  └── import './nuxeo-*.test.js' × N           (all suites in <pkg>)      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Specifics

Unlike `nuxeo-web-ui` (a single app with one barrel), `nuxeo-elements` tests three packages
independently:

| Aspect                | Implementation                                                                                                                   |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Package selection** | `NX_PACKAGE` env var (`core` / `ui` / `dataviz`), set per script via `cross-env`. The config validates it against an allow-list. |
| **Barrels**           | One per package: `<pkg>/test/load-all-tests.js` (gitignored, generated).                                                         |
| **Shared bootstrap**  | A single `test/setup.js` at the repo root, imported first by every barrel.                                                       |
| **Coverage output**   | Per package: `coverage/<pkg>/lcov.info`. Sonar reads all three paths.                                                            |
| **Manifest**          | One shared `test/coverage-imports-data.js`; `inject-zero-coverage.js` filters it by package prefix.                              |

---

## Coverage

Coverage uses Istanbul via `rollup-plugin-istanbul` (no Babel), matching the methodology of the old
Karma + Istanbul setup. Per-package results from a full `npm test`:

| Package   | Tests                  | Final line coverage (lcov) |
| --------- | ---------------------- | -------------------------- |
| `core`    | 164 passed             | 98.40%                     |
| `ui`      | 3407 passed, 2 skipped | 71.14%                     |
| `dataviz` | 29 passed              | 93.49%                     |

Untested source files report 0% via `inject-zero-coverage.js`, so reports include them rather than
silently omitting them. The authoritative baseline lives in SonarCloud's quality gate; the
percentages above drift as modules and tests are added or removed.

```bash
# Quick local check — the last line per package is the inject-zero-coverage summary:
#   "Final code coverage (lcov) [<pkg>]: <N> %"
npm test

# Per-file HTML report (per package)
open coverage/ui/lcov-report/index.html
```

---

## Troubleshooting

| Symptom                                                                  | Cause                                                                                                                                                                                                                 | Fix                                                                                                                                                             |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test` hangs in the `ui` package with 0 passed                       | The dev-server fallback plugin was serving an empty `200` body for missing `.html`, which broke the HTML-imports flow in `nuxeo-document-layout` tests that depend on a real `404` → `onerror` → not-found path.      | The fallback plugin no longer serves `.html`; missing templates/layouts 404 honestly.                                                                           |
| `<method>.restore is not a function` only in the full run (passes alone) | A suite stubbed a prototype method in `suiteSetup` using the **default** sinon sandbox and restored it in `suiteTeardown`. The shared `teardown` runs `sinon.restore()` after every test, prematurely un-stubbing it. | Use a dedicated `sinon.createSandbox()` for cross-test prototype stubs (it survives the global `sinon.restore()`). See `ui/test/nuxeo-user-management.test.js`. |
| `done() called multiple times`                                           | A property change triggers an observer that re-dispatches an event the test listens for.                                                                                                                              | Add `{ once: true }` to the `addEventListener` in the test.                                                                                                     |
| `this.urlFor is not a function` in a `_href`/routing test                | `urlFor` is a computed `RoutingBehavior` property that is `undefined` when no router is set (order-dependent global state).                                                                                           | Stub `urlFor` in the test via `Object.defineProperty(el, 'urlFor', { value: sinon.stub().returns(...) })`.                                                      |
| Browser console only flushes when a suite finishes                       | WTR flushes browser logs at suite completion; a hanging suite shows "0 passed, no logs".                                                                                                                              | Bisect by temporarily editing the barrel to import a subset; use `NX_FINISH_TIMEOUT` to fast-fail.                                                              |

> The `web-test-runner.config.mjs` honors an optional `NX_FINISH_TIMEOUT` env override (ms) for the
> tests-finish timeout — a debugging aid for bisecting hangs.

---

## Recommendations

1. **SonarCloud quality gate** — calibrate per-package thresholds against actual `npm test` output;
   both Karma and WTR use Istanbul AST-based counting, so numbers are directly comparable.
2. **Honest 0% reporting** — keep `inject-zero-coverage.js` in the pipeline so untested files stay
   visible instead of being dropped from the report.
3. **Add a new test** — drop `<pkg>/test/nuxeo-foo.test.js`, then run `npm run update-test-load-all`
   (or `npm test`, which regenerates the barrels automatically).
4. **Cross-test stubs** — prefer a dedicated `sinon.createSandbox()` for any stub that must persist
   across multiple tests in a suite; the shared `teardown` restores the default sandbox after every test.

---

## Summary

| Dimension        | Before                            | After                                       |
| ---------------- | --------------------------------- | ------------------------------------------- |
| Test runner      | Karma 6 (deprecated)              | @web/test-runner 0.20 (active)              |
| ESM support      | @open-wc/karma-esm + Babel        | Native (WTR dev server)                     |
| Coverage engine  | Istanbul (Babel source transform) | Istanbul (rollup-plugin-istanbul, no Babel) |
| Browser          | System / SauceLabs Chrome         | Bundled Puppeteer Chromium                  |
| Node requirement | ≥ 18 (with legacy provider)       | ≥ 18 (no hacks)                             |
| Karma plugins    | 12 packages                       | 0                                           |
| WTR plugins      | —                                 | 1 custom (fallback) + Istanbul              |
| Packages tested  | core, ui, dataviz (Karma each)    | core, ui, dataviz (`NX_PACKAGE`)            |
| CI stability     | Intermittent races                | Deterministic (single-entry barrels)        |

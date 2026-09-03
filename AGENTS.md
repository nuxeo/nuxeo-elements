# Agent Instructions for Nuxeo Elements

## Overview

This is a Polymer 3 web components library for the Nuxeo content services platform. It is a monorepo managed by Lerna with five packages: `core`, `ui`, `dataviz`, `testing-helpers`, and `storybook`. Code ownership: `@nuxeo/ui`. The main development branch is `maintenance-3.1.x`.

## Build & Validate

Always follow this sequence when making changes:

```bash
npm install                # Install all workspace dependencies (Node ≥ 18)
npm run format             # Auto-fix formatting (Polymer lint fix → Prettier → ESLint)
npm run lint               # ESLint + Prettier + Polymer lint — must pass
npm test                   # @web/test-runner unit tests (all packages) — must pass
```

- `npm run lint` runs ESLint, Prettier check, and Polymer lint.
- `npm run format` runs Polymer lint fix first, then Prettier write, then ESLint fix.
- Always run `npm run format` before committing.
- Do NOT commit `.only` in test files.
- To test a single package: `npm run test:core`, `npm run test:ui`, or `npm run test:dataviz`.

## Project Structure

```
core/                → @nuxeo/nuxeo-elements (data access layer)
  nuxeo-element.js   → Base class (Nuxeo.Element extends PolymerElement)
  nuxeo-connection.js → Server connection, auth
  nuxeo-operation.js  → Automation operations
  nuxeo-document.js   → Document CRUD
  nuxeo-resource.js   → REST resource
  nuxeo-page-provider.js → Paginated queries
  nuxeo-search.js     → Search wrapper
  utils.js            → Shared utilities
  test/               → 10 test files
ui/                  → @nuxeo/nuxeo-ui-elements (70+ UI components)
  actions/            → 16 action button components
  widgets/            → 30 form widget components
  viewers/            → PDF, image, video viewers
  nuxeo-data-table/   → Data table (15 files)
  nuxeo-user-group-management/ → User/group admin (11 files)
  search/             → Search form components
  i18n/               → 16 locale files
  test/               → 39 test files
dataviz/             → @nuxeo/nuxeo-dataviz-elements (analytics)
  test/               → 4 test files
testing-helpers/     → @nuxeo/testing-helpers (fixtures, mocks)
storybook/           → Storybook documentation app
test/                → Shared test setup (setup.js)
```

## Coding Patterns

### Core Elements (class-based)

```javascript
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

class MyElement extends Nuxeo.Element {
  static get is() { return 'nuxeo-my-element'; }
  static get properties() { return { /* ... */ }; }
}
customElements.define(MyElement.is, MyElement);
```

### UI Elements (class-based — majority)

```javascript
class MyWidget extends Nuxeo.Element {
  static get is() { return 'nuxeo-my-widget'; }
  static get properties() { return { document: { type: Object } }; }
}
customElements.define(MyWidget.is, MyWidget);
```

A few older elements in `nuxeo-user-group-management/*.html` use the legacy `Polymer({ ... })` factory with `<dom-module>`.

Do NOT convert between legacy and class-based patterns unless explicitly asked.

### Server Communication

Always use Nuxeo Elements for API calls, never `fetch()`:
- `<nuxeo-operation>` — Automation operations
- `<nuxeo-resource>` — REST endpoints
- `<nuxeo-document>` — Document CRUD
- `<nuxeo-page-provider>` — Paginated queries

### Naming Conventions

- Elements: `nuxeo-<name>` (kebab-case)
- Behaviors: PascalCase (e.g., `FormatBehavior`, `FiltersBehavior`)
- Test files: `<package>/test/nuxeo-<element-name>.test.js`
- i18n keys: `this.i18n('key')` or `[[i18n('key')]]` in templates

### Style Rules

- Prettier: `printWidth: 120`, `arrowParens: 'always'` (extends `@open-wc/prettier-config`)
- ESLint: flat config in `eslint.config.mjs`
- Max line length: 120 characters
- `Nuxeo` global is `writable`
- **Do not use optional chaining (`?.`)** in `core/`, `ui/`, or `dataviz/` source files. The Polymer linter/analyzer (`polymer lint`, `polymer analyze`) uses a parser that predates `?.`; it fails to parse the file or drops elements from `analysis.json` (consumed by Storybook and other tooling). Use explicit guards instead — e.g. `(obj && obj.prop)` or `(template && template._templateInfo) || {}`. Vendored code (`ui/viewers/pdfjs/`, `ui/js-interpreter/`) is exempt — do not modify it.

## Testing

### Unit Tests

```bash
npm test              # All packages
npm run test:core     # Core only
npm run test:ui       # UI only
npm run test:dataviz  # Dataviz only
```

- Framework: `@web/test-runner` + Mocha + Chai + Sinon
- Globals available: `expect`, `assert`, `sinon` (configured in `test/setup.js`)
- Element helpers: `@nuxeo/testing-helpers`
- Use `suite`/`test` (Mocha TDD interface), not `describe`/`it`
- Each package is tested independently via the `NX_PACKAGE` env var (set by the `test:core` / `test:ui` / `test:dataviz` scripts using `cross-env`).
- `web-test-runner` loads one generated barrel per package: `<package>/test/load-all-tests.js` (gitignored; regenerated by `npm run update-test-load-all`). The barrel imports `test/setup.js` first, then every `<package>/test/*.test.js`.
- Coverage uses Istanbul via `rollup-plugin-istanbul` (no Babel); `scripts/test/unit/inject-zero-coverage.js` appends 0% records for source files no test loaded. Per-package output: `coverage/<package>/lcov.info`.
- After adding a new `<package>/test/foo.test.js`, run `npm run update-test-load-all` (or `npm test`) to refresh the barrel.
- The `pretest` hook runs `puppeteer browsers install chrome` to provision a bundled Chromium — no system Chrome needed.

## CI Workflow

Push to `maintenance-3.1.x` triggers: **lint → test → storybook → build (tag + publish)** (all must pass).

PRs run lint and test workflows automatically.

- CI uses `npm ci --ignore-scripts` for the main deterministic, lockfile-based install. `--ignore-scripts` skips dependency lifecycle hooks for supply-chain safety; the browser for unit tests is provisioned separately by the `pretest` hook, and native deps (rollup, nx, esbuild) resolve via `optionalDependencies`. (The `sonar.yaml` workflow additionally runs a targeted `npm install --no-package-lock --no-save --ignore-scripts` to pull the latest `@nuxeo` RC packages for analysis.)
- `package-lock.json` is committed and must be kept in sync with `package.json`.
- The version-bump workflows (`main.yaml`, `promote.yaml`) run `npm install --package-lock-only` after bumping versions so the committed lockfile stays consistent.

## Common Pitfalls

- This is a **library** repo — there is no bundler or dev server. Components are consumed via npm by `nuxeo-web-ui`.
- **Do not use optional chaining (`?.`)** in element source — see Style Rules above. Polymer analyze feeds `analysis.json`; `?.` causes elements to go missing from that output.
- Always commit `package-lock.json` changes when dependencies change. CI relies on it for `npm ci`.
- `@nuxeo` npm packages come from `https://packages.nuxeo.com/repository/npm-public/`, not npmjs.org.
- The `ui/` package has its own `eslint.config.mjs` in addition to the root config.
- `ui/viewers/pdfjs/` and `ui/js-interpreter/` are vendored/forked — do not modify.
- Crowdin syncs translations daily — do not manually edit non-English `ui/i18n/messages-*.json` files.

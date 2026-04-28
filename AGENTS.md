# Agent Instructions for Nuxeo Elements

## Overview

This is a Polymer 3 web components library for the Nuxeo content services platform. It is a monorepo managed by Lerna with five packages: `core`, `ui`, `dataviz`, `testing-helpers`, and `storybook`. Code ownership: `@nuxeo/ui`. The main development branch is `lts-2025`.

## Build & Validate

Always follow this sequence when making changes:

```bash
npm install                # Install dependencies (Node ≥ 18)
npm run bootstrap          # Lerna bootstrap (link cross-deps)
npm run lint               # ESLint + Prettier + Polymer lint — must pass
npm test                   # Karma unit tests (all packages) — must pass
npm run format             # Auto-fix formatting (Prettier → ESLint)
```

- `npm run lint` runs ESLint, Prettier check, and Polymer lint.
- `npm run format` runs Prettier write first, then ESLint fix.
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
  test/               → 43 test files
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

### UI Elements (legacy factory — majority)

```javascript
Polymer({
  is: 'nuxeo-my-widget',
  _template: html`...`,
  behaviors: [FormatBehavior, I18nBehavior],
  properties: { document: { type: Object } },
  _myMethod() { ... },
});
```

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

## Testing

### Unit Tests

```bash
npm test              # All packages
npm run test:core     # Core only
npm run test:ui       # UI only
npm run test:dataviz  # Dataviz only
```

- Framework: Karma + Mocha + Chai + Sinon
- Globals available: `expect`, `assert`, `sinon` (configured in `test/setup.js`)
- Element helpers: `@nuxeo/testing-helpers`
- Use `suite`/`test` (Mocha TDD interface), not `describe`/`it`

## CI Workflow

Push to `lts-2025` triggers: **lint → test → storybook → publish** (all must pass).

PRs run lint and test workflows automatically.

## Common Pitfalls

- This is a **library** repo — there is no bundler or dev server. Components are consumed via npm by `nuxeo-web-ui`.
- `@nuxeo` npm packages come from `https://packages.nuxeo.com/repository/npm-public/`, not npmjs.org.
- After `npm install`, run `npm run bootstrap` to link cross-workspace dependencies.
- The `ui/` package has its own `eslint.config.mjs` in addition to the root config.
- `ui/viewers/pdfjs/` and `ui/js-interpreter/` are vendored/forked — do not modify.
- Crowdin syncs translations daily — do not manually edit non-English `ui/i18n/messages-*.json` files.

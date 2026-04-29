# Nuxeo Elements — Copilot Instructions

## Project Overview

Nuxeo Elements is the shared web components library for the Nuxeo content services platform, built with **Polymer 3** (legacy `Polymer({…})` factory pattern and class-based `Nuxeo.Element`). It provides data access, UI, dataviz, and testing components consumed by **Nuxeo Web UI** and third-party applications. Licensed Apache 2.0, owned by Hyland Software.

- **Runtime**: Browser (no server-side JS in production)
- **Node**: ≥ 18
- **Build**: No bundler (library consumed via npm)
- **Package manager**: npm (no yarn/pnpm)
- **Monorepo**: Lerna workspaces (`core`, `ui`, `dataviz`, `testing-helpers`, `storybook`)

## Repository Layout

```
core/                → @nuxeo/nuxeo-elements (data access components)
  nuxeo-element.js   → Base class (extends PolymerElement)
  nuxeo-connection.js → Server connection & auth
  nuxeo-operation.js  → Automation operation calls
  nuxeo-document.js   → Document CRUD
  nuxeo-resource.js   → Generic REST calls
  nuxeo-page-provider.js → Paginated queries
  nuxeo-search.js     → Search wrapper
  utils.js            → Shared utilities
ui/                  → @nuxeo/nuxeo-ui-elements (UI components)
  nuxeo-layout.js     → Dynamic layout loader
  nuxeo-filter.js     → Conditional stamping
  nuxeo-i18n-behavior.js → Internationalization
  nuxeo-format-behavior.js → Formatting utilities
  actions/            → Action buttons (16 components)
  widgets/            → Form widgets (30 components)
  viewers/            → PDF, image, video viewers
  nuxeo-data-table/   → Data table components
  nuxeo-user-group-management/ → User/group admin
  search/             → Search form components
  i18n/               → Localization JSON files (16 languages)
dataviz/             → @nuxeo/nuxeo-dataviz-elements (analytics)
  nuxeo-audit-data.js, nuxeo-repository-data.js, etc.
testing-helpers/     → @nuxeo/testing-helpers (test utilities)
  nuxeo-mock-client.js → Mock Nuxeo client
  test-helpers.js     → Fixture/event helpers
storybook/           → Storybook documentation app
test/                → Shared test setup
```

## Commands

| Task | Command | Notes |
|---|---|---|
| Install | `npm install` | Installs all workspace packages |
| Bootstrap | `npm run bootstrap` | Workspace dependency resolution (runs npm install) |
| Lint | `npm run lint` | ESLint + Prettier check + Polymer lint |
| Format | `npm run format` | Prettier write → ESLint fix |
| All tests | `npm test` | Karma + Chrome headless, all packages |
| Core tests | `npm run test:core` | Tests for `core/` only |
| UI tests | `npm run test:ui` | Tests for `ui/` only |
| Dataviz tests | `npm run test:dataviz` | Tests for `dataviz/` only |
| Storybook | `npm run storybook` | Storybook dev server |

## Coding Conventions

### Polymer / Web Components

- **Core elements**: Use class-based pattern extending `Nuxeo.Element` (which extends `PolymerElement`)
- **UI elements**: Predominantly class-based extending `Nuxeo.Element`. A few older `.html` files in `nuxeo-user-group-management/` use the legacy `Polymer({…})` factory. Do NOT convert between styles unless explicitly asked.
- **Behaviors**: Shared logic uses Polymer behaviors (`FiltersBehavior`, `FormatBehavior`, `RoutingBehavior`, `I18nBehavior`), not mixins.
- **Data access**: Use `<nuxeo-operation>`, `<nuxeo-resource>`, `<nuxeo-document>`, `<nuxeo-page-provider>` for server communication — never raw `fetch()`.

### Style

- **Prettier**: `printWidth: 120`, `arrowParens: 'always'` (extends `@open-wc/prettier-config`)
- **ESLint**: Flat config (`eslint.config.mjs`), `eslint-plugin-html` for `.html` files
- **Max line length**: 120 characters
- **`Nuxeo` global**: Declared as `writable` in ESLint
- Always run `npm run format` before committing

### Naming

- Custom elements: kebab-case prefixed with `nuxeo-` (e.g., `nuxeo-data-table`)
- Test files: `<package>/test/nuxeo-<element-name>.test.js`
- Behaviors: PascalCase (e.g., `FormatBehavior`, `I18nBehavior`)

### i18n

- Message keys in `ui/i18n/messages.json` (English default), translated files are `messages-<locale>.json`
- Access via `this.i18n('key')` or `[[i18n('key')]]` in templates
- Translations synced via Crowdin (`crowdin-conf.yml`)

## Testing

- Framework: Karma + Mocha + Chai + Sinon (globals: `expect`, `assert`, `sinon`)
- Helpers: `@nuxeo/testing-helpers` for fixtures, mock client, and event utilities
- Setup: `test/setup.js` configures chai with sinon-chai
- Browser: ChromeHeadlessNoSandbox
- Test pattern: Use `suite`/`test` (Mocha TDD), not `describe`/`it`
- Do NOT use `.only` in test files

## CI / GitHub Actions

- **Workflows**: lint → test → storybook → build (tag + publish) (sequential gates)
- **Node version**: 22 in CI
- **Registry**: `@nuxeo` packages come from `https://packages.nuxeo.com/repository/npm-public/`
- **Cross-repo**: Changes can trigger nuxeo-web-ui builds
- **Translations**: Crowdin sync runs daily

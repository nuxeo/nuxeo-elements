# Contributing to Nuxeo Elements

## Prerequisites

- **Node.js** ≥ 18
- **npm** (bundled with Node — no yarn or pnpm)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/nuxeo/nuxeo-elements.git
cd nuxeo-elements

# Install all workspace dependencies
npm install

# Run all tests
npm test
```

## Development Workflow

### Making Changes

1. Create a feature branch from `lts-2025`
2. Edit components in the appropriate package (`core/`, `ui/`, `dataviz/`, `testing-helpers/`)
3. Format and lint before committing:

```bash
npm run format   # Prettier + ESLint auto-fix
npm run lint     # Verify lint passes
npm test         # Run all unit tests
```

To test a specific package:

```bash
npm run test:core     # Core elements only
npm run test:ui       # UI elements only
npm run test:dataviz  # Dataviz elements only
```

## Code Style

- **Prettier** handles formatting: 120 char width, `arrowParens: 'always'` (extends `@open-wc/prettier-config`)
- **ESLint** enforces code quality: flat config in `eslint.config.mjs`
- **Polymer lint**: checks Polymer 3 patterns
- Run `npm run format` to auto-fix all
- Run `npm run lint` to check without modifying

Config files:
- `prettier.config.js` — Prettier settings
- `eslint.config.mjs` — ESLint flat config
- `polymer.json` — Polymer lint config
- `ui/eslint.config.mjs` — UI package ESLint overrides

## Writing Components

### Core Elements (class-based)

Core elements extend `Nuxeo.Element` (which extends `PolymerElement`):

```javascript
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

{
  class MyElement extends Nuxeo.Element {
    static get is() {
      return 'nuxeo-my-element';
    }

    static get properties() {
      return {
        myProperty: {
          type: String,
          value: '',
        },
      };
    }

    static get template() {
      return html`<div>[[myProperty]]</div>`;
    }
  }
  customElements.define(MyElement.is, MyElement);
  Nuxeo.MyElement = MyElement;
}
```

### UI Elements (class-based pattern)

Most UI elements use the class-based pattern extending `Nuxeo.Element`:

```javascript
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import Nuxeo from '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { I18nBehavior } from './nuxeo-i18n-behavior.js';

class MyWidget extends Nuxeo.Element {
  static get is() { return 'nuxeo-my-widget'; }
  static get template() {
    return html`
      <style>
        :host { display: block; }
      </style>
      <div>[[i18n('myWidget.label')]]</div>
    `;
  }
  static get properties() {
    return {
      document: { type: Object },
    };
  }
}
customElements.define(MyWidget.is, MyWidget);
```

A few older elements in `nuxeo-user-group-management/*.html` use the legacy `Polymer({ ... })` factory with `<dom-module>`. Do not convert between styles unless explicitly asked.

### Adding i18n Keys

Add English keys to `ui/i18n/messages.json`:

```json
{
  "myWidget.label": "My Widget"
}
```

Do NOT manually edit translated files (`messages-*.json`) — these are managed by Crowdin.

## Testing

### Writing Unit Tests

Create test files at `<package>/test/nuxeo-<element-name>.test.js`:

```javascript
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-my-element.js';

suite('nuxeo-my-element', () => {
  let element;

  setup(async () => {
    element = await fixture(html`<nuxeo-my-element></nuxeo-my-element>`);
  });

  test('should render', () => {
    expect(element).to.exist;
  });
});
```

### Test Conventions

- Use `suite`/`test` (Mocha TDD interface), not `describe`/`it`
- Use `setup`/`teardown`, not `beforeEach`/`afterEach`
- Available globals: `expect`, `assert`, `sinon` (configured in `test/setup.js`)
- Never use `.only` in test files
- Use `@nuxeo/testing-helpers` for fixtures and server mocking

### Test with Server Mock

```javascript
import { fixture, html, login } from '@nuxeo/testing-helpers';
import '../nuxeo-my-element.js';

suite('nuxeo-my-element', () => {
  let server;
  let element;

  setup(async () => {
    server = await login();
    element = await fixture(html`<nuxeo-my-element></nuxeo-my-element>`);
  });

  test('should fetch data', async () => {
    server.respondWith('GET', '/api/v1/path/to/resource', [
      200,
      { 'Content-Type': 'application/json' },
      JSON.stringify({ 'entity-type': 'document', title: 'Test' }),
    ]);
    // trigger and assert...
  });
});
```

## Storybook

To run the interactive documentation:

```bash
npm run storybook
```

Stories are located in `storybook/src/`.

## Working with Nuxeo Web UI

When `nuxeo-web-ui` needs local changes from this repo, the Web UI project has a link script:

```bash
# In the nuxeo-web-ui directory
node scripts/link-nuxeo-elements.js
```

This symlinks `@nuxeo` packages in Web UI's `node_modules` to the local `nuxeo-elements` directories. Note: `npm install` in Web UI will break these symlinks — re-run the link script after.

## Branch Strategy

- The main development branch is `lts-2025`
- Feature branches are created from and merged back to `lts-2025`
- PRs trigger lint and test workflows automatically

## CI/CD

GitHub Actions run on every push to `lts-2025` and on PRs:

1. **Lint** — ESLint + Prettier + Polymer lint
2. **Test** — Karma unit tests (all packages)
3. **Storybook** — Build documentation
4. **Publish** — Publish packages to npm registry (only after all above pass)

## npm Registry

`@nuxeo` scoped packages are published to and installed from:
```
https://packages.nuxeo.com/repository/npm-public/
```

This is configured in `.npmrc`.

## License

Apache License 2.0. All contributions must be compatible with this license.

© Hyland Software, Inc. and its affiliates.

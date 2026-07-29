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

1. Create a feature branch from `maintenance-3.1.x`
2. Edit components in the appropriate package (`core/`, `ui/`, `dataviz/`, `testing-helpers/`)
3. Format and lint before committing:

```bash
npm run format   # Polymer lint --fix + Prettier + ESLint auto-fix
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

### UI Elements (class-based)

Most UI elements use the class-based pattern extending `Nuxeo.Element`:

```javascript
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import '@nuxeo/nuxeo-elements/nuxeo-element.js';
import { I18nBehavior } from './nuxeo-i18n-behavior.js';

class MyWidget extends mixinBehaviors([I18nBehavior], Nuxeo.Element) {
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
import { fixture, fakeServer, html, waitForEvent } from '@nuxeo/testing-helpers';
import '../nuxeo-my-element.js';

suite('nuxeo-my-element', () => {
  let server;
  let element;

  setup(async () => {
    server = fakeServer.create();
    element = await fixture(html`<nuxeo-my-element></nuxeo-my-element>`);
  });

  teardown(() => {
    server.restore();
  });

  test('should fetch data', async () => {
    server.respondWith('GET', '/api/v1/path/to/resource',
      { 'entity-type': 'document', title: 'Test' },
    );
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

- The main development branch is `maintenance-3.1.x`
- Feature branches are created from and merged back to `maintenance-3.1.x`
- PRs trigger lint and test workflows automatically

## CI/CD

GitHub Actions run on every push to `maintenance-3.1.x` and on PRs:

1. **Lint** — ESLint + Prettier + Polymer lint
2. **Test** — @web/test-runner unit tests (all packages)
3. **Storybook** — Build documentation
4. **Publish** — Publish packages to npm registry (only after all above pass)

CI workflows use `npm ci --ignore-scripts` for deterministic, lockfile-based installs from `package-lock.json` (the `--ignore-scripts` flag hardens against supply-chain risks; the unit-test browser is installed via the `pretest` hook). Always commit lockfile changes when dependencies are added or updated.

## npm Registry

`@nuxeo` scoped packages are published to and installed from:
```
https://packages.nuxeo.com/repository/npm-public/
```

This is configured in `.npmrc`.

## License

Apache License 2.0. All contributions must be compatible with this license.

© Hyland Software, Inc. and its affiliates.

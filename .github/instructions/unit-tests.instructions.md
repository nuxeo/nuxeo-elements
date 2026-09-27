---
applyTo: "**/test/**/*.test.js,**/test/**/*.js,test/**"
---

# Unit Tests

## Framework

`@web/test-runner` + Mocha + Chai + Sinon with `@nuxeo/testing-helpers`. Runs in a bundled
Puppeteer Chromium (installed by the `pretest` hook).

## Globals

`test/setup.js` provides: `expect`, `assert`, `sinon` (via chai + sinon-chai).

## Test Structure

```javascript
import { fixture, html } from '@nuxeo/testing-helpers';
import '../nuxeo-my-element.js';

suite('nuxeo-my-element', () => {
  let element;

  setup(async () => {
    element = await fixture(html`<nuxeo-my-element></nuxeo-my-element>`);
  });

  test('should do something', () => {
    expect(element.someProperty).to.equal('value');
  });
});
```

## Rules

- Use `suite`/`test` (Mocha TDD), not `describe`/`it`
- Use `setup`/`teardown`, not `beforeEach`/`afterEach`
- Do NOT use `.only` — lint will block it
- Use `@nuxeo/testing-helpers` for creating elements and mocking server responses
- Property binding in fixtures: `.property="${value}"` syntax
- Test files: `<package>/test/nuxeo-<element-name>.test.js`

## Running

```bash
npm test              # All packages (core, ui, dataviz)
npm run test:core     # Core only
npm run test:ui       # UI only
npm run test:dataviz  # Dataviz only
```

Each package runs separately via the `NX_PACKAGE` env var. `web-test-runner` loads one
generated barrel per package — `<package>/test/load-all-tests.js` (gitignored). After adding a
new test file, run `npm run update-test-load-all` (or `npm test`) to refresh the barrel.
Coverage (Istanbul via `rollup-plugin-istanbul`) is written to `coverage/<package>/lcov.info`;
`scripts/test/unit/inject-zero-coverage.js` appends 0% records for sources no test loaded.

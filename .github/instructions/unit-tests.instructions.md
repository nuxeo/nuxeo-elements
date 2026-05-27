---
applyTo: "**/test/**/*.test.js,**/test/**/*.js,test/**"
---

# Unit Tests

## Framework

Karma + Mocha + Chai + Sinon with `@nuxeo/testing-helpers`.

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
npm test              # All packages
npm run test:core     # Core only
npm run test:ui       # UI only
npm run test:dataviz  # Dataviz only
```

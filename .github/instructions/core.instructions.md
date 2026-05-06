---
applyTo: "core/**/*.js"
---

# Core Data Access Elements

This package (`@nuxeo/nuxeo-elements`) provides declarative data access components.

## Element Pattern

All core elements use the **class-based** pattern extending `Nuxeo.Element`:

```javascript
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

{
  class MyElement extends Nuxeo.Element {
    static get is() { return 'nuxeo-my-element'; }
    static get properties() { return { /* ... */ }; }
    static get template() { return html`...`; }
  }
  customElements.define(MyElement.is, MyElement);
  Nuxeo.MyElement = MyElement;
}
```

Do NOT use the legacy `Polymer({…})` factory for core elements.

## Key Elements

- `nuxeo-connection.js` — Server connection (connectionId: `'nx'` default)
- `nuxeo-document.js` — Document CRUD
- `nuxeo-operation.js` — Automation operations (supports `auto` execution)
- `nuxeo-resource.js` — Generic REST resources
- `nuxeo-page-provider.js` — Paginated queries
- `nuxeo-search.js` — Search with aggregations

## Naming

- Elements: `nuxeo-<name>` (kebab-case)
- All elements register on the `Nuxeo` global namespace

## Testing

- Test files: `core/test/nuxeo-<element-name>.test.js`
- Run: `npm run test:core`

---
applyTo: "ui/**/*.js,ui/**/*.html"
---

# UI Web Components

This package (`@nuxeo/nuxeo-ui-elements`) provides 70+ UI components.

## Element Patterns

- Most elements use the **legacy Polymer factory**: `Polymer({ is: '...', _template: html`...` })`
- Some elements are class-based extending `Nuxeo.Element`
- Do NOT convert between styles unless explicitly asked
- Some elements in `nuxeo-user-group-management/` are `.html` files with `<dom-module>` + inline `<script>` — this is intentional

## Behaviors

Shared logic uses Polymer behaviors (not mixins):
- `I18nBehavior` — `this.i18n('key')` for translations
- `FormatBehavior` — `formatSize()`, `formatDate()` utilities
- `FiltersBehavior` — Document type/facet/permission checks
- `RoutingBehavior` — URL generation helpers
- `LayoutBehavior` — Layout rendering support
- `PageProviderDisplayBehavior` — Result display helpers

## i18n

- Use `this.i18n('key')` in JS or `[[i18n('key')]]` in templates
- Add English keys to `ui/i18n/messages.json`
- Do NOT edit translated files manually — Crowdin manages them

## Naming

- Elements: `nuxeo-<name>` (kebab-case)
- Behaviors: PascalCase (e.g., `FormatBehavior`)

## Style

- Prettier: 120 chars, `arrowParens: 'always'`
- `Nuxeo` is a writable global

## Vendored Code

Do NOT modify: `ui/viewers/pdfjs/`, `ui/js-interpreter/`

## Testing

- Test files: `ui/test/nuxeo-<element-name>.test.js`
- Run: `npm run test:ui`

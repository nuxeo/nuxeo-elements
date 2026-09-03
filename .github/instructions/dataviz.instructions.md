---
applyTo: "dataviz/**/*.js"
---

# Dataviz Elements

This package (`@nuxeo/nuxeo-dataviz-elements`) provides analytics and data visualization components.

## Element Pattern

Dataviz elements use the `AggregateDataBehavior` for shared query logic:

- `nuxeo-audit-data.js` — Audit log analytics
- `nuxeo-repository-data.js` — Repository statistics
- `nuxeo-search-data.js` — Search analytics
- `nuxeo-workflow-data.js` — Workflow analytics
- `nuxeo-es-search.js` — Direct Elasticsearch queries

## Dependencies

- Depends on `@nuxeo/nuxeo-elements` (core) for server communication
- Uses `@nuxeo/moment` for date handling

## Style

- Do not use optional chaining (`?.`) — Polymer lint/analyze predates it and drops elements from `analysis.json`. Use explicit `&&` guards instead.

## Testing

- Test files: `dataviz/test/nuxeo-<element-name>.test.js`
- Run: `npm run test:dataviz`

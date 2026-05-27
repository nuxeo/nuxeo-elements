---
applyTo: "storybook/src/**/*.js,storybook/.storybook/**/*.js"
---

# Storybook

This package (`@nuxeo/nuxeo-elements-storybook`) provides interactive component documentation.

## Framework

- Storybook 10 with `@storybook/web-components-vite`
- Stories use **Lit** `html` (not Polymer) for rendering
- Story files: `storybook/src/elements/<component-name>/<component-name>.stories.js`

## Story Pattern (CSF)

```javascript
import { html } from 'lit';
import '@nuxeo/nuxeo-ui-elements/widgets/nuxeo-my-widget.js';

export default {
  title: 'UI/nuxeo-my-widget',
};

export const Default = {
  args: { /* controls */ },
  render: (args) => html`<nuxeo-my-widget .prop="${args.prop}"></nuxeo-my-widget>`,
};
```

## Server Mocking

- `window.nuxeo.mock` is a `MockClient` instance created in `preview.js`
- Register mock responses at module scope in story files:
  ```javascript
  const server = window.nuxeo.mock;
  server.respondWith('post', '/api/v1/automation/Directory.SuggestEntries', () => DATA);
  ```

## Mock Data

- Shared data fixtures live in `storybook/src/data/*.data.js`
- Export named constants (e.g., `DIRECTORY_SUGGESTION_ENTRIES`, `USER_SUGGESTION_ENTRIES`)

## Configuration

- `main.js` — Story glob: `../src/elements/**/*.stories.js`, Vite aliases
- `preview.js` — Polymer boot imports, mock server setup, i18n, routing

## Commands

- `npm run storybook` — Dev server on port 6006

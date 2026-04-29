# Nuxeo Elements — Architecture

## System Overview

Nuxeo Elements is a library of reusable web components that forms the foundation of Nuxeo Web UI and can be used by third-party applications. It runs entirely in the browser and communicates with a Nuxeo Server backend via REST APIs through declarative web component wrappers.

```
┌──────────────────────────────────────────────────────────────────┐
│                        Consumer Application                      │
│  (e.g., Nuxeo Web UI, custom Polymer/LitElement apps)           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │             @nuxeo/nuxeo-ui-elements (ui/)                 │  │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐   │  │
│  │  │ actions/ │ │widgets/ │ │ viewers/ │ │ data-table/  │   │  │
│  │  └─────────┘ └─────────┘ └──────────┘ └──────────────┘   │  │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────┐   │  │
│  │  │ search/ │ │ tree/   │ │comments/ │ │ permissions/ │   │  │
│  │  └─────────┘ └─────────┘ └──────────┘ └──────────────┘   │  │
│  └─────────────────────────┬──────────────────────────────────┘  │
│                            │ depends on                          │
│  ┌─────────────────────────┴──────────────────────────────────┐  │
│  │             @nuxeo/nuxeo-elements (core/)                  │  │
│  │  ┌────────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐ │  │
│  │  │ connection │ │operation │ │ document  │ │  resource │ │  │
│  │  └────────────┘ └──────────┘ └───────────┘ └───────────┘ │  │
│  │  ┌─────────────┐ ┌──────────┐ ┌───────────┐              │  │
│  │  │page-provider│ │  search  │ │   utils   │              │  │
│  │  └─────────────┘ └──────────┘ └───────────┘              │  │
│  └─────────────────────────┬──────────────────────────────────┘  │
│                            │ REST / Automation API               │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                    Nuxeo Server (Java)                            │
│  ┌─────────────────────────┴───────────────────────────────────┐ │
│  │     REST API / Automation Framework / Page Providers         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | Polymer 3 (legacy factory + class-based) | ^3.5.1 |
| Web Components Polyfills | @webcomponents/webcomponentsjs | ^2.0 |
| Package Manager | npm | ≥ 8 |
| Node.js | Node.js | ≥ 18 |
| Monorepo | Lerna | ^9.0.7 |
| Unit Testing | Karma + Mocha + Chai + Sinon | Various |
| Linting | ESLint 9 (flat config) + Prettier | ^9.0 |
| Documentation | Storybook 10 (web-components-vite) | ^10.3 |

## Package Architecture

### Dependency Graph

```
@nuxeo/nuxeo-ui-elements (ui/)
  └── @nuxeo/nuxeo-elements (core/)
        └── nuxeo (JS client library)

@nuxeo/nuxeo-dataviz-elements (dataviz/)
  └── @nuxeo/nuxeo-elements (core/)

@nuxeo/testing-helpers (testing-helpers/)
  └── @open-wc/testing-helpers
  └── nuxeo (JS client)
  └── sinon

@nuxeo/nuxeo-elements-storybook (storybook/)
  └── @nuxeo/nuxeo-elements
  └── @nuxeo/nuxeo-ui-elements
  └── @nuxeo/testing-helpers
```

### Core Package (`@nuxeo/nuxeo-elements`)

The data access layer. All elements extend `Nuxeo.Element` (class-based pattern):

| Element | Purpose |
|---|---|
| `<nuxeo-connection>` | Server connection & authentication |
| `<nuxeo-document>` | CRUD operations on documents |
| `<nuxeo-resource>` | Generic REST resource calls |
| `<nuxeo-operation>` | Nuxeo Automation operation calls |
| `<nuxeo-page-provider>` | Paginated queries / search |
| `<nuxeo-search>` | Search wrapper with aggregations |
| `<nuxeo-audit-page-provider>` | Audit log queries |
| `<nuxeo-task-page-provider>` | Workflow task queries |

Base class hierarchy:
```
PolymerElement
  └── Nuxeo.Element (core/nuxeo-element.js)
        └── All core elements
```

### UI Package (`@nuxeo/nuxeo-ui-elements`)

70+ UI components organized by function:

| Directory | Component Count | Purpose |
|---|---|---|
| `actions/` | 16 | Document action buttons (delete, download, share, lock, etc.) |
| `widgets/` | 30 | Form widgets (input, select, date, file, suggestion, etc.) |
| `viewers/` | 3 + pdfjs | Content viewers (PDF, image, video) |
| `nuxeo-data-table/` | 15 | Sortable, filterable data table |
| `nuxeo-user-group-management/` | 11 | User and group administration |
| `search/` | 3 | Search form and results layout |
| `nuxeo-document-comments/` | 3 | Threaded document comments |
| `nuxeo-document-permissions/` | 5 | ACL permission management |
| `i18n/` | 16 | Localization files (16 languages) |

### Behaviors (Shared Logic)

Polymer behaviors are the equivalent of mixins. Key behaviors used across the library:

| Behavior | File | Purpose |
|---|---|---|
| `I18nBehavior` | `nuxeo-i18n-behavior.js` | Internationalization (`this.i18n()`) |
| `FormatBehavior` | `nuxeo-format-behavior.js` | Date/number/file size formatting |
| `FiltersBehavior` | `nuxeo-filters-behavior.js` | Document type/facet/permission filtering |
| `RoutingBehavior` | `nuxeo-routing-behavior.js` | URL generation, navigation helpers |
| `LayoutBehavior` | `nuxeo-layout-behavior.js` | Layout rendering support |
| `PageProviderDisplayBehavior` | `nuxeo-page-provider-display-behavior.js` | Page provider result display |
| `DraggableListBehavior` | `nuxeo-draggable-list-behavior.js` | Drag-and-drop list support |

### Dataviz Package (`@nuxeo/nuxeo-dataviz-elements`)

Analytics and data visualization elements:

| Element | Purpose |
|---|---|
| `<nuxeo-audit-data>` | Audit log analytics |
| `<nuxeo-repository-data>` | Repository statistics |
| `<nuxeo-search-data>` | Search analytics |
| `<nuxeo-workflow-data>` | Workflow analytics |
| `<nuxeo-es-search>` | Direct Elasticsearch queries |

### Testing Helpers (`@nuxeo/testing-helpers`)

Test utilities consumed by this repo and by `nuxeo-web-ui`:

| Export | Purpose |
|---|---|
| `fixture(html)` | Create element fixtures for testing |
| `fakeServer.create()` | Preferred helper to set up a fake server for mocking backend responses |
| `waitForEvent(el, event)` | Wait for async events |
| `MockClient` | Preferred mock Nuxeo client for server responses |
| `login()` *(deprecated)* | Legacy authentication/mock setup helper retained for backward compatibility |

## Layout System

`<nuxeo-layout>` dynamically loads and stamps layout elements by href:

```
<nuxeo-layout href="nuxeo-note-view-layout.html" model='{"document": doc}'></nuxeo-layout>
```

The layout system uses `importHref` to dynamically import HTML-based layout files at runtime. Consumer applications (like Web UI) use this to render document-type-specific views.

## Internationalization (i18n)

- 16 languages: ar, cs, de, es-ES, eu, fr, he, id, it, ja, nl, pl, pt-PT, sv-SE, zh-CN + English default
- Message files: `ui/i18n/messages.json` (English), `ui/i18n/messages-<locale>.json`
- Runtime access: `this.i18n('key')` in JS or `[[i18n('key')]]` in Polymer templates
- Translation management: Crowdin (configured in `crowdin-conf.yml`)
- The `nuxeo.I18n.translate()` function handles key lookup with language fallback

## Slot System

`<nuxeo-slots>` provides a named slot mechanism for extensibility:

```html
<nuxeo-slot name="MY_SLOT">
  <nuxeo-slot-content name="myContent" order="10">
    <template><my-element></my-element></template>
  </nuxeo-slot-content>
</nuxeo-slot>
```

Consumer applications register content into named slots, allowing extension without modifying source components.

## Build & Distribution

This is a **library** — there is no bundler or production build step for the components themselves. Packages are published to `https://packages.nuxeo.com/repository/npm-public/` and consumed as npm dependencies.

### Storybook

The `storybook/` package provides interactive documentation using Storybook 10 with Vite:

```bash
npm run storybook    # Dev server
cd storybook && npm run build   # Production build
```

## CI/CD (GitHub Actions)

Workflow orchestration in `.github/workflows/main.yaml`:

```
Push to maintenance-3.1.x triggers:
  lint     → ESLint + Prettier + Polymer lint
  test     → Karma unit tests (all packages)
  storybook → Build storybook documentation
  build    → Tag and publish packages to npm registry
```

Additional workflows: `preview.yaml` (PR preview environments), `cross-repo.yaml` (triggers nuxeo-web-ui builds), `crowdin.yaml` (daily translation sync), `promote.yaml` (release promotion), `cleanup.yaml` (preview namespace cleanup).

## Key Directories Reference

| Path | Description |
|---|---|
| `core/` | Data access elements (@nuxeo/nuxeo-elements) |
| `ui/` | UI components (@nuxeo/nuxeo-ui-elements) |
| `ui/actions/` | Document action button components |
| `ui/widgets/` | Form widget components |
| `ui/viewers/` | Content viewer components |
| `ui/nuxeo-data-table/` | Data table components |
| `ui/nuxeo-user-group-management/` | User/group admin components |
| `ui/search/` | Search form and results components |
| `ui/i18n/` | Localization files |
| `dataviz/` | Analytics elements (@nuxeo/nuxeo-dataviz-elements) |
| `testing-helpers/` | Test utilities (@nuxeo/testing-helpers) |
| `storybook/` | Storybook documentation app |
| `test/` | Shared test setup |

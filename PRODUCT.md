# Nuxeo Elements — Product

## What is Nuxeo Elements?

Nuxeo Elements is a library of reusable web components for building applications on the **Nuxeo Platform**, a content services platform built for managing documents, digital assets, and business content at enterprise scale. It is developed by **Hyland Software** and licensed under Apache 2.0.

Nuxeo Elements provides the building blocks used by **Nuxeo Web UI** (the standard Nuxeo user interface) and is available for third-party developers to build custom content-centric applications.

## Core Capabilities

### Data Access Components (`@nuxeo/nuxeo-elements`)

Declarative web components for communicating with a Nuxeo Server:

- **Server Connection** — Authentication, session management, and server capability detection
- **Document Operations** — Create, read, update, delete documents via REST API
- **Automation** — Execute Nuxeo Automation operations and chains
- **Paginated Queries** — Page providers for efficient large result set browsing
- **Search** — Full-text and metadata search with aggregation support
- **Audit** — Query the platform audit trail
- **Workflow Tasks** — Query and manage workflow task assignments

### UI Components (`@nuxeo/nuxeo-ui-elements`)

70+ ready-to-use UI components:

#### Form Widgets (30 components)
- Text input, textarea, date picker, checkbox, radio buttons
- File upload with drag-and-drop support
- Directory/vocabulary suggestion (dropdown with server-backed options)
- User and group pickers
- Tag input with autocomplete
- Document suggestion and picker
- HTML rich text editor (Quill-based)
- Path suggestion with autocomplete

#### Action Buttons (16 components)
- Add to collection, favorites toggle
- Delete document, untrash document
- Download, export, share
- Lock/unlock toggle
- Notifications toggle
- Preview, workflow actions
- Blob management (delete blob)

#### Content Viewers
- **PDF Viewer** — Full-featured PDF rendering (powered by PDF.js)
- **Image Viewer** — Zoomable image display with Cropper.js integration
- **Video Viewer** — HTML5 video player with storyboard support

#### Data Display
- **Data Table** — Sortable, filterable, configurable columns with inline editing
- **Data Grid** — Grid layout for document cards
- **Data List** — List layout for document entries
- **Justified Grid** — Pinterest-style justified image grid

#### User & Group Management
- Create, edit, and search users and groups
- Permission management with ACL tables
- User profile display and password editing

#### Document Features
- **Comments** — Threaded document discussions
- **Permissions** — ACL-based permission management UI
- **Thumbnails** — Document type-aware thumbnail display
- **Document Picker** — Search and select documents
- **Path Suggestion** — Autocomplete for repository paths

#### Layout System
- **Dynamic Layouts** — Load and render document-type-specific views at runtime
- **Slot System** — Named extension points for pluggable UI composition
- **Search Forms** — Configurable search form and results layouts

#### Navigation
- **Tree** — Hierarchical folder tree navigation
- **Quick Filters** — Aggregation-based faceted filtering
- **Pagination** — Page controls for result sets

### Analytics Components (`@nuxeo/nuxeo-dataviz-elements`)

Data visualization elements for analytics dashboards:

- **Audit Analytics** — Visualize platform event data
- **Repository Analytics** — Repository statistics and metrics
- **Search Analytics** — Search usage patterns
- **Workflow Analytics** — Workflow execution metrics
- **Elasticsearch Search** — Direct Elasticsearch query access

### Testing Utilities (`@nuxeo/testing-helpers`)

Helpers for unit testing Nuxeo web components:

- **Fixtures** — Create and manage test element instances
- **Mock Client** — Simulate Nuxeo server responses
- **Event Helpers** — Wait for asynchronous events
- **Server Mocking** — Use MockClient and fakeServer to simulate authenticated server interactions

## Internationalization

Nuxeo Elements supports 16 languages out of the box:
Arabic, Basque, Chinese (Simplified), Czech, Dutch, English, French, German, Hebrew, Indonesian, Italian, Japanese, Polish, Portuguese, Spanish, Swedish.

Translations are community-managed via Crowdin.

## Target Consumers

| Consumer | Usage |
|---|---|
| **Nuxeo Web UI** | Primary consumer — uses all packages for the standard Nuxeo interface |
| **Nuxeo Studio/Designer** | Layout editor generates HTML using Nuxeo Elements widgets |
| **Custom Applications** | Third-party developers build content apps using these components |

## Technology

- Built with **Polymer 3** web components
- Compatible with any framework that supports web components (Polymer, LitElement, vanilla JS)
- Distributed as npm packages from `@nuxeo` scope
- No bundler required — consumed as ES modules

## Target Environments

- **Browsers**: Chrome, Firefox, Edge, Safari (latest versions)
- **Polyfills**: @webcomponents/webcomponentsjs for older browser support

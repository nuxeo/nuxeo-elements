---
applyTo: "testing-helpers/**/*.js"
---

# Testing Helpers

This package (`@nuxeo/testing-helpers`) provides test utilities for all Nuxeo Elements packages.

## Exports

Re-exports from `index.js`:
- `fixture`, `flush`, `timePasses` — Element creation and async helpers
- `html`, `fixtureCleanup` — Re-exported from `@open-wc/testing-helpers`
- `fakeServer` (`MockClient`) — Mock Nuxeo client for stubbing REST/automation calls
- `waitForEvent`, `waitChanged`, `waitForAttrMutation`, `waitForChildListMutation` — Async event/mutation helpers
- `isElementVisible` — Visibility check utility
- `login` — **Deprecated** since 3.0.0, use `MockClient` instead
- `tap`, `focus`, `pressAndReleaseKeyOn` — Re-exported from `@polymer/iron-test-helpers`

## MockClient (`nuxeo-mock-client.js`)

- `fakeServer.create(user, nuxeoVersion)` — Creates a new mock client instance
- `respondWith(method, path, response)` — Stub a REST response (path can be string or RegExp)
- `rejectWith(method, path, errorPayload)` — Stub an error response
- `mock(method, fn)` — Stub any `Nuxeo.prototype` method
- `getRequests(method, path)` — Get all recorded HTTP calls matching filters
- `getLastRequest(method, path)` — Get the last matching HTTP call
- `restore()` — Reset all mocks (call in `teardown`)

## Key Details

- `window.fetch` is set to `null` in `test-helpers.js` to prevent real network calls
- `fixture()` wraps `@open-wc/testing-helpers` fixture with optional Polymer `flush()`
- Uses `sinon.createSandbox()` internally for mock isolation

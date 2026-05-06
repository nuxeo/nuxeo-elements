---
name: add-i18n-keys
description: Add or update internationalization (i18n) message keys for Nuxeo Elements.
  Use this skill when the user wants to add translations, localization strings, message
  keys, or labels. Updates ui/i18n/messages.json (English). Also use when the user
  mentions adding labels, text strings, or translated content to UI components.
---

# Add i18n Keys

Add internationalization message keys to Nuxeo Elements. The primary file is
`ui/i18n/messages.json` (English). There are 16 locale files total.

## Workflow

1. Determine the message key name (follow existing naming conventions)
2. Determine the English value
3. Add to `ui/i18n/messages.json`
4. Do NOT manually edit other locale files — Crowdin manages translations

## File Locations

```
ui/i18n/messages.json       ← English (primary, always update)
ui/i18n/messages-fr.json    ← French (Crowdin-managed)
ui/i18n/messages-de.json    ← German (Crowdin-managed)
ui/i18n/messages-es-ES.json ← Spanish (Crowdin-managed)
ui/i18n/messages-it.json    ← Italian (Crowdin-managed)
ui/i18n/messages-pt-PT.json ← Portuguese (Crowdin-managed)
ui/i18n/messages-nl.json    ← Dutch (Crowdin-managed)
ui/i18n/messages-sv-SE.json ← Swedish (Crowdin-managed)
ui/i18n/messages-ja.json    ← Japanese (Crowdin-managed)
ui/i18n/messages-pl.json    ← Polish (Crowdin-managed)
ui/i18n/messages-zh-CN.json ← Chinese Simplified (Crowdin-managed)
ui/i18n/messages-ar.json    ← Arabic (Crowdin-managed)
ui/i18n/messages-cs.json    ← Czech (Crowdin-managed)
ui/i18n/messages-eu.json    ← Basque (Crowdin-managed)
ui/i18n/messages-he.json    ← Hebrew (Crowdin-managed)
ui/i18n/messages-id.json    ← Indonesian (Crowdin-managed)
```

## Key Naming Conventions

Keys follow a hierarchical dot-notation pattern. Match the existing conventions:

```
<component>.<purpose>         → "documentActions.delete": "Delete"
<area>.<field>                → "defaultSearch.fullText": "Full Text"
<area>.<field>.<detail>       → "defaultSearch.fullText.placeholder": "Search..."
label.dublincore.<property>   → "label.dublincore.title": "Title"
command.<action>              → "command.confirm": "Confirm"
```

General rules:
- Use **camelCase** for multi-word segments: `fullText`, `modifiedDate`
- Use **dot separators** between hierarchy levels
- Group related keys by prefix
- Common suffixes: `.placeholder`, `.tooltip`, `.heading`, `.label`, `.confirm`, `.cancel`

## How to Use in Elements

In HTML templates (Polymer data binding):
```html
<span>[[i18n('myComponent.title')]]</span>
<nuxeo-input label="[[i18n('myComponent.name')]]"></nuxeo-input>
```

In JavaScript:
```javascript
this.i18n('myComponent.title')
```

## Rules

- **Always add to `ui/i18n/messages.json` first** — this is the source of truth
- Keys are sorted alphabetically in the JSON files — insert in the correct position
- The JSON files are flat objects (no nesting) — keys use dot notation
- Values are plain strings — no HTML, no interpolation
- Do NOT manually edit non-English locale files — translations are synced via Crowdin (`crowdin-conf.yml`)

## Adding a Key

1. Open `ui/i18n/messages.json`
2. Find the correct alphabetical position
3. Insert the key-value pair

Example — adding keys for a new "contracts" feature:

```json
"contracts.heading": "Contracts",
"contracts.create": "Create Contract",
"contracts.search.placeholder": "Search contracts...",
"contracts.status": "Status",
"contracts.expirationDate": "Expiration Date",
```

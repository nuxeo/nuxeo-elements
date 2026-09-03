---
name: fix-dependabot-pr
description: Fix breaking changes in Dependabot version update PRs for Nuxeo Elements.
  Use this skill when a Dependabot PR fails CI (lint or tests) due to a dependency
  upgrade introducing breaking changes. Analyzes the upgrade diff, identifies root
  causes, and applies targeted fixes. Also use when the user mentions fixing dependency
  upgrades, resolving version bumps, or handling breaking changes from automated PRs.
---

# Fix Dependabot PR

Fix CI failures caused by dependency version upgrades in Dependabot PRs.

## Workflow

1. Identify which dependency was upgraded and what changed
2. Run lint and tests to reproduce failures
3. Analyze error output to identify root cause
4. Apply targeted fixes
5. Validate with full CI suite
6. Commit and push fixes

## Identifying the Upgrade

```bash
# See what files changed in the Dependabot PR
gh pr diff <PR_NUMBER> --name-only

# See the actual dependency version changes
gh pr diff <PR_NUMBER> -- package.json core/package.json ui/package.json dataviz/package.json testing-helpers/package.json storybook/package.json

# Check the dependency's changelog/release notes
# Look at the GitHub releases page for the upgraded package
```

## Common Failure Categories

### 1. ESLint Rule Changes

**Symptoms**: `npm run lint` fails with unknown rule or deprecated rule errors.

**Diagnosis**:
```bash
npm run lint:eslint 2>&1 | head -50
```

**Fixes**:
- Update rule names in `eslint.config.mjs` and `ui/eslint.config.mjs`
- Remove deprecated rules
- Add new required rules
- Update plugin imports if plugin API changed

### 2. Prettier Formatting Changes

**Symptoms**: `npm run lint:prettier` shows files not formatted.

**Fix**:
```bash
npm run format:prettier
```

### 3. Karma / Test Runner Changes

**Symptoms**: `npm test` fails before tests even run (config errors).

**Diagnosis**:
```bash
npm run test:core 2>&1 | head -30
```

**Fixes**:
- Update `karma.conf.js` for config format changes
- Update browser launcher config
- Check `@open-wc/karma-esm` compatibility

### 4. Mocha API Changes

**Symptoms**: Tests fail with `TypeError` or `ReferenceError` in test setup.

**Fixes**:
- Check `test/setup.js` for API changes
- Update `suite`/`test`/`setup`/`teardown` usage if interface changed
- Verify `mocha` options in `karma.conf.js`

### 5. Chai Assertion Changes

**Symptoms**: Tests fail with assertion method errors.

**Fixes**:
- Check if assertion methods were renamed or removed
- Update `expect`/`assert` calls in test files
- Check `sinon-chai` plugin compatibility with new chai version

### 6. Sinon Stub/Spy API Changes

**Symptoms**: Tests fail with sinon-related errors (stub creation, spy assertions).

**Fixes**:
- Update `sinon.stub()` / `sinon.spy()` calls if API changed
- Check `sinon.createSandbox()` usage in `testing-helpers/nuxeo-mock-client.js`
- Update `sinon-chai` if needed for compatibility

### 7. Polymer / Web Component Changes

**Symptoms**: Components fail to register or render.

**Fixes**:
- Check import paths for `@polymer/*` packages
- Update lifecycle callback names if changed
- Check `polymer.json` for config compatibility
- Verify `@webcomponents/webcomponentsjs` polyfill compatibility

### 8. Lerna / Workspace Changes

**Symptoms**: `npm run bootstrap` or workspace resolution fails.

**Fixes**:
- Update `lerna.json` for config changes
- Check `package.json` workspace config
- Update npm scripts that invoke lerna

### 9. Peer Dependency Conflicts

**Symptoms**: `npm install` warns about peer dependency mismatches.

**Fixes**:
- Check if other dependencies need upgrading too
- Update `package.json` to align peer dependency versions
- Use `--legacy-peer-deps` only as last resort

## Fix Procedure

### Step 1: Reproduce

```bash
npm install --no-package-lock
npm run bootstrap
npm run lint      # Check lint first
npm test          # Then tests
```

### Step 2: Fix Lint Issues

```bash
# Auto-fix what can be auto-fixed
npm run format

# Re-check
npm run lint
```

If `npm run format` doesn't fix everything, manually fix the remaining issues
based on the error output.

### Step 3: Fix Test Issues

Read test error output carefully. Common patterns:

```
# Single package test for faster iteration
npm run test:core     # If core tests fail
npm run test:ui       # If UI tests fail
npm run test:dataviz  # If dataviz tests fail
```

### Step 4: Validate

```bash
npm run format    # Final formatting pass
npm run lint      # Must pass clean
npm test          # All tests must pass
```

### Step 5: Commit

```bash
git add -A
git commit -m "fix: resolve breaking changes from <package>@<version> upgrade

- <describe what broke>
- <describe what was fixed>

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push
```

## Files You May Need to Modify

| File | When |
|------|------|
| `eslint.config.mjs` | ESLint/plugin upgrades |
| `ui/eslint.config.mjs` | ESLint/plugin upgrades (UI-specific rules) |
| `karma.conf.js` | Karma/test runner upgrades |
| `test/setup.js` | Chai/sinon/mocha upgrades |
| `polymer.json` | Polymer CLI upgrades |
| `lerna.json` | Lerna upgrades |
| `package.json` | Any dependency upgrade (scripts, config) |
| `testing-helpers/*.js` | Test framework upgrades |
| `core/test/*.test.js` | Test API changes |
| `ui/test/*.test.js` | Test API changes |
| `dataviz/test/*.test.js` | Test API changes |

## Files You Must NOT Modify

- `ui/viewers/pdfjs/**` — Vendored PDF.js fork
- `ui/js-interpreter/**` — Vendored JS interpreter
- `ui/i18n/messages-*.json` — Crowdin-managed translations (only edit `messages.json`)

## When to Escalate

If the upgrade requires changes that go beyond fixing breaking API calls:

1. **Major version bumps with extensive breaking changes** — Comment on the PR suggesting
   a manual upgrade PR instead
2. **Incompatible peer dependencies** — May need coordinated upgrades across multiple packages
3. **Fundamental architecture changes** — e.g., a testing framework dropping support for
   the TDD interface this project uses

In these cases, comment on the PR with your analysis and recommend closing it in favor
of a planned manual upgrade.

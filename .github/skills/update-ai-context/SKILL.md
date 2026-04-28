---
name: update-ai-context
description: Update all AI context markdown files in the Nuxeo Elements project to keep
  them accurate and in sync with the codebase. Use this skill when the user wants to
  refresh, update, audit, or maintain AI-facing documentation like copilot-instructions.md,
  AGENTS.md, ARCHITECTURE.md, PRODUCT.md, CONTRIBUTING.md, instruction files, or SKILL.md
  files. Also use when the codebase has changed significantly (new elements, renamed
  files, new dependencies, structural changes) and the AI context files need to reflect
  those changes. Use after major refactors, dependency upgrades, or feature additions.
---

# Update AI Context Files

Systematically audit and update all AI-facing markdown files in the project to keep
them accurate and in sync with the actual codebase.

## Why This Matters

AI coding assistants (Copilot, Claude, etc.) rely on these files for context. Stale
or inaccurate instructions lead to wrong code generation, outdated patterns, and
wasted developer time. These files should be treated as living documentation that
evolves with the codebase.

## Inventory of AI Context Files

### Tier 1: Global Context (loaded for every interaction)

| File | Purpose | Audience |
|---|---|---|
| `.github/copilot-instructions.md` | Project overview, commands, coding conventions, testing, CI | GitHub Copilot (all interactions) |
| `AGENTS.md` | Build/validate sequence, project structure, coding patterns, pitfalls | Claude Code, Copilot agents |

### Tier 2: Scoped Instructions (loaded when editing matching files)

| File | `applyTo` Glob | Purpose |
|---|---|---|
| `.github/instructions/core.instructions.md` | `core/**/*.js` | Core element patterns, class-based pattern |
| `.github/instructions/ui.instructions.md` | `ui/**/*.js,ui/**/*.html` | UI component patterns, behaviors, i18n |
| `.github/instructions/dataviz.instructions.md` | `dataviz/**/*.js` | Dataviz element patterns |
| `.github/instructions/unit-tests.instructions.md` | `**/test/**/*.test.js,**/test/**/*.js,test/**` | Unit test framework, structure, rules |

### Tier 3: Skills (invoked on demand for specific tasks)

| File | Trigger |
|---|---|
| `.github/skills/add-i18n-keys/SKILL.md` | Add/update i18n message keys |
| `.github/skills/write-unit-test/SKILL.md` | Generate unit tests |
| `.github/skills/update-ai-context/SKILL.md` | Audit and update all AI context files |

### Tier 4: Human-Facing Docs (also read by AI for context)

| File | Purpose |
|---|---|
| `README.md` | Project overview, prerequisites, quick start, links |
| `ARCHITECTURE.md` | System architecture, component hierarchy, data flow |
| `PRODUCT.md` | Product capabilities, component descriptions |
| `CONTRIBUTING.md` | Setup, development workflow, coding standards |

## Update Workflow

### Step 1: Detect What Changed

Scan the codebase to identify what has changed since the context files were last updated:

```
- Check git log for recent changes: structural moves, new elements, deleted files
- Compare directory listings against what's documented
- Check package.json for dependency changes (versions, new deps, removed deps)
- Check eslint.config.mjs, karma.conf.js for config changes
- Check for new elements, test files
- Check for renamed or moved files/directories
```

Key things to verify against reality:
- **Node version** in `package.json` engines field
- **Directory structure** — new or removed folders
- **Commands** — `npm` scripts in `package.json`
- **Dependencies** — `@nuxeo/*` package versions, Polymer version
- **Element list** — new elements added, old ones removed
- **Test patterns** — any framework changes (Karma config)
- **CI workflows** in `.github/workflows/`

### Step 2: Update Each File

For each file, follow the specific guidelines below.

#### `.github/copilot-instructions.md`

This is the most important file — it's the first thing Copilot reads.

Sections to audit:
- **Project Overview** — runtime, Node version, package manager
- **Repository Layout** — directory tree accuracy
- **Commands** table — verify every `npm` script still exists and works
- **Coding Conventions** — Polymer patterns, style rules, naming
- **Testing** — frameworks, helper packages, run commands
- **CI / GitHub Actions** — workflow names and sequence

Rules:
- Keep under 200 lines (Copilot context window limit)
- Focus on what AI needs to generate correct code, not human onboarding
- Commands must be copy-pasteable and correct
- Don't duplicate what's in scoped instructions — reference them instead

#### `AGENTS.md`

Similar to copilot-instructions but for Claude Code and autonomous agents.

Sections to audit:
- **Build & Validate** sequence
- **Project Structure** tree
- **Coding Patterns** with examples
- **Common Pitfalls** — are these still valid?

Rules:
- Can be more concise than copilot-instructions (agents read both)
- Emphasize the build/validate loop — agents must know how to check their work
- Include exact commands, not descriptions of commands

#### `.github/instructions/*.instructions.md`

Each file is scoped to specific file patterns via `applyTo` frontmatter.

Audit:
- Verify the `applyTo` glob still matches the right files
- Check that patterns and examples reflect current code
- Check that referenced imports, behaviors, APIs still exist

Rules:
- Keep each file focused and short (under 50 lines)
- Only include information relevant to the scoped file pattern
- Don't repeat global context — that's in copilot-instructions.md

#### `.github/skills/*/SKILL.md`

Each skill teaches AI how to perform a specific task.

Audit:
- **Templates** — do the code templates match current codebase patterns?
- **License header** — is the year and company name current?
- **Imports** — do import paths still resolve?
- **File paths** — are the conventional paths still correct?
- **API patterns** — do behaviors, widgets, methods still exist?
- **Name/description frontmatter** — still accurate trigger descriptions?

Rules:
- Templates must produce code that passes `npm run lint`
- Import paths must resolve against current `node_modules`
- License header must match what's in current source files

### Step 3: Cross-Reference Consistency

After updating individual files, verify consistency across all of them:

- **Node version** — same in copilot-instructions, AGENTS, CONTRIBUTING
- **Commands** — same `npm` scripts referenced everywhere
- **Directory structure** — same paths in all files
- **Coding conventions** — same Prettier/ESLint config described
- **Test commands** — same framework and run commands
- **License header** — same year and company across all templates

### Step 4: Validate

After making changes:

```bash
# Verify the documented commands actually work
npm install
npm run bootstrap
npm run lint
npm test
```

## When to Run This Skill

- After a **major refactor** (file moves, renames, new directory structure)
- After a **dependency upgrade** (Polymer, Node version bump)
- After adding **new elements or features**
- After changing **build configuration** (eslint, CI workflows)
- **Quarterly** as a maintenance task to catch drift
- When an AI assistant generates **incorrect code** that suggests stale context

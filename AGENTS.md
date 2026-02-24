# Repository Guidelines

## Project Structure & Module Organization
- `index.html` is the app shell and navigation entry point.
- `styles.css` holds shared design tokens and responsive layout rules.
- `app.js` bootstraps the app and mounts routes.
- `src/router.js` maps route names to tool views.
- `src/tools/` contains individual tools. Timer logic lives in `src/tools/timer/` (`templates.js`, `state.js`, `view.js`). Placeholder UI lives in `src/tools/placeholders/`.
- `tests/` contains Node test files (currently `tests/timer-state.test.mjs`).
- `QA_CHECKLIST.md` is the manual QA guide.

## Build, Test, and Development Commands
- Open `index.html` in a modern browser to run locally (static site, no build step).
- Run automated state tests:
  ```bash
  node --test tests/timer-state.test.mjs
  ```
- Before release, run the manual checklist in `QA_CHECKLIST.md` on desktop and mobile.

## Coding Style & Naming Conventions
- JavaScript uses ES modules and semicolons.
- Indentation is 2 spaces; use single quotes for strings.
- Prefer `camelCase` for variables/functions and `kebab-case` for file names.
- Keep DOM selectors and data attributes consistent with `index.html`.
- No formatter or linter is configured; keep changes small and consistent with existing style.

## Testing Guidelines
- Framework: Node’s built-in test runner (`node:test`) with `assert/strict`.
- Test naming: descriptive phrases matching behavior (see `tests/timer-state.test.mjs`).
- Add tests for state mutations in `src/tools/timer/state.js` or new tool logic.

## Commit & Pull Request Guidelines
- Commit history is minimal (single initial commit), so no strict convention is established.
- Use concise, imperative commit summaries (e.g., “Add timer checkpoint validation”).
- PRs should include:
  - A short description of behavior changes.
  - Linked issues (if applicable).
  - Screenshots or screen recordings for UI changes.
  - Test evidence: command output or note that `QA_CHECKLIST.md` was completed.

## Configuration & Release Notes
- This is a static site; ensure browser notifications/sound alerts are tested when touching timer view logic.
- Document any new browser permissions or user-facing alerts in the README and QA checklist.

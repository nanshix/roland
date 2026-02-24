# Roland Helper

Lightweight scaffold for a multi-helper website.

## Run locally

Open `index.html` in a modern browser.

## QA

Run through `QA_CHECKLIST.md` on desktop and mobile before release.

## Automated Check

Run timer state tests:

```bash
node --test tests/timer-state.test.mjs
```

## Current structure

- `index.html`: app shell and navigation
- `styles.css`: shared design tokens and responsive layout
- `QA_CHECKLIST.md`: manual desktop/mobile QA steps
- `tests/timer-state.test.mjs`: automated state logic checks
- `app.js`: app bootstrap and route activation
- `src/router.js`: route registry
- `src/helpers/timer/templates.js`: timer presets (includes Footy template)
- `src/helpers/timer/state.js`: timer state model and checkpoint operations
- `src/helpers/timer/view.js`: timer UI + runtime engine + in-app reminders + browser notifications + sound alerts
- `src/helpers/placeholders/view.js`: placeholder helper grid

## Next step

Execute the manual checklist on real browsers/devices, then prepare release artifacts and push.

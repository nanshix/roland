# Manual QA Checklist

## Desktop (Chrome/Edge/Firefox/Safari)

1. Open `index.html` and confirm the Timer view renders without console errors.
2. Verify nav switching: `Timer` <-> `More Helpers` works and returns correctly.
3. Click `Start` and confirm elapsed clock and progress bar update continuously.
4. Click `Pause`, wait 3 seconds, then `Resume`; confirm elapsed time does not jump backward.
5. Click `Reset`; confirm elapsed returns to `00:00`, progress resets, and checkpoints become pending.
6. Edit checkpoint label/minutes while timer is idle; confirm values persist and list stays sorted by time.
7. Start timer and confirm checkpoint inputs/buttons are disabled while running.
8. Set one checkpoint to `0` minutes, click `Start`; confirm reminder is triggered immediately.
9. Click `Enable Notifications`, grant permission, trigger checkpoint, and confirm browser notification appears.
10. Confirm sound is enabled by default, then click `Test Sound`; confirm audible tone. Trigger a checkpoint and confirm tone plays.
11. Switch to `More Helpers` while timer is running; return to `Timer` and confirm no runaway clock/duplicate intervals.

## Mobile (iOS Safari + Android Chrome)

1. Confirm layout fits viewport at 360px width with no horizontal scrolling.
2. Confirm control buttons are full-width and easy to tap.
3. Confirm checkpoint cards stack vertically and remain readable.
4. Confirm template dropdown and minute input are usable with touch keyboard.
5. Enable notifications/sound where supported and trigger a short checkpoint.
6. Lock/unlock device during run, then verify elapsed/progress remain sensible.

## Regression Guardrails

1. No uncaught errors in browser console during start/pause/resume/reset cycles.
2. No uncaught errors when notification permission is denied.
3. No uncaught errors when sound is not supported.

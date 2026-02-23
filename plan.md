## Tools Website Plan

1. Build a tools website, starting with a football-themed timer tool.
2. Keep architecture extensible so more tools can be added later.

## MVP Scope (Timer Tool)

1. Provide timer templates, starting with a "Footy" template.
2. Allow users to create/edit multiple reminder time points.
3. Support start, pause, resume, and reset.
4. Trigger reminder when each time point is reached:
   - in-app visual alert
   - sound alert
   - browser notification (if user grants permission)
5. After one time point is reached, automatically move to the next reminder.
6. Works well on desktop and mobile (responsive layout).

## Technical Constraints

1. A web app cannot directly create or update entries in the phone's native Alarm app.
2. On mobile, request browser notification permission and use web notifications instead.

## Delivery Plan

1. Build MVP timer tool.
2. Test on desktop and mobile browsers.
3. Prepare repository and push to:
   - `git@github.sc156:nanshix/rolandhou.git`

## Execution Checklist (Order + Estimates)

1. Project setup and structure (0.5 day)
   - Initialize app scaffold and folder conventions for future tools.
   - Add base routing/nav with a placeholder section for upcoming tools.
2. Timer data model and template system (0.5 day)
   - Define timer state shape (duration, checkpoints, status).
   - Implement "Footy" template as default preset.
3. Core timer engine (0.5 day)
   - Implement start, pause, resume, reset.
   - Ensure accurate elapsed-time tracking when tab/app visibility changes.
4. Reminder orchestration (0.5 day)
   - Trigger reminders at configured time points.
   - Auto-advance to next reminder after each trigger.
5. Notification + sound layer (0.5 day)
   - In-app visual reminder.
   - Browser Notification API integration with permission flow.
   - Sound alert with graceful fallback when autoplay is blocked.
6. Responsive UI pass (0.5 day)
   - Mobile-first layout adjustments.
   - Desktop polish and spacing/typography consistency.
7. QA and stabilization (0.5 day)
   - Test cases for timer transitions and edge cases.
   - Cross-browser checks on modern mobile/desktop browsers.
8. Release and push (0.25 day)
   - Final cleanup and README usage notes.
   - Commit and push to `git@github.sc156:nanshix/rolandhou.git`.

## Acceptance Criteria

1. User can select "Footy" template and start timer in under 3 clicks.
2. Every configured time point triggers visual + sound reminder.
3. Browser notifications work when permission is granted.
4. Timer behavior remains correct after pause/resume and tab backgrounding.
5. UI is usable on phone-width screens and desktop screens.

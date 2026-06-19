# Mobile QA Checklist

Before sharing a release publicly:

- iPhone PWA: open from Home Screen, confirm app loads without hard refresh.
- iPhone Safari/Gmail: request a password reset and open the email link directly.
- iPhone PWA: confirm update banner appears after a new upload and only refreshes after tapping Refresh.
- iPhone small viewport: welcome, create account, login, reset password, and change password screens fit.
- Android Chrome: check Today, Goal, Progress, Account, and Workout history layouts.
- Desktop: check auth screens and account modal width.
- Safe areas: confirm top content and bottom CTA/nav do not collide with the status bar or home indicator.
- Workout flow: Energy Check → Generate → Start → Complete → Progress count/history update.
- Accessibility quick check: tab through auth, account modal, confirmation panel, and bottom nav.

Automated visual tests live in `tests/visual/app.visual.spec.js`, but real iPhone PWA/update behavior still needs this short manual check.

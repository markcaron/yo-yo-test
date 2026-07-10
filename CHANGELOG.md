# Changelog

## 1.1.0 — 2026-07-10

### Added

- Splash intro animation — yo-yo throw/spin/snap with brand reveal (once per session)
- Brand color token (`--yy-brand: #FF2346`)
- Logo SVG used as brand icon in header lockup with rounded corners

### Changed

- PWA icons updated to red (#FF2346) background with white yo-yo
- Manifest and meta theme-color updated to brand red
- Header lockup optically centered

---

## 1.0.2 — 2026-07-09

### Fixed

- Dial jitter on iOS eliminated — SVG progress rings now update via direct DOM manipulation instead of Lit template re-renders
- Bottom nav bar is now position-fixed, content scrolls underneath it
- Dashboard icon updated to stopwatch
- Removed redundant "About" heading in Help view

---

## 1.0.1 — 2026-07-09

### Fixed

- Countdown ticks now sound like clock clicks (1800Hz, 20ms) instead of beeps — more distinct from test audio
- Stop dialog no longer touches screen edges on narrow devices (16px padding each side)

---

## 1.0.0 — 2026-07-09

Initial public release.

### Features

- **YYIR1 timer** — precision-timed 15-stage test with audio beeps synced to AudioContext clock
- **Audio cues** — single beep (20m turn), double beep (shuttle complete), triple beep (stage change)
- **10-second countdown** — optional pre-test countdown with soft ticks (configurable in Settings)
- **Concentric progress dials** — outer ring (40m shuttle), inner ring (20m segment), blue during recovery
- **Miss tracking** — tap Miss button for failed lines; 2 consecutive misses auto-stops per protocol
- **Stop confirmation** — dialog prevents accidental test termination
- **Results display** — score (stage:shuttle), total distance, VO₂max estimate, elapsed time
- **iOS silent switch bypass** — uses `navigator.audioSession.type = 'playback'`
- **View-based navigation** — Dashboard, Help, Stage Table, Settings via bottom bar
- **Help view** — combined instructions and about information
- **Fitness norms table** — YYIR1 ratings for men and women (Bangsbo et al. 2008)
- **Settings** — starting countdown toggle, dark mode toggle (persists in localStorage)
- **PWA** — installable, offline-capable via Workbox, home screen icons (192/512 PNG + SVG)
- **Accessibility** — WCAG 2.2 AA, 48px touch targets, aria-live announcements, focus management
- **Light/dark mode** — follows system preference or manual override via Settings

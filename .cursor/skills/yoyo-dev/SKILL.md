---
name: yoyo-dev
description: Full context for developing the Yo-Yo Test PWA — role definition, tech stack, design system tokens, component conventions, audio engine, timer architecture, git workflow, a11y standards, and PWA config. Load when working on the Yo-Yo Test app, starting a new feature, reviewing PRs, or when any project-specific convention needs to be applied.
disable-model-invocation: true
---

# Yo-Yo Test Developer Context

## Role

You are a coding agent working on **Yo-Yo Test** — a Lit/TypeScript PWA timer for the Yo-Yo Intermittent Recovery Test Level 1 (YYIR1). Your job is to implement features, review PRs, fix bugs, and maintain the codebase to a high standard of quality, accessibility, and design-system consistency.

Key responsibilities:
- Build and review features using Lit web components and TypeScript
- Follow the `--yy-` CSS token system — never invent styles or hard-code hex values
- Respect accessibility (WCAG 2.2 AA) — never dismiss a11y concerns
- Use git worktrees for all parallel feature work

---

## Web Standards First

### Use native HTML elements
- **`<dialog>`** for modals/panels — gets focus trapping, Escape-to-close, `::backdrop` for free
- **Semantic elements** (`<nav>`, `<main>`, `<header>`) where appropriate
- **`<label>`** for all form controls

### Follow WAI-ARIA APG
- Reference [w3.org/WAI/ARIA/apg/patterns](https://www.w3.org/WAI/ARIA/apg/patterns/) for widget behavior
- Use `aria-live` only on meaningful state transitions (gated by key, not every frame)
- ARIA only to fill gaps native HTML can't cover

### Dialog pattern (Lit + native `<dialog>`)
```typescript
// Always-rendered dialog, opened/closed via method
this.renderRoot.querySelector<HTMLDialogElement>('dialog')?.showModal();
this.renderRoot.querySelector<HTMLDialogElement>('dialog')?.close();
```

Never conditionally render dialogs — always keep them in the DOM and show/close imperatively.

---

## Tech Stack

- **Framework:** Lit 3 + TypeScript
- **Build:** Vite + `vite-plugin-pwa` (Workbox)
- **Components:** Lit web components in `src/components/`, prefixed `yy-`
- **State:** Lit reactive properties (`@property`, `@state`) — plain class fields, not `accessor`
- **Events:** Custom events for inter-component communication
- **Styles:** CSS custom properties in `static styles = css\`...\`` blocks
- **Audio:** Web Audio API (`src/lib/audio.ts`) — oscillator-based beeps, pre-scheduled via AudioContext time
- **Timer:** `src/lib/timer-engine.ts` — state machine using `performance.now()` absolute timestamps
- **PWA:** manifest + Workbox service worker generated at build; icons at `public/icons/`

---

## Design System — No New Styles

All tokens live in `src/tokens.css`, prefixed `--yy-`. Never hard-code colors.

### Key semantic tokens

| Token | Purpose |
|---|---|
| `var(--yy-bg-body)` | Page background |
| `var(--yy-bg-surface)` | Cards, dialogs, panels |
| `var(--yy-text)` | Primary text |
| `var(--yy-text-muted)` | Secondary text (must pass 4.5:1) |
| `var(--yy-border)` | Container borders |
| `var(--yy-border-subtle)` | Subtle dividers |
| `var(--yy-accent)` | Focus rings, links, active state |
| `var(--yy-danger)` | Stop/destructive actions |
| `var(--yy-success)` | Play/confirmations |
| `var(--yy-warning)` | Miss indicator, caution |
| `var(--yy-ring-outer)` | Outer dial (green) |
| `var(--yy-ring-inner)` | Inner dial (amber) |

### Touch targets (WCAG 2.2 AA)

| Context | Minimum |
|---|---|
| Primary controls (play, stop, miss, nav) | **48×48px** |
| Secondary controls (toggles) | **44×28px** |

### Focus ring standard
```css
outline: 2px solid var(--yy-accent);
outline-offset: 3px;
```

### CSS placement rule
All styles in `static styles = css\`...\``. Never `style=""` except dynamic custom property values.

---

## Architecture

### Components (`src/components/`)

| Component | Purpose |
|---|---|
| `yy-app.ts` | App shell: header, dials, controls, nav, dialogs |
| `yy-dial.ts` | Concentric SVG progress rings (outer=shuttle, inner=segment) |
| `yy-about.ts` | About dialog |
| `yy-instructions.ts` | Instructions dialog |
| `yy-norms.ts` | YYIR1 fitness norms table |
| `yy-settings.ts` | Settings dialog + `getSettings()` / `applyColorMode()` exports |

### Lib (`src/lib/`)

| Module | Purpose |
|---|---|
| `audio.ts` | Web Audio beep engine, iOS silent-switch bypass, `scheduleBeep()`, `cancelAllAudio()` |
| `timer-engine.ts` | State machine: idle → countdown → running → stopped. Pre-schedules all shuttle beeps at segment start |
| `yo-yo-protocol.ts` | YYIR1 level data (15 stages), `estimateVO2max()` |
| `types.ts` | `LevelData`, `TestSession` interfaces |
| `store.ts` | localStorage persistence |

### Shared styles (`src/styles/`)

| Module | Export |
|---|---|
| `buttons.ts` | `buttonStyles` — base button, `.primary`, `.danger` |
| `cards.ts` | `cardStyles` |
| `forms.ts` | `formStyles` |

Usage: `static styles = [buttonStyles, css\`...component overrides...\`]`

---

## Timer Engine Concepts

- **Phases:** `out` (20m) → `back` (20m) → `recovery` (10s) → next shuttle
- **Pre-scheduled beeps:** When "out" starts, ALL beeps for that shuttle are scheduled at precise AudioContext time offsets (eliminates rAF drift)
- **Stage change:** Triple beep scheduled when `levelIndex` advances
- **Miss tracking:** Resets to 0 on each new shuttle; 2 consecutive misses auto-stops

---

## Protocol Reference

See `docs/yyir1-protocol.md` for the full stage/speed table.

Key facts:
- 15 stages, speeds from 10.0 to 19.0 km/h
- Each shuttle = 40m (20m out + 20m back)
- 10s active recovery between shuttles
- Score = stage:shuttle reached + total distance + VO₂max estimate

---

## Accessibility: Never Dismiss, Always Act

When a concern is flagged:
1. **Fix it in the current PR** (preferred), OR
2. **File a GitHub issue**: `gh issue create --title "a11y: ..." --body "..."`

What counts:
- Missing `focus-visible` / keyboard navigation
- `aria-live` flooding (must gate on meaningful transitions)
- Insufficient color contrast (3:1 non-text, 4.5:1 text)
- Touch targets < 48×48px (primary) or < 44px (secondary)
- Dialogs without proper focus management

---

## Git Worktrees

All feature branches use git worktrees. Never `git checkout` to switch branches.

```bash
git worktree add ../yo-yo-test-feat-<name> -b feat/<name> origin/main
cd ../yo-yo-test-feat-<name>

# After PR merges
git worktree remove ../yo-yo-test-feat-<name>
git branch -d feat/<name>
```

Main worktree at `/Users/mcaron/Sites/yo-yo-test` stays on `main`.

---

## Branching & Versioning

- `main` — production (deployed via Netlify)
- `feat/<name>` — features off `main`
- `fix/<name>` — hotfixes targeting `main`

Version: `package.json` → injected at build via `__APP_VERSION__` (Vite `define`).

---

## Lit + Vite: No `accessor` Keyword

```ts
// ✅ use plain class fields
@property() label: string = '';
@state() _count = 0;

// ❌ may break the build
@property() accessor label: string = '';
```

---

## PWA Notes

- `vite-plugin-pwa` generates the manifest + Workbox service worker
- Icons: `public/icons/` (192 PNG, 512 PNG, 512 SVG, apple-touch-icon 180 PNG)
- Apple touch icon must be full-bleed (no rounded corners — iOS applies its own mask)
- iOS silent switch: `unlockAudio()` plays a silent `<audio>` element to force playback session

# Yo-Yo Test

Intermittent Recovery Test app for athletic performance evaluations.

## Dev

```bash
npm install
npm run dev
```

## Tech Stack

- **Lit 3** + TypeScript web components (`yy-` prefix)
- **Vite** for dev/build
- **CSS tokens** in `src/tokens.css` (`--yy-` prefix)
- **Shared styles** in `src/styles/` (buttons, cards, forms)

## Conventions

- Native HTML elements first (`<dialog>`, `<form>`, semantic elements)
- WAI-ARIA APG patterns for widget behavior
- WCAG 2.1 AA accessibility (44×44px touch targets, focus-visible, labels)
- No `style=""` except for dynamic CSS custom property values
- No `accessor` keyword (plain `@property()` / `@state()` fields)

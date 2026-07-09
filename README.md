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
- WCAG 2.2 AA accessibility (48px touch targets, focus-visible, labels)
- No `style=""` except for dynamic CSS custom property values
- No `accessor` keyword (plain `@property()` / `@state()` fields)

## License

This work is licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-nc-sa/4.0/).

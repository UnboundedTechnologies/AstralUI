# AstralUI

[![npm version](https://img.shields.io/npm/v/@astralui/core.svg)](https://www.npmjs.com/package/@astralui/core)
[![CI](https://github.com/UnboundedTechnologies/AstralUI/actions/workflows/ci.yml/badge.svg)](https://github.com/UnboundedTechnologies/AstralUI/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/@astralui/core.svg)](./LICENSE)
[![types](https://img.shields.io/npm/types/@astralui/core.svg)](https://www.npmjs.com/package/@astralui/core)

A self-contained React design system - theme engine, design tokens, and a set of
dependency-free UI components. No CSS-in-JS runtime: just CSS variables +
`light-dark()` and small, focused components.

- 🎨 **Theme tokens** - a full color palette + semantic tokens as `--astral-*` CSS variables, light & dark.
- 🌗 **Color scheme** - `ColorSchemeProvider` / `useColorScheme` (persisted, `data-astral-scheme` on `<html>`).
- 🖌️ **Per-brand theming** - `AstralThemeProvider` generates a brand palette from a single hex and injects per-scheme overrides at runtime (with live preview).
- 🧩 **Components** - `AstralModal`, `AstralDrawer`, `AstralSelect`, `AstralMenu`, `AstralPinInput`, `AstralToaster` + `notifications`, `DateInput`, `Spinner`.

## Install

```bash
pnpm add @astralui/core
# peer deps (you almost certainly already have these):
pnpm add react react-dom @tabler/icons-react
```

## Setup

Import the stylesheet once (e.g. in your entry file), then wrap your app:

```tsx
import '@astralui/core/styles.css';
import { ColorSchemeProvider, AstralThemeProvider, AstralToaster } from '@astralui/core';

function Root() {
  return (
    <ColorSchemeProvider defaultScheme="dark">
      <AstralThemeProvider colors={orgBrandColors /* optional */}>
        <AstralToaster />
        <App />
      </AstralThemeProvider>
    </ColorSchemeProvider>
  );
}
```

## Color scheme

```tsx
import { useColorScheme } from '@astralui/core';

function ThemeToggle() {
  const { colorScheme, toggle } = useColorScheme();
  return <button onClick={toggle}>{colorScheme === 'dark' ? '🌙' : '☀️'}</button>;
}
```

## Per-brand theming

Pass any subset of brand colors; AstralUI builds a 10-shade palette (via `generateColors`)
and overrides the tokens per scheme. Omit `colors` for the default look.

```tsx
<AstralThemeProvider colors={{
  primary_color: '#7950f2',
  background_color: '#141417', card_color: '#1c1c20', navbar_color: '#0e0e11', font_color: '#f4f4f5',
  light_primary_color: '#0f766e', light_background_color: '#f5f7fa', /* ...light_* */
}}>
```

For a live editor, `useThemePreview().setPreview(partialColors)` applies instantly without persisting.

## Notifications

```tsx
import { notifications } from '@astralui/core';

const id = notifications.show({ message: 'Saved', color: 'green' });
notifications.show({ id: 'x', message: 'Working…', loading: true, autoClose: false });
notifications.update({ id: 'x', message: 'Done', color: 'green', loading: false, autoClose: 2000 });
```

## Components (quick reference)

| Export | What |
|---|---|
| `AstralModal` / `AstralDrawer` | Portalled, centered modal / right drawer (escape + click-outside). |
| `AstralSelect` | Single-select combobox (searchable / clearable / creatable). |
| `AstralMenu` | Anchored dropdown menu (items array). |
| `AstralPinInput` | Code/OTP input. |
| `DateInput` | Freeze-proof native date / datetime-local input. |
| `Spinner` | Theme-aware loading spinner. |
| `notifications` + `AstralToaster` | Toast system. |
| `generateColors(hex)` | 10-shade palette from one color. |

## Token reference

All colors resolve through `--astral-color-*`, `--astral-primary-color-*`, `--astral-font-family`,
and the app surface vars `--astral-app-bg/-nav/-card`. Use them directly in your own CSS, e.g.:

```css
.thing { background: var(--astral-color-body); color: var(--astral-color-text);
         border: 1px solid var(--astral-color-default-border); }
```

## Local development

```bash
pnpm install
pnpm build       # → dist/ (ESM + CJS + types + styles.css)
pnpm typecheck
```

To use a local build in another project without publishing: `pnpm link --global` here, then
`pnpm link --global @astralui/core` in the consumer (or a `file:` dependency).

## Releasing

Versioned on npm as `@astralui/core`. CI builds + type-checks every push; publishing a
GitHub Release (`v*`) publishes to npm via the `publish` workflow using **npm Trusted
Publishing (OIDC)** - no token or secret. One-time setup on npmjs.com: the package's
Settings -> Trusted Publisher -> GitHub Actions, repo `UnboundedTechnologies/AstralUI`,
workflow `publish.yml`. The very first publish is done manually (`npm publish --access public`)
since the trusted publisher is configured on an existing package.

## License

MIT © Unbounded Technologies

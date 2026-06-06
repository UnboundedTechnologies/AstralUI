import { useMemo, useState, useCallback, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { generateColors } from './generateColors';

/* Per-org / per-brand theming. Computes the brand palette + surface overrides and
   injects them as a runtime <style> that overrides the base --astral-* tokens
   (from tokens.css) per scheme. Selectors use html:root[data-astral-scheme="..."]
   (specificity 0,2,1, so they win over the :root base tokens). No colors -> empty
   style -> base tokens. Prop-driven (no app coupling): pass the brand colors in. */

/* ── Color preview context (live editing) ── */

export interface AstralThemeColors {
  primary_color?: string | null;
  background_color?: string | null;
  card_color?: string | null;
  navbar_color?: string | null;
  font_color?: string | null;
  light_primary_color?: string | null;
  light_background_color?: string | null;
  light_card_color?: string | null;
  light_navbar_color?: string | null;
  light_font_color?: string | null;
}

interface ThemePreviewContextType {
  preview: AstralThemeColors | null;
  setPreview: (colors: AstralThemeColors | null) => void;
}

const ThemePreviewContext = createContext<ThemePreviewContextType>({
  preview: null,
  setPreview: () => {},
});

export function useThemePreview() {
  return useContext(ThemePreviewContext);
}

/* ── Helpers ── */

const HEX_RE = /^#[0-9a-f]{6}$/i;
const isValidHex = (v: string | null | undefined): v is string => !!v && HEX_RE.test(v);

function adjustHex(hex: string, amount: number): string {
  const c = hex.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(c.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(c.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(c.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hexToRgba(hex: string, alpha: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* primaryShade is { light: 6, dark: 8 }; -light is the shade-6 color at .1/.15 alpha
   (.12/.2 hovered); -light-color is shade 6 (light) / 3 (dark). Theme-level constants,
   identical for any palette. */
function primaryVars(palette: string[], scheme: 'light' | 'dark'): string[] {
  if (scheme === 'light') {
    return [
      `--astral-primary-color-filled:${palette[6]}`,
      `--astral-primary-color-filled-hover:${palette[7]}`,
      `--astral-primary-color-light:${hexToRgba(palette[6], 0.1)}`,
      `--astral-primary-color-light-hover:${hexToRgba(palette[6], 0.12)}`,
      `--astral-primary-color-light-color:${palette[6]}`,
    ];
  }
  return [
    `--astral-primary-color-filled:${palette[8]}`,
    `--astral-primary-color-filled-hover:${palette[9]}`,
    `--astral-primary-color-light:${hexToRgba(palette[6], 0.15)}`,
    `--astral-primary-color-light-hover:${hexToRgba(palette[6], 0.2)}`,
    `--astral-primary-color-light-color:${palette[3]}`,
  ];
}

function safeGenerate(hex: string): string[] | null {
  try { return generateColors(hex) as unknown as string[]; } catch { return null; }
}

export function buildOrgCss(src: AstralThemeColors): string {
  const brand = isValidHex(src.primary_color) ? safeGenerate(src.primary_color!) : null;
  const lightBrand = isValidHex(src.light_primary_color) ? safeGenerate(src.light_primary_color!) : null;
  const lightPalette = lightBrand ?? brand; // light mode uses lightBrand, else falls back to brand
  const noDarkBrand = !brand; // the base accent palette is only overridden in light when no dark brand

  const vBg = isValidHex(src.background_color) ? src.background_color! : '';
  const vCard = isValidHex(src.card_color) ? src.card_color! : '';
  const vNav = isValidHex(src.navbar_color) ? src.navbar_color! : '';
  const vFont = isValidHex(src.font_color) ? src.font_color! : '';
  const vLBg = isValidHex(src.light_background_color) ? src.light_background_color! : '';
  const vLCard = isValidHex(src.light_card_color) ? src.light_card_color! : '';
  const vLNav = isValidHex(src.light_navbar_color) ? src.light_navbar_color! : '';
  const vLFont = isValidHex(src.light_font_color) ? src.light_font_color! : '';

  const dark: string[] = [];
  const light: string[] = [];

  /* ── dark scheme ── */
  if (brand) dark.push(...primaryVars(brand, 'dark'));
  if (vFont) {
    // dark palette: dark-0 = primary text; the dark text token mirrors dark-0.
    dark.push(`--astral-color-dark-0:${vFont}`, `--astral-color-dark-1:${adjustHex(vFont, -30)}`, `--astral-color-dark-2:${adjustHex(vFont, -60)}`, `--astral-color-text:${vFont}`);
  }
  if (vCard) dark.push(`--astral-color-dark-6:${vCard}`);
  if (vBg) dark.push(`--astral-color-dark-7:${vBg}`, `--astral-color-dark-9:${adjustHex(vBg, -10)}`, `--astral-color-body:${vBg}`, `--astral-app-bg:${vBg}`);
  if (vNav) dark.push(`--astral-color-dark-8:${vNav}`, `--astral-app-nav:${vNav}`);
  if (vCard) dark.push(`--astral-app-card:${vCard}`);

  /* ── light scheme ── */
  if (lightBrand && noDarkBrand) {
    // only-light-primary: override the base accent (violet) palette so accent-derived
    // tokens (e.g. brand-text) follow the light primary in light mode.
    for (let i = 0; i < 10; i++) light.push(`--astral-color-violet-${i}:${lightBrand[i]}`);
  }
  if (lightPalette) light.push(...primaryVars(lightPalette, 'light'));
  if (vLFont) light.push(`--astral-color-text:${vLFont}`);
  if (vLBg) light.push(`--astral-app-bg:${vLBg}`);
  if (vLNav) light.push(`--astral-app-nav:${vLNav}`);
  if (vLCard) light.push(`--astral-app-card:${vLCard}`);

  let css = '';
  if (dark.length) css += `html:root[data-astral-scheme="dark"]{${dark.join(';')}}`;
  if (light.length) css += `html:root[data-astral-scheme="light"]{${light.join(';')}}`;
  return css;
}

/* ── Provider ──
   Pass the brand colors via `colors`. While editing, call setPreview() (from
   useThemePreview) with partial colors for an instant live preview. */

export function AstralThemeProvider({ colors, children }: { colors?: AstralThemeColors | null; children: ReactNode }) {
  const [preview, setPreview] = useState<AstralThemeColors | null>(null);

  const stableSetPreview = useCallback((c: AstralThemeColors | null) => {
    setPreview(c);
  }, []);

  const effective: AstralThemeColors | null = preview
    ? { ...(colors ?? {}), ...preview }
    : (colors ?? null);

  const orgCss = useMemo(
    () => (effective ? buildOrgCss(effective) : ''),
    [effective ? JSON.stringify(effective) : ''],
  );

  return (
    <ThemePreviewContext.Provider value={{ preview, setPreview: stableSetPreview }}>
      <style data-astral-theme>{orgCss}</style>
      {children}
    </ThemePreviewContext.Provider>
  );
}

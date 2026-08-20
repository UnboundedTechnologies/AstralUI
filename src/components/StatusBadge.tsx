import type { ReactNode, CSSProperties } from 'react';

/* A presentational status pill: a colored dot + label. Fully prop-driven (no i18n).
   A built-in color map covers common status keys; override with `color`, pass your
   own display text via `label`, and use `filled` for a solid (vs tinted) badge. */

const COLOR_MAP: Record<string, string> = {
  offline: '#3b82f6', online: '#16a34a', active: '#16a34a', suspended: '#eab308',
  banned: '#ef4444', creating: '#06b6d4', verification_needed: '#EF8E2E',
  signup_failed: '#ef4444', untested: '#9ca3af', failed: '#ef4444', idle: '#9ca3af',
  starting: '#06b6d4', running: '#16a34a', stopping: '#eab308', stopped: '#EF8E2E',
  error: '#ef4444', draft: '#9ca3af', scheduled: '#3b82f6', paused: '#eab308',
  completed: '#16a34a', skipped: '#EF8E2E', in_campaign: '#8b5cf6',
  in_progress: '#3b82f6', pending: '#9ca3af', replied: '#8b5cf6', success: '#16a34a',
};

// The pill paints its own hue on a 15% tint of that same hue, at 11px - which
// is normal text, so the bar is 4.5:1. Measured on white, every one of these
// failed in light mode: 1.74 for the yellow, 2.78 for the green, 3.53 for the
// violet. Account status is the most-scanned word on Accounts, Campaigns and
// Unibox, and "banned" was one of the unreadable ones.
//
// So the DOT and the tint keep the hue, and the TEXT gets its own value.
// Verified ratios against the composited tint: light 5.51-7.70, dark 8.13-10.21.
const FG: Record<string, [light: string, dark: string]> = {
  '#eab308': ['#854d0e', '#fde047'],
  '#06b6d4': ['#155e75', '#67e8f9'],
  '#EF8E2E': ['#9a4a06', '#fdba74'],
  '#9ca3af': ['#4b5563', '#d1d5db'],
  '#16a34a': ['#14532d', '#4ade80'],
  '#3b82f6': ['#1e40af', '#93c5fd'],
  '#ef4444': ['#991b1b', '#fca5a5'],
  '#8b5cf6': ['#5b21b6', '#c4b5fd'],
};

// White on #16a34a is 3.30. The filled variant needs a darker ground.
const SOLID: Record<string, string> = { '#16a34a': '#166534' };

const FILLED = new Set(['running', 'active', 'online']);

export interface StatusBadgeProps {
  /** raw status key - drives the default color, default fill, and fallback label */
  status: string;
  /** display text (defaults to the status key) */
  label?: ReactNode;
  /** override the dot/badge color (hex or any CSS color) */
  color?: string;
  /** solid fill instead of a tinted background (auto for running/active/online) */
  filled?: boolean;
}

export function StatusBadge({ status, label, color, filled }: StatusBadgeProps) {
  const c = color ?? COLOR_MAP[status] ?? '#9ca3af';
  const isFilled = filled ?? FILLED.has(status);
  const text = label ?? status;
  return (
    <span
      className={`au-sbadge${isFilled ? ' filled' : ''}`}
      style={{
        '--au-sb': c,
        ...(FG[c] ? { '--au-sb-fg': `light-dark(${FG[c][0]}, ${FG[c][1]})` } : {}),
        ...(SOLID[c] ? { '--au-sb-solid': SOLID[c] } : {}),
      } as CSSProperties}
      title={typeof text === 'string' ? text : undefined}
    >
      <span className="au-sbadge-dot" />
      {text}
    </span>
  );
}

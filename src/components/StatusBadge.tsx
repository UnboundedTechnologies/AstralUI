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
      style={{ '--au-sb': c } as CSSProperties}
      title={typeof text === 'string' ? text : undefined}
    >
      <span className="au-sbadge-dot" />
      {text}
    </span>
  );
}

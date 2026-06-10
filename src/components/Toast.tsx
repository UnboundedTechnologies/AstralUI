import { useSyncExternalStore } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { IconX, IconCheck, IconAlertTriangle, IconInfoCircle, IconExclamationCircle } from '@tabler/icons-react';

/* AstralUI toast system. The `notifications` object (show/update/hide/clean, returns
   an id) is a small imperative store; <AstralToaster/> renders the live toasts and is
   mounted once at the app root. Theme-aware via the --astral-* tokens. */

export interface ToastOptions {
  id?: string;
  title?: ReactNode;
  message?: ReactNode;
  color?: string;
  icon?: ReactNode;
  loading?: boolean;
  autoClose?: number | false;
  withCloseButton?: boolean;
  onClose?: () => void;
  /** accepted for API compatibility; the toaster uses one global position */
  position?: string;
  /** tolerate any other notification prop a call site may pass (radius, withBorder, style, ...) */
  [key: string]: unknown;
}

interface Toast extends ToastOptions { id: string; exiting?: boolean; }

/* How many toasts are visible at once. Older ones beyond this stay queued in the
   store (and keep auto-closing) but aren't rendered, so the stack can't grow without
   bound. Overridable via <AstralToaster limit={n} />. */
const DEFAULT_LIMIT = 4;
/* Exit-animation duration; must match `au-toast-out` in toast.css. */
const EXIT_MS = 220;

let toasts: Toast[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let counter = 0;

const emit = () => listeners.forEach(l => l());

function clearTimer(id: string) {
  const x = timers.get(id);
  if (x) { clearTimeout(x); timers.delete(id); }
}

function scheduleAutoClose(t: Toast) {
  clearTimer(t.id);
  if (t.autoClose === false || t.loading) return; // loading toasts stay until updated
  const ms = typeof t.autoClose === 'number' ? t.autoClose : 4000;
  timers.set(t.id, setTimeout(() => hide(t.id), ms));
}

function show(opts: ToastOptions): string {
  const id = opts.id ?? `toast-${++counter}`;
  const existing = toasts.find(t => t.id === id);
  // exiting:false so re-showing an id that's mid-fade revives it cleanly.
  const toast: Toast = { withCloseButton: true, ...existing, ...opts, id, exiting: false };
  toasts = existing ? toasts.map(t => (t.id === id ? toast : t)) : [...toasts, toast];
  emit();
  scheduleAutoClose(toast);
  return id;
}

function update(opts: ToastOptions): string {
  if (!opts.id) return show(opts);
  const existing = toasts.find(t => t.id === opts.id);
  if (!existing) return show(opts);
  const toast: Toast = { ...existing, ...opts, id: opts.id, exiting: false };
  toasts = toasts.map(t => (t.id === opts.id ? toast : t));
  emit();
  scheduleAutoClose(toast);
  return opts.id;
}

/* Two-phase removal: mark the toast `exiting` so it plays the fade-out animation,
   then drop it from the store once the animation has finished. */
function hide(id: string) {
  const t = toasts.find(x => x.id === id);
  if (!t || t.exiting) return; // gone already, or already fading out
  clearTimer(id);              // cancel the pending auto-close
  toasts = toasts.map(x => (x.id === id ? { ...x, exiting: true } : x));
  emit();
  timers.set(id, setTimeout(() => {
    toasts = toasts.filter(x => x.id !== id);
    timers.delete(id);
    emit();
    t.onClose?.();
  }, EXIT_MS));
}

function clean() {
  toasts.forEach(t => clearTimer(t.id));
  toasts = [];
  emit();
}

export const notifications = { show, update, hide, clean };

/* ── Rendering ── */

const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const getSnapshot = () => toasts;

const DEFAULT_ICON: Record<string, ReactNode> = {
  green: <IconCheck size={16} />,
  teal: <IconCheck size={16} />,
  red: <IconExclamationCircle size={16} />,
  orange: <IconAlertTriangle size={16} />,
  yellow: <IconAlertTriangle size={16} />,
};

function Spinner() {
  return <span className="au-toast-spin" />;
}

function ToastCard({ t }: { t: Toast }) {
  const accent = t.color ? `var(--astral-color-${t.color}-6)` : 'var(--astral-color-default-border)';
  const lead = t.loading
    ? <Spinner />
    : t.icon
      ? t.icon
      : (t.color && DEFAULT_ICON[t.color]) || <IconInfoCircle size={16} />;
  return (
    <div
      className={t.exiting ? 'au-toast au-toast-out' : 'au-toast'}
      style={{ ['--au-toast-accent' as string]: accent } as CSSProperties}
      role="status"
    >
      <span className="au-toast-lead">{lead}</span>
      <div className="au-toast-body">
        {t.title && <div className="au-toast-title">{t.title}</div>}
        {t.message != null && <div className="au-toast-msg">{t.message}</div>}
      </div>
      {t.withCloseButton !== false && (
        <button type="button" className="au-toast-x" onClick={() => hide(t.id)} aria-label="Close"><IconX size={14} /></button>
      )}
    </div>
  );
}

export function AstralToaster({ limit = DEFAULT_LIMIT }: { limit?: number } = {}) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  if (typeof document === 'undefined') return null;
  // Render only the newest `limit` toasts so the stack can't grow without bound.
  // Toasts beyond the cap stay in the store (still auto-closing) and surface as the
  // visible ones clear. Anything mid-fade is kept on so its exit animation finishes.
  const visible = limit > 0
    ? items.filter((t, i) => t.exiting || i >= items.length - limit)
    : items;
  return createPortal(
    <div className="au-toast-host" role="region" aria-live="polite" aria-label="Notifications">
      {visible.map(t => <ToastCard key={t.id} t={t} />)}
    </div>,
    document.body,
  );
}

import { useCallback, useEffect, useRef, useState, type ReactNode, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { IconX, IconChevronDown } from '@tabler/icons-react';

function useDismiss(opened: boolean, onClose: () => void) {
  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [opened, onClose]);
}

interface ShellProps {
  opened: boolean;
  onClose: () => void;
  title: ReactNode;
  brand?: string;
  width?: number;
  /** Override the overlay z-index (default 300). Use to stack over flow-editor modals. */
  zIndex?: number;
  children: ReactNode;
}

/** Centered Astral modal - Mantine-free (portal + overlay + escape + click-outside). */
export function AstralModal({ opened, onClose, title, brand, width = 460, zIndex, children }: ShellProps) {
  useDismiss(opened, onClose);
  if (!opened) return null;
  const style = { maxWidth: width, ...(brand ? { '--au-ic': brand } : {}) } as CSSProperties;
  return createPortal(
    <div className="au-modal-overlay" onMouseDown={onClose} style={zIndex != null ? { zIndex } : undefined}>
      <div className="au-modal-panel" style={style} onMouseDown={(e) => e.stopPropagation()}>
        <div className="au-modal-head">
          <span className="au-modal-title">{title}</span>
          <button type="button" className="au-modal-x" onClick={onClose} aria-label="Close"><IconX /></button>
        </div>
        <div className="au-modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Right-side Astral drawer - Mantine-free. */
export function AstralDrawer({ opened, onClose, title, brand, width = 440, zIndex, children }: ShellProps) {
  useDismiss(opened, onClose);
  if (!opened) return null;
  const style = { width, ...(brand ? { '--au-ic': brand } : {}) } as CSSProperties;
  return createPortal(
    <div className="au-drawer-overlay" onMouseDown={onClose} style={zIndex != null ? { zIndex } : undefined}>
      <div className="au-drawer-panel" style={style} onMouseDown={(e) => e.stopPropagation()}>
        <div className="au-drawer-head">
          <span className="au-drawer-title">{title}</span>
          <button type="button" className="au-modal-x" onClick={onClose} aria-label="Close"><IconX /></button>
        </div>
        <div className="au-drawer-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Astral 6-box code input - Mantine-free, with auto-advance, backspace, paste and arrows. */
export function AstralPinInput({ length = 6, value, onChange, autoFocus }: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  const focusBox = (i: number) => { refs.current[Math.max(0, Math.min(length - 1, i))]?.focus(); };

  const handleChange = (i: number, raw: string) => {
    const clean = raw.replace(/\D/g, '');
    if (!clean) return;
    const arr = value.split('');
    let pos = i;
    for (const ch of clean) {
      if (pos >= length) break;
      arr[pos] = ch;
      pos++;
    }
    onChange(arr.join('').slice(0, length));
    focusBox(pos);
  };

  const handleKeyDown = (i: number, e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const arr = value.split('');
      if (arr[i]) {
        arr[i] = '';
        onChange(arr.join(''));
      } else if (i > 0) {
        arr[i - 1] = '';
        onChange(arr.join(''));
        focusBox(i - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusBox(i + 1);
    }
  };

  return (
    <div className="au-pin">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className="au-pin-box"
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label={`Digit ${i + 1}`}
          value={d}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e.currentTarget.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.currentTarget.select()}
        />
      ))}
    </div>
  );
}

export interface AstralSelectOption { value: string; label: string; }

/** Astral select with optional search/create/clear - Mantine-free combobox. */
export function AstralSelect({ value, onChange, options, placeholder, disabled, searchable, searchPlaceholder, noResults, clearable, creatable }: {
  value: string | null;
  onChange: (value: string) => void;
  options: AstralSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  noResults?: string;
  clearable?: boolean;
  creatable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; width: number; maxHeight: number } | null>(null);

  const reposition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - 12;
    const spaceAbove = r.top - 12;
    const flipUp = spaceBelow < 200 && spaceAbove > spaceBelow;
    setPos({
      left: r.left,
      width: r.width,
      ...(flipUp
        ? { bottom: window.innerHeight - r.top + 5, maxHeight: Math.max(140, Math.min(300, spaceAbove)) }
        : { top: r.bottom + 5, maxHeight: Math.max(140, Math.min(300, spaceBelow)) }),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    reposition();
    const onScroll = () => reposition();
    const onResize = () => setOpen(false);
    const onDoc = (e: MouseEvent) => {
      if (triggerRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    // Capture phase: AstralModal/AstralDrawer panels stopPropagation on mousedown,
    // which would otherwise block this outside-click close when the overlay lives inside one.
    document.addEventListener('mousedown', onDoc, true);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousedown', onDoc, true);
    };
  }, [open, reposition]);

  const selected = options.find(o => o.value === value);
  const hasValue = value != null && value !== '';
  const display = selected ? selected.label : (value ?? '');
  const filtered = searchable && q.trim()
    ? options.filter(o => o.label.toLowerCase().includes(q.trim().toLowerCase()))
    : options;
  const showCreate = !!creatable && !!q.trim() && !options.some(o => o.label.toLowerCase() === q.trim().toLowerCase());

  return (
    <div className="au-select">
      <button ref={triggerRef} type="button" className="au-input au-select-trigger" disabled={disabled} onClick={() => setOpen(o => !o)}>
        <span className={hasValue ? '' : 'ph'}>{hasValue ? display : placeholder}</span>
        {clearable && hasValue ? (
          <span className="au-select-caret au-select-clear" role="button" tabIndex={-1}
            onClick={(e) => { e.stopPropagation(); onChange(''); }}><IconX size={14} /></span>
        ) : (
          <IconChevronDown size={15} className="au-select-caret" />
        )}
      </button>
      {open && !disabled && pos && createPortal(
        <div
          ref={menuRef}
          className="au-select-menu"
          style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width, maxHeight: pos.maxHeight }}
        >
          {searchable && (
            <input
              autoFocus
              className="au-select-search"
              placeholder={searchPlaceholder}
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
            />
          )}
          {filtered.length === 0 && !showCreate && <div className="au-select-empty">{noResults}</div>}
          {filtered.map(o => (
            <button
              type="button"
              key={o.value}
              className={`au-select-opt${o.value === value ? ' on' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); setQ(''); }}
            >
              {o.label}
            </button>
          ))}
          {showCreate && (
            <button type="button" className="au-select-opt au-select-create"
              onClick={() => { onChange(q.trim()); setOpen(false); setQ(''); }}>
              + {q.trim()}
            </button>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}

export interface AstralMenuItem { key?: string; label: ReactNode; icon?: ReactNode; onClick?: () => void; danger?: boolean; divider?: boolean; disabled?: boolean; }

/** Astral action-menu dropdown - Mantine-free, portalled like AstralSelect. */
export function AstralMenu({ trigger, items, align = 'end', width = 220 }: {
  trigger: ReactNode;
  items: AstralMenuItem[];
  align?: 'start' | 'end';
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top?: number; bottom?: number; minWidth: number; maxHeight: number } | null>(null);

  const reposition = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - 12;
    const spaceAbove = r.top - 12;
    const flipUp = spaceBelow < 220 && spaceAbove > spaceBelow;
    const left = align === 'end' ? Math.max(8, Math.min(r.right - width, window.innerWidth - width - 8)) : Math.min(r.left, window.innerWidth - width - 8);
    setPos({
      left,
      minWidth: width,
      ...(flipUp
        ? { bottom: window.innerHeight - r.top + 5, maxHeight: Math.max(160, Math.min(380, spaceAbove)) }
        : { top: r.bottom + 5, maxHeight: Math.max(160, Math.min(380, spaceBelow)) }),
    });
  }, [align, width]);

  useEffect(() => {
    if (!open) return;
    reposition();
    const onScroll = () => reposition();
    const onResize = () => setOpen(false);
    const onDoc = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    // Capture phase: AstralModal/AstralDrawer panels stopPropagation on mousedown,
    // which would otherwise block this outside-click close when the overlay lives inside one.
    document.addEventListener('mousedown', onDoc, true);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('mousedown', onDoc, true);
    };
  }, [open, reposition]);

  return (
    <>
      <div className="au-menu-anchor" ref={anchorRef} onClick={() => setOpen(o => !o)}>
        {trigger}
      </div>
      {open && pos && createPortal(
        <div ref={menuRef} className="au-menu" style={{ left: pos.left, top: pos.top, bottom: pos.bottom, minWidth: pos.minWidth, maxHeight: pos.maxHeight }}>
          {items.map((it, i) => it.divider
            ? <div key={it.key ?? `d${i}`} className="au-menu-divider" />
            : (
              <button type="button" key={it.key ?? i} className={`au-menu-item${it.danger ? ' danger' : ''}`} disabled={it.disabled}
                onClick={() => { setOpen(false); it.onClick?.(); }}>
                {it.icon && <span className="au-menu-ic">{it.icon}</span>}
                <span className="au-menu-label">{it.label}</span>
              </button>
            ))}
        </div>,
        document.body,
      )}
    </>
  );
}

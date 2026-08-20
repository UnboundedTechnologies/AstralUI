import { useCallback, useEffect, useRef, useState, type ReactNode, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, useId } from 'react';
import { createPortal } from 'react-dom';
import { IconX, IconChevronDown } from '@tabler/icons-react';

let dialogSeq = 0;

/** Every dialog currently on screen, innermost last. */
const dialogStack: HTMLElement[] = [];

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Turns a portalled overlay into a real dialog.
 *
 * Without this the panel is an anonymous div: assistive tech never announces
 * it, focus stays on whatever opened it, and Tab walks straight out into the
 * page behind the overlay - which is still fully operable underneath.
 *
 * Escape and the focus trap are scoped to the TOPMOST dialog. The previous
 * implementation bound Escape per-instance, so with two dialogs open a single
 * key press closed both at once.
 */
function useDialog(opened: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const idRef = useRef('');
  if (!idRef.current) idRef.current = 'au-dialog-title-' + String(++dialogSeq);

  // Kept in a ref so a caller passing a fresh arrow function every render does
  // not tear the trap down and rebuild it (which would drop focus each time).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!opened) return;
    const panel = panelRef.current;
    if (!panel) return;

    const restoreTo = document.activeElement as HTMLElement | null;
    dialogStack.push(panel);
    const isTop = () => dialogStack[dialogStack.length - 1] === panel;

    const focusables = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
      );

    // Give a child's own autoFocus one frame to win before taking over, so a
    // dialog that means to land on a particular field still does.
    const raf = requestAnimationFrame(() => {
      if (panel.contains(document.activeElement)) return;
      const list = focusables();
      // Prefer anything over the close button - landing on "Close" invites
      // dismissing the dialog you just opened.
      const target = list.find((el) => !el.classList.contains('au-modal-x')) ?? list[0] ?? panel;
      target.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (!isTop()) return;
      if (e.key === 'Escape') { onCloseRef.current(); return; }
      if (e.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) { e.preventDefault(); panel.focus(); return; }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!panel.contains(active)) { e.preventDefault(); (e.shiftKey ? last : first).focus(); return; }
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey, true);
      const at = dialogStack.indexOf(panel);
      if (at !== -1) dialogStack.splice(at, 1);
      document.body.style.overflow = prevOverflow;
      // Hand focus back to whatever opened this, so the keyboard does not jump
      // to the top of the page.
      if (restoreTo && document.contains(restoreTo)) restoreTo.focus();
    };
  }, [opened]);

  return { panelRef, titleId: idRef.current };
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

/** Centered Astral modal (portal + overlay + escape + click-outside). */
export function AstralModal({ opened, onClose, title, brand, width = 460, zIndex, children }: ShellProps) {
  const { panelRef, titleId } = useDialog(opened, onClose);
  if (!opened) return null;
  const style = { maxWidth: width, ...(brand ? { '--au-ic': brand } : {}) } as CSSProperties;
  return createPortal(
    <div className="au-modal-overlay" onMouseDown={onClose} style={zIndex != null ? { zIndex } : undefined}>
      <div
        ref={panelRef}
        className="au-modal-panel"
        style={style}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
      >
        <div className="au-modal-head">
          <span className="au-modal-title" id={titleId}>{title}</span>
          <button type="button" className="au-modal-x" onClick={onClose} aria-label="Close"><IconX /></button>
        </div>
        <div className="au-modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Right-side Astral drawer. */
export function AstralDrawer({ opened, onClose, title, brand, width = 440, zIndex, children }: ShellProps) {
  const { panelRef, titleId } = useDialog(opened, onClose);
  if (!opened) return null;
  const style = { width, ...(brand ? { '--au-ic': brand } : {}) } as CSSProperties;
  return createPortal(
    <div className="au-drawer-overlay" onMouseDown={onClose} style={zIndex != null ? { zIndex } : undefined}>
      <div
        ref={panelRef}
        className="au-drawer-panel"
        style={style}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
      >
        <div className="au-drawer-head">
          <span className="au-drawer-title" id={titleId}>{title}</span>
          <button type="button" className="au-modal-x" onClick={onClose} aria-label="Close"><IconX /></button>
        </div>
        <div className="au-drawer-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Astral 6-box code input, with auto-advance, backspace, paste and arrows. */
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

/** Astral select with optional search/create/clear - combobox. */
export function AstralSelect({ value, onChange, options, placeholder, disabled, searchable, searchPlaceholder, noResults, clearable, creatable, id, ariaLabel, ariaLabelledBy, clearLabel = 'Clear selection' }: {
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
  /** Put this on the trigger so a visible <label htmlFor> can name it. */
  id?: string;
  /** Name the control when there is no visible label to point at. */
  ariaLabel?: string;
  /** Id of the visible label element naming this control. */
  ariaLabelledBy?: string;
  /** Accessible name for the clear button on a `clearable` select. */
  clearLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Which option the keyboard is on. -1 = none. This is aria-activedescendant
  // navigation: DOM focus stays on the trigger (or the search box), so the
  // portal never steals the tab sequence.
  const [activeIndex, setActiveIndex] = useState(-1);
  const reactId = useId();
  const baseId = id ?? `au-select-${reactId}`;
  const listboxId = `${baseId}-listbox`;
  const optionId = (i: number) => `${baseId}-opt-${i}`;
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
    if (!open) { setActiveIndex(-1); return; }
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

  // The rows the keyboard walks, in the order they are rendered, so the index
  // means the same thing to both the key handler and the markup below.
  const rows: string[] = [...filtered.map(o => o.value), ...(showCreate ? [q.trim()] : [])];

  // Arrowing past the visible rows must scroll them into view - the menu has a
  // maxHeight and the rows never take DOM focus, so the browser will not do it.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = menuRef.current?.querySelector(`#${CSS.escape(optionId(activeIndex))}`);
    (el as HTMLElement | null)?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex, baseId]);

  const commit = (index: number) => {
    const picked = rows[index];
    if (picked == null) return;
    onChange(picked);
    setOpen(false);
    setQ('');
    triggerRef.current?.focus();
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (disabled) return;
    const key = e.key;
    if (!open) {
      // A closed combobox opens on ArrowDown/ArrowUp/Enter/Space, per the
      // WAI-ARIA combobox pattern. Previously only a mouse click worked.
      if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter' || key === ' ') {
        e.preventDefault();
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }
    if (key === 'Escape') {
      // Stop here: an AstralSelect inside an AstralModal must close the SELECT,
      // not the modal behind it.
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      setQ('');
      triggerRef.current?.focus();
    } else if (key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (rows.length ? (i + 1) % rows.length : -1));
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => (rows.length ? (i <= 0 ? rows.length - 1 : i - 1) : -1));
    } else if (key === 'Home') {
      e.preventDefault();
      setActiveIndex(rows.length ? 0 : -1);
    } else if (key === 'End') {
      e.preventDefault();
      setActiveIndex(rows.length - 1);
    } else if (key === 'Enter') {
      e.preventDefault();
      commit(activeIndex >= 0 ? activeIndex : 0);
    } else if (key === 'Tab') {
      // Tabbing away commits nothing and leaves no orphan menu behind.
      setOpen(false);
      setQ('');
    }
  };

  return (
    <div className="au-select">
      <button
        ref={triggerRef}
        id={baseId}
        type="button"
        className="au-input au-select-trigger"
        disabled={disabled}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        // Only while the TRIGGER holds focus. When searchable, autoFocus moves
        // focus into the search box, which carries its own copy - and
        // aria-activedescendant on an unfocused element means nothing.
        aria-activedescendant={open && !searchable && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        onClick={() => setOpen(o => !o)}
        onKeyDown={onKeyDown}
      >
        <span className={hasValue ? '' : 'ph'}>{hasValue ? display : placeholder}</span>
        {clearable && hasValue ? (
          // Was a <span role="button" tabIndex={-1}>: announced as a button and
          // reachable by nobody, so a keyboard user could not clear the field.
          // It is a real button now, and it stops the click bubbling to the
          // trigger so clearing does not also open the menu.
          <span
            className="au-select-caret au-select-clear"
            role="button"
            tabIndex={0}
            aria-label={clearLabel}
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onChange('');
              }
            }}
          ><IconX size={14} /></span>
        ) : (
          <IconChevronDown size={15} className="au-select-caret" />
        )}
      </button>
      {open && !disabled && pos && createPortal(
        <div
          ref={menuRef}
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabel ? undefined : ariaLabelledBy}
          className="au-select-menu"
          style={{ left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width, maxHeight: pos.maxHeight }}
        >
          {searchable && (
            <input
              autoFocus
              className="au-select-search"
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              aria-controls={listboxId}
              // A screen reader follows aria-activedescendant on the element
              // that HAS focus. autoFocus moves focus here, so the copy on the
              // trigger stops being read the moment the box appears.
              role="combobox"
              aria-expanded
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
              value={q}
              onChange={(e) => { setQ(e.currentTarget.value); setActiveIndex(0); }}
              onKeyDown={onKeyDown}
            />
          )}
          {filtered.length === 0 && !showCreate && <div className="au-select-empty">{noResults}</div>}
          {filtered.map((o, i) => (
            <div
              key={o.value}
              id={optionId(i)}
              role="option"
              aria-selected={o.value === value}
              // The rows are driven by aria-activedescendant, so they must NOT
              // be in the tab sequence: the menu portals to document.body, and
              // focusable rows there sent Tab to the end of the document.
              className={`au-select-opt${o.value === value ? ' on' : ''}${i === activeIndex ? ' active' : ''}`}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => commit(i)}
            >
              {o.label}
            </div>
          ))}
          {showCreate && (
            <div
              id={optionId(filtered.length)}
              role="option"
              aria-selected={false}
              className={`au-select-opt au-select-create${filtered.length === activeIndex ? ' active' : ''}`}
              onMouseEnter={() => setActiveIndex(filtered.length)}
              onClick={() => commit(filtered.length)}
            >
              + {q.trim()}
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}

export interface AstralMenuItem { key?: string; label: ReactNode; icon?: ReactNode; onClick?: () => void; danger?: boolean; divider?: boolean; disabled?: boolean; }

/** Astral action-menu dropdown - portalled like AstralSelect. */
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

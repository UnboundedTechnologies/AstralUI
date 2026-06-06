import {
  useRef, useState, useLayoutEffect, useCallback,
  type CSSProperties, type ReactNode,
} from 'react';
import { IconChevronDown } from '@tabler/icons-react';

/* A header + animated region that folds its content away. Both the open AND the
   close ease smoothly: we measure the content's exact height and transition
   `max-height` to it (grid 0fr/1fr snaps shut on collapse in some browsers).
   A ResizeObserver keeps the height correct if the content changes while open.

   Works uncontrolled (`defaultOpen`) or controlled (`open` + `onOpenChange`). */

export interface CollapsibleProps {
  /** Header content - clicking it toggles the region. */
  title: ReactNode;
  children: ReactNode;
  /** Uncontrolled initial state (ignored when `open` is provided). */
  defaultOpen?: boolean;
  /** Controlled open state. Pair with `onOpenChange`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Collapsible({
  title, children, defaultOpen = false, open: controlledOpen, onOpenChange, disabled, className, style,
}: CollapsibleProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const innerRef = useRef<HTMLDivElement>(null);
  const [maxH, setMaxH] = useState(0);

  // Sync the region height to the content's real height whenever it opens/closes,
  // and keep it in sync while open if the content grows or shrinks.
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const sync = () => setMaxH(open ? el.scrollHeight : 0);
    sync();
    if (!open) return;
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, children]);

  const toggle = useCallback(() => {
    if (disabled) return;
    const next = !open;
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [disabled, open, isControlled, onOpenChange]);

  return (
    <div className={`au-collapse${open ? ' au-collapse--open' : ''}${className ? ' ' + className : ''}`} style={style}>
      <button type="button" className="au-collapse-head" aria-expanded={open} disabled={disabled} onClick={toggle}>
        <span className="au-collapse-title">{title}</span>
        <IconChevronDown size={16} className="au-collapse-chev" aria-hidden />
      </button>
      <div className="au-collapse-region" style={{ maxHeight: open ? maxH : 0 }}>
        <div className="au-collapse-inner" ref={innerRef}>
          {children}
        </div>
      </div>
    </div>
  );
}

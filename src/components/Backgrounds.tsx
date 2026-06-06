import type { ReactNode, CSSProperties } from 'react';

interface BackgroundProps {
  /** Content rendered above the backdrop (it becomes the positioning context). */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Pin to the viewport (position:fixed, inset:0) instead of filling the parent. */
  fixed?: boolean;
}

function cls(base: string, extra?: string) {
  return extra ? `${base} ${extra}` : base;
}

/** Animated cosmic backdrop with a twinkling starfield. Great for auth screens,
 *  heroes, or splash pages. Wrap your content as children. */
export function SpaceBackground({ children, className, style, fixed }: BackgroundProps) {
  const s: CSSProperties = fixed ? { position: 'fixed', inset: 0, ...style } : style ?? {};
  return (
    <div className={cls('astral-space-bg', className)} style={s}>
      <div className="astral-stars" aria-hidden="true" />
      {children}
    </div>
  );
}

/** Subtle technical grid backdrop with a brand-tinted radial glow, faded toward
 *  the edges with a radial mask. */
export function GridBackground({ children, className, style, fixed }: BackgroundProps) {
  const s: CSSProperties = fixed ? { position: 'fixed', inset: 0, ...style } : style ?? {};
  return (
    <div className={cls('astral-grid-bg', className)} style={s}>
      {children}
    </div>
  );
}

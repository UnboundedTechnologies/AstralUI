import type { CSSProperties } from 'react';

/* Minimal theme-aware spinner. Styled by the .au-spinner class (in tokens.css);
   size via the `size` prop (px). */
export function Spinner({ size = 24, className, style }: { size?: number; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={className ? `au-spinner ${className}` : 'au-spinner'}
      style={{ width: size, height: size, ...style }}
      role="status"
      aria-label="Loading"
    />
  );
}

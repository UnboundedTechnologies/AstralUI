import { useEffect, useState } from 'react';

/* A self-contained avatar: shows an image when `url` loads, otherwise a clean
   initials tile in the brand gradient. In `overlay` mode the image absolutely
   fills its positioned parent and renders nothing on failure (so the parent's
   own content shows through). */

export interface AvatarProps {
  url?: string | null;
  /** used for the alt text and to derive initials */
  name?: string | null;
  size?: number;
  radius?: number | string;
  className?: string;
  /** fill the positioned parent instead of rendering a standalone tile */
  overlay?: boolean;
  /** override the initials-tile background (defaults to the brand gradient) */
  color?: string;
}

export function Avatar({ url, name, size = 36, radius = '50%', className = '', overlay = false, color }: AvatarProps) {
  const [broken, setBroken] = useState(false);

  // A new URL should get another chance to load.
  useEffect(() => { setBroken(false); }, [url]);

  if (overlay) {
    if (!url || broken) return null;
    return (
      <img
        src={url}
        alt={name || ''}
        className={className}
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: radius, objectFit: 'cover' }}
      />
    );
  }

  if (url && !broken) {
    return (
      <img
        src={url}
        alt={name || ''}
        className={className}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        loading="lazy"
        onError={() => setBroken(true)}
        style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', display: 'block', flex: '0 0 auto' }}
      />
    );
  }

  const initials = (name || '').trim().slice(0, 2).toUpperCase() || '-';
  return (
    <span
      className={className}
      aria-hidden
      style={{
        width: size, height: size, borderRadius: radius, flex: '0 0 auto',
        display: 'inline-grid', placeItems: 'center', color: '#fff', fontWeight: 700,
        fontSize: Math.max(9, Math.round(size * 0.4)), lineHeight: 1,
        background: color ?? 'linear-gradient(135deg, var(--astral-color-violet-6), var(--astral-color-violet-8))',
      }}
    >
      {initials}
    </span>
  );
}

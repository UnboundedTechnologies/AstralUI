import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

/* Native <input type="date" | "datetime-local"> that mirrors exactly what the user
   types and only commits a parsed Date upward once the string is a COMPLETE, plausible
   value. A fully-controlled date input that round-trips every keystroke through
   `new Date(y, m-1, d)` hits JS's 0-99 -> 1900s year remap mid-typing (so "2" -> 1902),
   and the reformatted value fights the user's typing into a re-render storm that freezes
   the page. Keeping the string local and gating the commit avoids that entirely.
   `color-scheme` is left to inherit so the native calendar glyph follows the app theme. */

const pad2 = (n: number) => String(n).padStart(2, '0');
const pad4 = (n: number) => String(n).padStart(4, '0');

/** Date -> "YYYY-MM-DD" (local) */
export function dateToInputStr(d: Date | null): string {
  if (!d || isNaN(d.getTime())) return '';
  return `${pad4(d.getFullYear())}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Date -> "YYYY-MM-DDTHH:mm" (local) */
export function dateTimeToInputStr(d: Date | null): string {
  if (!d || isNaN(d.getTime())) return '';
  return `${dateToInputStr(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

interface Props {
  type?: 'date' | 'datetime-local';
  value: Date | null;
  onChange: (d: Date | null) => void;
  min?: Date;
  max?: Date;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  'aria-label'?: string;
}

export default function DateInput({ type = 'date', value, onChange, min, max, className, style, disabled, 'aria-label': ariaLabel }: Props) {
  const isTime = type === 'datetime-local';
  const fmt = isTime ? dateTimeToInputStr : dateToInputStr;
  const [s, setS] = useState(() => fmt(value));
  // Re-sync from the parent (preset buttons, programmatic clears) without fighting typing.
  const t = value?.getTime();
  useEffect(() => { setS(fmt(value)); }, [t]); // eslint-disable-line react-hooks/exhaustive-deps

  const handle = (str: string) => {
    setS(str);
    if (str === '') { onChange(null); return; }
    const m = (isTime ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/ : /^(\d{4})-(\d{2})-(\d{2})$/).exec(str);
    if (!m) return; // incomplete - hold locally, don't commit
    const y = Number(m[1]);
    if (y < 1970 || y > 2100) return; // implausible (mid-typed) year - wait for a full one
    const d = isTime
      ? new Date(y, Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]))
      : new Date(y, Number(m[2]) - 1, Number(m[3]));
    if (isNaN(d.getTime())) return;
    onChange(d);
  };

  return (
    <input
      type={type}
      className={className}
      style={style}
      disabled={disabled}
      aria-label={ariaLabel}
      value={s}
      min={min ? fmt(min) : undefined}
      max={max ? fmt(max) : undefined}
      onChange={e => handle(e.currentTarget.value)}
    />
  );
}

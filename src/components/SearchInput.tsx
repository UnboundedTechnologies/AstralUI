import type { CSSProperties } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';

/* A clearable search field: leading search icon + input + a clear (X) button that
   appears once there's text. Controlled via `value` / `onChange`. Debounce the
   value in the parent if you're querying on change (see the docs example). */

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** runs when the clear button is pressed (defaults to onChange('')) */
  onClear?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function SearchInput({
  value, onChange, placeholder, onClear, autoFocus, disabled, className, style, 'aria-label': ariaLabel,
}: SearchInputProps) {
  return (
    <div className={`au-search${className ? ' ' + className : ''}`} style={style}>
      <IconSearch size={15} />
      <input
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder ?? 'Search'}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      {value && !disabled && (
        <button
          type="button"
          className="clr"
          onClick={() => (onClear ? onClear() : onChange(''))}
          aria-label="Clear search"
        >
          <IconX size={13} />
        </button>
      )}
    </div>
  );
}

import type { ReactNode } from 'react';
import { AstralModal } from './overlay';

/* A confirmation / alert dialog built on AstralModal. Use for destructive or
   important actions ("Delete campaign?"). Set `danger` for a red confirm button. */

export interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: ReactNode;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** red confirm button for destructive actions */
  danger?: boolean;
  /** show a spinner and disable the buttons while an async action runs */
  loading?: boolean;
  width?: number;
  /** extra content rendered above the actions (e.g. a checkbox) */
  children?: ReactNode;
}

export function ConfirmModal({
  opened, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  danger, loading, width = 420, children,
}: ConfirmModalProps) {
  return (
    <AstralModal opened={opened} onClose={onClose} title={title} width={width}>
      <div className="clay-form">
        {message != null && (
          <div style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--au-dim)' }}>{message}</div>
        )}
        {children}
        <div className="clay-actions">
          <button type="button" className="au-btn" onClick={onClose} disabled={loading}>{cancelLabel}</button>
          <button
            type="button"
            className={`au-btn ${danger ? 'solidred' : 'primary'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span className="au-spinner" style={{ width: 14, height: 14 }} /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </AstralModal>
  );
}

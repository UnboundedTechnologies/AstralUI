import type { ReactNode, CSSProperties } from 'react';

/* Auth surface scaffolding for sign-in / sign-up / verify / onboarding screens.
   Compose <AuthShell> (full-screen backdrop + centering) with <AuthCard> and the
   au-auth-* classes (fields, notices, stepper, buttons) documented in the CSS. */

interface AuthShellProps {
  children: ReactNode;
  /** 'space' = cosmic starfield (default), 'wash' = brand radial + faint grid. */
  backdrop?: 'space' | 'wash';
  /** top-left slot (e.g. a back button) */
  topLeft?: ReactNode;
  /** top-right slot (e.g. a language switcher) */
  topRight?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function AuthShell({ children, backdrop = 'space', topLeft, topRight, className, style }: AuthShellProps) {
  const cls = `au-auth${backdrop === 'space' ? ' astral-space-bg' : ''}${className ? ' ' + className : ''}`;
  return (
    <div className={cls} style={style}>
      {backdrop === 'space'
        ? <div className="astral-stars" aria-hidden="true" />
        : <div className="au-auth-bg" aria-hidden="true" />}
      {topLeft}
      {topRight ? <div className="au-auth-lang">{topRight}</div> : null}
      {children}
    </div>
  );
}

interface AuthCardProps {
  children: ReactNode;
  /** rendered in the branded banner strip at the top of the card (e.g. a logo) */
  banner?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function AuthCard({ children, banner, className, style }: AuthCardProps) {
  return (
    <div className={`au-auth-card${className ? ' ' + className : ''}`} style={style}>
      {banner ? <div className="au-auth-banner">{banner}</div> : null}
      {children}
    </div>
  );
}

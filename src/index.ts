/* @astralui/core - public API.
   Consumers must also import the stylesheet once:  import '@astralui/core/styles.css'; */

// Theme engine
export { ColorSchemeProvider, useColorScheme } from './theme/ColorSchemeProvider';
export type { ColorScheme } from './theme/ColorSchemeProvider';
export { AstralThemeProvider, useThemePreview, buildOrgCss } from './theme/AstralProvider';
export type { AstralThemeColors } from './theme/AstralProvider';
export { generateColors } from './theme/generateColors';

// Overlays / inputs
export { AstralModal, AstralDrawer, AstralPinInput, AstralSelect, AstralMenu } from './components/overlay';
export type { AstralSelectOption, AstralMenuItem } from './components/overlay';

// Notifications
export { notifications, AstralToaster } from './components/Toast';
export type { ToastOptions } from './components/Toast';

// Primitives
export { default as DateInput, dateToInputStr, dateTimeToInputStr } from './components/DateInput';
export { Spinner } from './components/Spinner';

// Backgrounds
export { SpaceBackground, GridBackground } from './components/Backgrounds';

// Charts (dependency-free, prop-driven)
export { Sparkline, Delta, Donut, FunnelBars, StackedBars, chartColor } from './components/Charts';
export type { DonutDatum, FunnelDatum, StackedRow, StackedSeries } from './components/Charts';

// Auth surface (sign-in / sign-up / verify / onboarding)
export { AuthShell, AuthCard } from './components/Auth';

// Confirmation dialog
export { ConfirmModal } from './components/ConfirmModal';
export type { ConfirmModalProps } from './components/ConfirmModal';

// Avatar + status badge
export { Avatar } from './components/Avatar';
export type { AvatarProps } from './components/Avatar';
export { StatusBadge } from './components/StatusBadge';
export type { StatusBadgeProps } from './components/StatusBadge';

// Search input
export { SearchInput } from './components/SearchInput';
export type { SearchInputProps } from './components/SearchInput';

// Collapsible (animated fold/unfold)
export { Collapsible } from './components/Collapsible';
export type { CollapsibleProps } from './components/Collapsible';

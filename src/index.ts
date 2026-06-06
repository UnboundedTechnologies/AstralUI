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

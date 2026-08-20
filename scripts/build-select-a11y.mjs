// Bundles playground/select-a11y.jsx into docs/ so the combobox keyboard path
// can be driven in a real browser. Kept because the behaviour it exercises
// (aria-activedescendant, Escape scoping, the clear button) is invisible to
// tsc and easy to regress.
import { build } from 'esbuild';
await build({
  entryPoints: ['playground/select-a11y.jsx'],
  bundle: true, format: 'esm', outfile: 'docs/select-a11y.js',
  jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' },
  loader: { '.css': 'css' }, logLevel: 'error',
});
console.log('built docs/select-a11y.js');

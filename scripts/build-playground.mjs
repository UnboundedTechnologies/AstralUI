// Pre-bundle the docs playground (React + @astralui/core + only the used icons,
// tree-shaken) into a single local file - so the live demo has no runtime CDN
// dependency on esm.sh and the whole @tabler/icons-react package.
import { build } from 'esbuild';

await build({
  entryPoints: ['playground/main.jsx'],
  bundle: true,
  format: 'esm',
  outfile: 'docs/playground.app.js',
  jsx: 'automatic',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
  logLevel: 'info',
});
console.log('built docs/playground.app.js');

// Concatenate the AstralUI stylesheets into a single dist/styles.css that
// consumers import once: `import '@astralui/core/styles.css'`.
// @import rules (e.g. the font) are hoisted to the very top so the bundle stays valid CSS.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Order matters: design tokens first, then the utility/component classes that consume them.
const files = ['src/styles/tokens.css', 'src/styles/utilities.css', 'src/styles/toast.css', 'src/styles/backgrounds.css', 'src/styles/charts.css', 'src/styles/auth.css', 'src/styles/badge.css'];

const imports = [];
const bodies = files.map((rel) => {
  let css = readFileSync(resolve(root, rel), 'utf8');
  css = css.replace(/^[ \t]*@import\s[^\n]*;[ \t]*$/gm, (line) => {
    imports.push(line.trim());
    return '';
  });
  return `/* ===== ${rel} ===== */\n${css.trim()}\n`;
});

const out = [...new Set(imports)].join('\n') + (imports.length ? '\n\n' : '') + bodies.join('\n\n');

mkdirSync(resolve(root, 'dist'), { recursive: true });
writeFileSync(resolve(root, 'dist/styles.css'), out);
console.log(`built dist/styles.css (${out.length} bytes, ${imports.length} hoisted @import)`);

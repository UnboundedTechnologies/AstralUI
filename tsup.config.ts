import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  // React, react-dom and the icon set are provided by the consuming app.
  external: ['react', 'react-dom', 'react/jsx-runtime', '@tabler/icons-react'],
});

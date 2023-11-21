import path from 'path';
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'placeholder-lib-name',
      // fileName: 'index',
      fileName: (format) =>
        format == 'es' ? `index.js` : `index.${format}.js`,
    },
    sourcemap: true,
  },
  plugins: [dts()],
  test: {
    dir: 'src',
  },
});

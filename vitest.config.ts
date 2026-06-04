import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@contracts/utils/checksum', replacement: path.resolve(__dirname, 'shared/utils/checksum.ts') },
      { find: '@contracts', replacement: path.resolve(__dirname, 'shared/types') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@shared', replacement: path.resolve(__dirname, 'src/types') },
      { find: '@game', replacement: path.resolve(__dirname, 'src/game') },
      { find: '@services', replacement: path.resolve(__dirname, 'src/services') },
      { find: '@store', replacement: path.resolve(__dirname, 'src/store') },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'shared/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/services/**', 'shared/**', 'src/game/progression/**'],
    },
  },
});

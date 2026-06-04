import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@game': path.resolve(__dirname, 'src/game'),
        '@ui': path.resolve(__dirname, 'src/ui'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@shared': path.resolve(__dirname, 'src/types'),
        '@store': path.resolve(__dirname, 'src/store'),
        '@contracts/utils': path.resolve(__dirname, 'shared/utils'),
        '@contracts': path.resolve(__dirname, 'shared/types'),
      },
    },
    server: {
      port: Number(env.VITE_DEV_PORT) || 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET ?? 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2022',
      sourcemap: !isProd,
      minify: isProd ? 'esbuild' : false,
      cssMinify: isProd,
      reportCompressedSize: isProd,
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/phaser')) return 'phaser';
            if (id.includes('node_modules/react')) return 'react';
            if (id.includes('/src/game/')) return 'game';
            if (id.includes('node_modules/zustand')) return 'state';
          },
        },
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
    },
  };
});

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const network = env.VITE_SUI_NETWORK || 'testnet';
  const apiKey = env.VITE_TATUM_API_KEY;

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/sui': {
          target: `https://sui-${network}.gateway.tatum.io`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/sui/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('x-api-key', apiKey);
            });
          },
        },
      },
    },
  };
});
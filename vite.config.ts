import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const network = env.VITE_SUI_NETWORK;
  const apiKey = env.VITE_TATUM_API_KEY;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
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
        '/api/walrus-upload': {
          target: 'https://api.tatum.io',
          changeOrigin: true,
          rewrite: () => '/v4/data/storage/upload',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('x-api-key', apiKey);
            });
          },
        },
        '/api/walrus-status': {
          target: 'https://api.tatum.io',
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              proxyReq.setHeader('x-api-key', apiKey);
              const jobId = req.url?.split('jobId=')[1]?.split('&')[0];
              proxyReq.path = `/v4/data/storage/upload/${jobId}`;
            });
          },
        },
        '/api/walrus-blob': {
          target: `https://aggregator.walrus-${network}.walrus.space`,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const blobId = req.url?.split('blobId=')[1]?.split('&')[0];
              proxyReq.path = `/v1/blobs/${blobId}`;
            });
          },
        },
      },
    },
  };
});
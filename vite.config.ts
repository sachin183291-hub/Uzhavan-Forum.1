import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/hw': {
          target: 'http://10.57.97.215',
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/hw/, ''),
          proxyTimeout: 6000,
          timeout: 6000,
        },
        '/sms': {
          target: 'https://www.fast2sms.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path: string) => path.replace(/^\/sms/, ''),
        },
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});

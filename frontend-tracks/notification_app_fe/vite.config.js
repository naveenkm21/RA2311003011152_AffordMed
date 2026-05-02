import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const token = env.VITE_AUTH_TOKEN || '';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://20.207.122.201',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api/, ''),
          configure: (proxy) => {
            if (token) {
              proxy.on('proxyReq', (proxyReq) => {
                if (!proxyReq.getHeader('authorization')) {
                  proxyReq.setHeader('authorization', `Bearer ${token}`);
                }
              });
            }
          },
        },
      },
    },
  };
});

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const rootDir = resolve(__dirname, '..');
  const env = { ...loadEnv(mode, rootDir, ''), ...loadEnv(mode, __dirname, '') };
  const apiProxyTarget = env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:3001';

  if (mode === 'production') {
    const supabaseUrl = env.VITE_SUPABASE_URL?.trim();
    const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || env.VITE_SUPABASE_ANON_KEY?.trim();
    if (!supabaseUrl || !publishableKey) {
      throw new Error('Production builds require VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
    }
    if (/service[_-]?role|sb_secret_/i.test(publishableKey)) {
      throw new Error('Production builds must never include a Supabase service-role/secret key.');
    }

    let parsedSupabaseUrl: URL;
    try {
      parsedSupabaseUrl = new URL(supabaseUrl);
    } catch {
      throw new Error('VITE_SUPABASE_URL must be a valid HTTPS URL.');
    }
    if (parsedSupabaseUrl.protocol !== 'https:') {
      throw new Error('VITE_SUPABASE_URL must use HTTPS in production.');
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('@tanstack/react-query')) {
                return 'vendor-query';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              return 'vendor-other';
            }
          },
        },
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});

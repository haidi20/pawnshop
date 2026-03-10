import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite'; // ← tambahkan loadEnv
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig(({ mode }) => {
  // 🔑 Muat env *secara manual* untuk membaca VITE_MODE_ENV
  // Kita load semua env (prefix '' agar bisa baca VITE_MODE_ENV)
  const env = loadEnv(mode, process.cwd(), '');

  // Tentukan apakah perlu devtools
  const isProduction = env.VITE_MODE_ENV === 'production';
  const plugins = [
    vue(),
    // 🛠 Hanya tambahkan vueDevTools jika bukan production
    ...(isProduction ? [] : [vueDevTools()]),
  ];

    return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
        '@feature': fileURLToPath(new URL('./src/feature', import.meta.url)),
        // Explicit mappings for imports that start with @/core or @/feature
        '@/core': fileURLToPath(new URL('./src/core', import.meta.url)),
        '@/feature': fileURLToPath(new URL('./src/feature', import.meta.url)),
      },
    },
    server: {
      // Bind ke semua interface supaya device lain (Android) bisa mengakses
      host: true,
      port: 3000,
      proxy: {
        '/api/v1': {
          // Jika env.VITE_BASE_URL di-set, proxypass ke sana, kalau tidak gunakan localhost:8000
          target: env.VITE_BASE_URL || 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 1000,
      sourcemap: true,
    }
  };
});

import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

function forbidParentRelativeImportsPlugin(isBuild) {
  return {
    name: 'forbid-parent-relative-imports',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!isBuild || !importer || !source.startsWith('../')) {
        return null;
      }

      const normalizedImporter = importer.replace(/\\/g, '/').replace(/\?.*$/, '');

      if (!normalizedImporter.includes('/src/') || normalizedImporter.includes('/node_modules/')) {
        return null;
      }

      this.error(
        `Build blocked: parent relative import "${source}" is not allowed in "${normalizedImporter}". Use @, @core, or @feature alias.`
      );
    },
  };
}

function strictImportValidationPlugin() {
  return {
    name: 'strict-import-validation',
    async resolveId(source, importer) {
      if (!importer || source.startsWith('\0') || source.includes('node_modules')) {
        return null;
      }

      // Only validate local aliases, relative paths, or src paths
      const isLocal = source.startsWith('.') || source.startsWith('@') || source.startsWith('/src');
      if (!isLocal) {
        return null;
      }

      const resolved = await this.resolve(source, importer, { skipSelf: true });
      if (!resolved) {
        this.error(
          `[Strict Import Error] Could not find the file "${source}" imported from "${importer}". Please ensure the file exists and the path is correct.`
        );
      }

      return null;
    },
  };
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = env.VITE_MODE_ENV === 'production';
  const plugins = [
    strictImportValidationPlugin(),
    forbidParentRelativeImportsPlugin(command === 'build'),
    vue(),
    ...(isProduction ? [] : [vueDevTools()]),
  ];

  return {
    plugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
        '@feature': fileURLToPath(new URL('./src/feature', import.meta.url)),
        '@/core': fileURLToPath(new URL('./src/core', import.meta.url)),
        '@/feature': fileURLToPath(new URL('./src/feature', import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/api/v1': {
          target: env.VITE_BASE_URL || 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      sourcemap: true,
    }
  };
});

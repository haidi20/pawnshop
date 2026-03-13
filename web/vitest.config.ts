import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';

const forbidRelativeImportsPlugin = () => ({
    name: 'forbid-relative-imports-in-tests',
    enforce: 'pre' as const,
    resolveId(source: string, importer: string | undefined) {
        if (
            importer &&
            importer.includes('.spec.') &&
            !importer.includes('syntax.spec.') &&
            source.match(/^\.\.?\//)
        ) {
            throw new Error(
                `\n[Vite/Vitest] Relative imports are strictly forbidden in test files.\n` +
                `Instead of "${source}", please use absolute path aliases (e.g., @feature/..., @core/..., dll).\n` +
                `File: ${importer}\n`
            );
        }
        return null;
    }
});

export default defineConfig({
    plugins: [vue(), forbidRelativeImportsPlugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
            '@feature': fileURLToPath(new URL('./src/feature', import.meta.url)),
            '@/core': fileURLToPath(new URL('./src/core', import.meta.url)),
            '@/feature': fileURLToPath(new URL('./src/feature', import.meta.url))
        }
    },
    test: {
        environment: 'jsdom',
        globals: false,
        include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx', 'src/**/*.spec.js'],
        globalSetup: './vitest.global.ts',
        reporters: 'verbose'
    },
});

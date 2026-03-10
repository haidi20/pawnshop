import { defineConfig } from 'vitest/config';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [vue()],
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
        reporter: 'verbose'
    },
});

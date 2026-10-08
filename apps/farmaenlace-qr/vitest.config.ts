import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { testTimeout: 25000, hookTimeout: 30000, fileParallelism: false }, resolve: { alias: { 'server-only': new URL('./tests/server-only.ts', import.meta.url).pathname } } });

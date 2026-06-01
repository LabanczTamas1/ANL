import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Strip .js → let Vite resolve .ts natively (NodeNext compat)
    alias: [{ find: /^(\.{1,2}\/.*)\.js$/, replacement: '$1' }],
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/domains/**', 'src/utils/**', 'src/middleware/**'],
      exclude: ['**/*.test.ts', '**/routes/**'],
      reporter: ['text', 'lcov'],
    },
    testTimeout: 10000,
    setupFiles: ['src/__tests__/setup.ts'],
  },
});

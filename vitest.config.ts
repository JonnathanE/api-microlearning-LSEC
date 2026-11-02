import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        setupFiles: ['test/setup.ts'],
        // the test files share one database
        fileParallelism: false,
        testTimeout: 15000,
        hookTimeout: 15000,
        coverage: {
            include: ['src/**'],
        },
    },
});

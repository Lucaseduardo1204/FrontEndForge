import { defineConfig } from 'vitest/config';

// Integration tests render whole pages (router + real content); the 5 s default is too
// tight on a busy machine and caused timeouts unrelated to the code under test.
export default defineConfig({
  test: {
    testTimeout: 20_000,
  },
});

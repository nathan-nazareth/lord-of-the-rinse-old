import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';

describe('packages/app build', () => {
  it('vite build produces dist/ directory', () => {
    expect(existsSync('dist')).toBe(true);
  });

  it('dist/index.html exists after build', () => {
    expect(existsSync('dist/index.html')).toBe(true);
  });

  it('dist/assets/ contains JS bundle', () => {
    const assetsDir = 'dist/assets';
    expect(existsSync(assetsDir)).toBe(true);
    const files = readdirSync(assetsDir);
    const hasJs = files.some((f) => f.endsWith('.js'));
    expect(hasJs).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('packages/app structure', () => {
  const base = resolve(__dirname, '..', '..');

  it('vite.config.ts exists', () => {
    expect(existsSync(resolve(base, 'vite.config.ts'))).toBe(true);
  });

  it('tsconfig.json exists', () => {
    expect(existsSync(resolve(base, 'tsconfig.json'))).toBe(true);
  });

  it('index.html exists', () => {
    expect(existsSync(resolve(base, 'index.html'))).toBe(true);
  });

  it('src/ directory exists', () => {
    expect(existsSync(resolve(base, 'src'))).toBe(true);
  });

  it('src/components/ exists', () => {
    expect(existsSync(resolve(base, 'src/components'))).toBe(true);
  });

  it('src/routes/ exists', () => {
    expect(existsSync(resolve(base, 'src/routes'))).toBe(true);
  });

  it('public/ directory exists', () => {
    expect(existsSync(resolve(base, 'public'))).toBe(true);
  });

  it('public/logo.png exists', () => {
    expect(existsSync(resolve(base, 'public/logo.png'))).toBe(true);
  });
});

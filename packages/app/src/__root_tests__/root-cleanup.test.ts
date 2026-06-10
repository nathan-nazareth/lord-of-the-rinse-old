import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('root cleanup', () => {
  const root = resolve(__dirname, '..', '..', '..', '..');

  it('root should NOT have src/ directory', () => {
    expect(existsSync(resolve(root, 'src'))).toBe(false);
  });

  it('root should NOT have components/ directory', () => {
    expect(existsSync(resolve(root, 'components'))).toBe(false);
  });

  it('root should NOT have vite.config.ts', () => {
    expect(existsSync(resolve(root, 'vite.config.ts'))).toBe(false);
  });

  it('root should NOT have index.tsx', () => {
    expect(existsSync(resolve(root, 'index.tsx'))).toBe(false);
  });

  it('root should NOT have index.css', () => {
    expect(existsSync(resolve(root, 'index.css'))).toBe(false);
  });

  it('root package.json should still exist', () => {
    expect(existsSync(resolve(root, 'package.json'))).toBe(true);
  });

  it('root bun.lock should still exist', () => {
    expect(existsSync(resolve(root, 'bun.lock'))).toBe(true);
  });

  it('root AGENTS.md should still exist', () => {
    expect(existsSync(resolve(root, 'AGENTS.md'))).toBe(true);
  });
});

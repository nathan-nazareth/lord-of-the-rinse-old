import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('root package.json delegation', () => {
  const rootPkgPath = resolve(__dirname, '../../package.json');

  it('root package.json uses bun run --filter for scripts', () => {
    const content = readFileSync(rootPkgPath, 'utf-8');
    const pkg = JSON.parse(content);
    const scripts = pkg.scripts;

    expect(scripts.dev).toContain('--filter');
    expect(scripts.dev).toContain('@lotr/app');
    expect(scripts.build).toContain('--filter');
    expect(scripts.test).toContain('--filter');
  });
});

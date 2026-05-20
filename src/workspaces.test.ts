import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Bun workspaces', () => {
  const packageJsonPath = resolve(__dirname, '../package.json');

  it('package.json exists at project root', () => {
    expect(existsSync(packageJsonPath)).toBe(true);
  });

  it('package.json declares Bun workspaces with packages/*', () => {
    const content = readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    expect(pkg.workspaces).toEqual(['packages/*']);
  });

  it('packages/ directory exists', () => {
    const packagesPath = resolve(__dirname, '../packages');
    expect(existsSync(packagesPath)).toBe(true);
  });

  it('packages/ is a directory', () => {
    const packagesPath = resolve(__dirname, '../packages');
    const stat = require('node:fs').statSync(packagesPath);
    expect(stat.isDirectory()).toBe(true);
  });
});

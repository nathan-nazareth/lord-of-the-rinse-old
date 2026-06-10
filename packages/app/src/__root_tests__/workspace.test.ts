import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('packages/app workspace', () => {
  const packageJsonPath = resolve(__dirname, '..', '..', 'package.json');

  it('package.json exists in packages/app', () => {
    expect(existsSync(packageJsonPath)).toBe(true);
  });

  it('package.json is valid JSON', () => {
    const content = readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    expect(pkg).toBeDefined();
  });

  it('package.json has required scripts', () => {
    const content = readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    expect(pkg.scripts).toBeDefined();
    expect(pkg.scripts.dev).toBeDefined();
    expect(pkg.scripts.build).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
  });

  it('package.json has correct type module', () => {
    const content = readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    expect(pkg.type).toBe('module');
  });
});

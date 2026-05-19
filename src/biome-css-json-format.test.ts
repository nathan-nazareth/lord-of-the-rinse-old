import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const biomeConfigPath = join(process.cwd(), 'biome.json');
const biomeConfig = JSON.parse(readFileSync(biomeConfigPath, 'utf-8'));

describe('biome.json CSS and JSON formatter configuration', () => {
  it('has css.formatter.enabled set to true', () => {
    expect(biomeConfig.css?.formatter?.enabled).toBe(true);
  });

  it('has css.formatter.indentStyle set to space', () => {
    expect(biomeConfig.css?.formatter?.indentStyle).toBe('space');
  });

  it('has css.formatter.indentWidth set to 2', () => {
    expect(biomeConfig.css?.formatter?.indentWidth).toBe(2);
  });

  it('has json.formatter.enabled set to true', () => {
    expect(biomeConfig.json?.formatter?.enabled).toBe(true);
  });

  it('has json.formatter.indentStyle set to space', () => {
    expect(biomeConfig.json?.formatter?.indentStyle).toBe('space');
  });

  it('has json.formatter.indentWidth set to 2', () => {
    expect(biomeConfig.json?.formatter?.indentWidth).toBe(2);
  });
});

describe('CSS files pass Biome format check', () => {
  it('index.css passes format check', () => {
    const result = execSync('npx biome format index.css', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    expect(result).toContain('No fixes applied');
  });
});

describe('JSON files pass Biome format check', () => {
  const jsonFiles = [
    'tsconfig.json',
    'package.json',
    'metadata.json',
    'public/manifest.webmanifest',
  ];

  for (const file of jsonFiles) {
    it(`${file} passes format check`, () => {
      const result = execSync(`npx biome format ${file}`, {
        encoding: 'utf-8',
        cwd: process.cwd(),
      });
      expect(result).toContain('No fixes applied');
    });
  }
});

describe('Full-project format idempotency', () => {
  it('running format --write twice produces zero diff on second run', () => {
    // First write
    execSync('npx biome format --write .', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });

    // Second write — should report no fixes
    const result = execSync('npx biome format --write .', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    expect(result).toContain('No fixes applied');
  });
});

describe('Lint still passes after CSS/JSON config changes', () => {
  it('npm run lint exits with code 0', () => {
    const result = execSync('npx biome lint .', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
    // Biome exits with code 0 when no lint errors
    expect(result).toBeDefined();
  });
});

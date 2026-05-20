import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('biome.json ignore patterns', () => {
  const biomeConfigPath = join(process.cwd(), 'biome.json');
  const biomeConfig = JSON.parse(readFileSync(biomeConfigPath, 'utf-8'));
  const includes: string[] = biomeConfig.files.includes;

  it('ignores bun.lock', () => {
    expect(includes).toContain('!!bun.lock');
  });

  it('ignores package-lock.json', () => {
    expect(includes).toContain('!!package-lock.json');
  });
});

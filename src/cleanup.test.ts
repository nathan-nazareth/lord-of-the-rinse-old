import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function findFilesWithContent(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFilesWithContent(fullPath, pattern));
    } else if (
      entry.isFile() &&
      /\.(ts|tsx|js|jsx)$/.test(entry.name) &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.test.tsx')
    ) {
      const content = readFileSync(fullPath, 'utf-8');
      if (pattern.test(content)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

describe('react-router-dom cleanup', () => {
  it('has no react-router-dom imports in source files', () => {
    const srcDir = join(process.cwd(), 'src');
    const matches = findFilesWithContent(srcDir, /react-router-dom/);
    expect(matches).toEqual([]);
  });

  it('does not have react-router-dom in package.json dependencies', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
    expect(pkg.dependencies['react-router-dom']).toBeUndefined();
  });

  it('App.tsx does not exist', () => {
    expect(existsSync(join(process.cwd(), 'App.tsx'))).toBe(false);
  });
});

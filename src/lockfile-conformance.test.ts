import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

describe('lockfile conformance', () => {
  it('should not have package-lock.json in root (Suite spec: Bun-only lockfile)', () => {
    const lockfilePath = join(process.cwd(), 'package-lock.json');
    expect(existsSync(lockfilePath)).toBe(false);
  });
});

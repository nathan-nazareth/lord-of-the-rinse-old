import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('icon library migration', () => {
  it(' SoapForm.tsx uses only @tabler/icons-react imports', () => {
    const content = readFileSync(resolve(__dirname, './SoapForm.tsx'), 'utf8');
    const lucideImports = content.match(/from ['"]lucide-react/g);
    expect(
      lucideImports,
      `Found lucide-react imports in SoapForm.tsx: ${lucideImports?.join(', ')}`,
    ).toBeNull();
  });

  it('Cart.tsx uses only @tabler/icons-react imports', () => {
    const content = readFileSync(resolve(__dirname, './Cart.tsx'), 'utf8');
    const lucideImports = content.match(/from ['"]lucide-react/g);
    expect(
      lucideImports,
      `Found lucide-react imports in Cart.tsx: ${lucideImports?.join(', ')}`,
    ).toBeNull();
  });
});

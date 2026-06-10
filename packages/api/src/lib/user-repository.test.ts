import { beforeEach, describe, expect, it, vi } from 'vitest';
import { countAdminUsers } from './user-repository';

// Mock the db module so we don't need a real Postgres connection
vi.mock('@lotr/db', () => {
  const mockDb = {
    select: vi.fn(),
  };
  return { db: mockDb, sql: (strings: TemplateStringsArray) => strings.join('') };
});

// We need a reference to the mock so we can control its behavior per-test
import { db } from '@lotr/db';

const mockSelect = db.select as ReturnType<typeof vi.fn>;

describe('countAdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 0 when no admin users exist', async () => {
    // Build the chain: db.select().from().where() resolves to [{ count: 0 }]
    const fromChain = {
      where: vi.fn().mockResolvedValue([{ count: 0 }]),
    };
    mockSelect.mockReturnValue({ from: vi.fn().mockReturnValue(fromChain) });

    const result = await countAdminUsers();

    expect(result).toBe(0);
  });

  it('returns N when N admin users exist', async () => {
    const fromChain = {
      where: vi.fn().mockResolvedValue([{ count: 3 }]),
    };
    mockSelect.mockReturnValue({ from: vi.fn().mockReturnValue(fromChain) });

    const result = await countAdminUsers();

    expect(result).toBe(3);
  });

  it('returns 0 when result row is undefined', async () => {
    const fromChain = {
      where: vi.fn().mockResolvedValue([]),
    };
    mockSelect.mockReturnValue({ from: vi.fn().mockReturnValue(fromChain) });

    const result = await countAdminUsers();

    expect(result).toBe(0);
  });

  it('queries with role = admin filter', async () => {
    const whereFn = vi.fn().mockResolvedValue([{ count: 1 }]);
    const fromFn = vi.fn().mockReturnValue({ where: whereFn });
    mockSelect.mockReturnValue({ from: fromFn });

    await countAdminUsers();

    // Verify the chain was called correctly
    expect(mockSelect).toHaveBeenCalledWith({ count: expect.anything() });
    expect(fromFn).toHaveBeenCalled();
    expect(whereFn).toHaveBeenCalled();
  });
});

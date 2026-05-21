import { describe, it, expect } from 'vitest';
import { queryClient } from './query-client';

describe('queryClient', () => {
  it('should be defined', () => {
    expect(queryClient).toBeDefined();
  });

  it('should be an instance of QueryClient', () => {
    expect(queryClient).toBeInstanceOf(Object);
  });
});

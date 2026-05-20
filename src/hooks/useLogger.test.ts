import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLogger } from './useLogger';

describe('useLogger', () => {
  it('returns a log function', () => {
    const { result } = renderHook(() => useLogger());
    expect(typeof result.current.log).toBe('function');
  });

  it('log function calls console.log with prefix', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockReturnValue();
    const { result } = renderHook(() => useLogger());
    result.current.log('test message');
    expect(consoleSpy).toHaveBeenCalledWith('[useLogger]', 'test message');
    consoleSpy.mockRestore();
  });

  it('can be used from any component', () => {
    const { result } = renderHook(() => useLogger());
    expect(result.current.log).toBeDefined();
  });
});

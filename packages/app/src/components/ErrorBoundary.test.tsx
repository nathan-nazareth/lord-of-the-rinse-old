import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

const Thrower = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test render error');
  }
  return <div>Rendered successfully</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockReturnValue();
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Child content')).toBeTruthy();
  });

  it('catches render errors and shows fallback UI', () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeTruthy();
  });

  it('calls console.error with error info on catch', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(consoleSpy).toHaveBeenCalled();
    // The ErrorBoundary now forwards render errors through `logError`
    // (which serialises a StructuredError object as JSON), so the call
    // we expect is a single JSON-string argument rather than two
    // separate console args.
    const lastCall = consoleSpy.mock.calls[consoleSpy.mock.calls.length - 1];
    const joined = lastCall.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
    expect(joined).toContain('Test render error');
  });

  it('passes error message to the UI', () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Test render error')).toBeTruthy();
  });

  it('renders a retry button when error occurs', () => {
    render(
      <ErrorBoundary>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeTruthy();
  });
});

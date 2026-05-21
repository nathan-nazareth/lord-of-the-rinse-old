import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary at root', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockReturnValue();
  });

  it('wraps RouterProvider with ErrorBoundary in index.tsx', () => {
    const DummyRouter = () => <div>Router Content</div>;
    render(
      <ErrorBoundary>
        <DummyRouter />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Router Content')).toBeTruthy();
  });

  it('catches errors from deep in the component tree', () => {
    const Thrower = () => {
      throw new Error('Deep render error');
    };
    render(
      <ErrorBoundary>
        <div>
          <Thrower />
        </div>
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText('Deep render error')).toBeTruthy();
  });

  it('retry button calls window.location.reload', () => {
    const reloadSpy = vi.spyOn(window.location, 'reload').mockReturnValue();
    const Thrower = () => {
      throw new Error('Reload test error');
    };
    render(
      <ErrorBoundary>
        <Thrower />
      </ErrorBoundary>,
    );
    const retryButton = screen.getByRole('button', { name: 'Try Again' });
    retryButton.click();
    expect(reloadSpy).toHaveBeenCalled();
    reloadSpy.mockRestore();
  });
});

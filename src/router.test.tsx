import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';

describe('router', () => {
  it('boots with RouterProvider and renders root layout', async () => {
    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(document.querySelector('.apothecary-bg')).not.toBeNull();
    });
  });
});

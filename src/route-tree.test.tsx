import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

describe('generated route tree', () => {
  it('boots with RouterProvider and renders root layout', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
      context: {},
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(document.querySelector('.apothecary-bg')).not.toBeNull();
    });
  });
});

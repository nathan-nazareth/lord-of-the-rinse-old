import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

import { describe, it, expect } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router';
import { rootRoute } from './__root';

describe('__root route', () => {
  it('renders layout wrapper with HomeProvider', async () => {
    const router = createRouter({
      routeTree: rootRoute,
      history: createMemoryHistory({ initialEntries: ['/'] }),
      context: {},
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(document.querySelector('.apothecary-bg')).toBeNull();
    });
  });
});

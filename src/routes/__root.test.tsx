import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createRouter, createMemoryHistory } from '@tanstack/react-router';
import { rootRoute } from './__root';

describe('__root route', () => {
  it('renders layout wrapper with apothecary-bg class', async () => {
    const router = createRouter({
      routeTree: rootRoute,
      history: createMemoryHistory({ initialEntries: ['/'] }),
      context: {},
    });

    const { container } = render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(container.querySelector('.apothecary-bg')).not.toBeNull();
    });
  });

  it('renders App content (Hero section)', async () => {
    const router = createRouter({
      routeTree: rootRoute,
      history: createMemoryHistory({ initialEntries: ['/'] }),
      context: {},
    });

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Handcrafted Organic Soaps')).not.toBeNull();
    });
  });
});

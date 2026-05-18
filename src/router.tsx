import { createRouter, createBrowserHistory } from '@tanstack/react-router';
import { rootRoute } from './routes/__root';

export const router = createRouter({
  routeTree: rootRoute,
  history: createBrowserHistory(),
  context: {},
});

router.urlTree; // prevent unused export error

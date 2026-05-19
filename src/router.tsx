import { createRouter, createBrowserHistory } from '@tanstack/react-router';
import { rootRoute } from './routes/__root';
import { indexRoute } from './routes/index';
import { cartRoute } from './routes/cart';
import { checkoutRoute } from './routes/checkout';
import { confirmationRoute } from './routes/confirmation';

const routeTree = rootRoute.addChildren([indexRoute, cartRoute, checkoutRoute, confirmationRoute]);

export const router = createRouter({
  routeTree,
  history: createBrowserHistory(),
  context: {},
});

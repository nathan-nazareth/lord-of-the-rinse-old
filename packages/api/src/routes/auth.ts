import { Hono } from 'hono';
import { auth } from '../lib/auth';

const authRoutes = new Hono();

// Forward better-auth's responses verbatim so legitimate 401s and
// validation errors keep their original shape instead of being squashed
// into a misleading 500.
authRoutes.on(['POST', 'GET'], '/*', (c) => auth.handler(c.req.raw));

export default authRoutes;

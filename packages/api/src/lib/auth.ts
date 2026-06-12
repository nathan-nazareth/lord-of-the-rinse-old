import { randomBytes } from 'node:crypto';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { db } from '@lotr/db';
import * as schema from '@lotr/db/schema';
import { betterAuth } from 'better-auth';
import { APIError, createAuthMiddleware } from 'better-auth/api';

// better-auth generates a random secret at boot if you don't set one. That
// invalidates all sessions on every restart, so we require an explicit secret
// in production. In non-production we fall back to a random one (with a loud
// warning) so local dev still works without ceremony.
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !BETTER_AUTH_SECRET) {
  throw new Error(
    'BETTER_AUTH_SECRET is required in production. Generate with `openssl rand -base64 32`.',
  );
}

const resolvedSecret = BETTER_AUTH_SECRET ?? randomBytes(32).toString('base64');
if (!BETTER_AUTH_SECRET) {
  console.warn(
    '[auth] BETTER_AUTH_SECRET is not set — generating a random one. Sessions will NOT survive a process restart.',
  );
}

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const auth = betterAuth({
  secret: resolvedSecret,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'customer',
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh session every 1 day
    freshAge: 60 * 60 * 24, // session is fresh if created within 1 day
  },
  trustedOrigins: trustedOrigins.length > 0 ? trustedOrigins : undefined,
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === '/sign-up/email') {
        // The public-facing better-auth signup is for CUSTOMER accounts.
        // Admin provisioning is handled out-of-band (HMAC token + ADMIN_PASSWORD
        // for the operator panel). The previous gate keyed on
        // `countAdminUsers() > 0`, but no public signup ever produces an
        // admin (the `role` additionalField has `defaultValue: 'customer'`),
        // so the count was perpetually zero and the gate never fired.
        // Block all public signups outright to stop anonymous account spam.
        throw new APIError('FORBIDDEN', {
          message:
            'Public sign-up is disabled. Please contact the store owner for an account.',
        });
      }
    }),
  },
});

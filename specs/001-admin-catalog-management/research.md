# Research: Admin Catalog Management

## Storage Decision

**Decision**: Use SQLite via `@libsql/client` (libSQL / Turso driver) for the admin panel data, while keeping PostgreSQL for the existing catalog and orders schema.

**Rationale**: 
- User explicitly requested SQLite
- `@libsql/client` is already in root dependencies
- Drizzle ORM supports libSQL natively via `drizzle-orm/libsql`
- Admin data (products, options, discounts, settings) is low-volume and single-user — ideal for SQLite
- Existing PostgreSQL schema (orders, auth, catalog attributes) stays untouched to avoid migration risk
- `packages/db/` gets a new `sqlite.ts` export for the libSQL client with a separate drizzle instance

**Alternatives Considered**:
1. **Full PostgreSQL** — simplest path, but ignores user requirement
2. **Full SQLite** — requires rewriting all migrations, risk of breaking existing features
3. **Hybrid (SQLite for admin, PG for everything else)** — selected above; minimal blast radius

## Admin Authentication Decision

**Decision**: Simple hardcoded password (3984), stored in an environment variable or config file, validated on the API side via a lightweight middleware — no sessions, no better-auth.

**Rationale**:
- User explicitly specified a numeric password, not a full auth system
- Single admin user — no multi-user needs
- Much simpler than integrating with existing better-auth stack
- Password is checked via a `POST /api/admin/login` endpoint; client stores a token in memory for the session

**Alternatives Considered**:
1. **Existing better-auth** — overkill for single admin with hardcoded password
2. **No auth** — security risk

## Admin Architecture Decision

**Decision**: Reuse existing admin route scaffold (`/admin/`, `/admin/products`, `/admin/options`, `/admin/discounts`) and existing admin types/stores/hooks, augmenting them for the new features rather than rewriting.

**Rationale**: Scaffold is already in place with TanStack Router routes, Zustand store, React Query hooks, and components. The implementation gap is wiring the UI to the SQLite-backed API endpoints.

**Alternatives Considered**:
1. **Rewrite from scratch** — wasteful, existing scaffold already mirrors the spec
2. **New route structure** — unnecessary, existing `/admin/*` routes match the spec tabs

> *Verification completed during triage follow-up.*

## Verification

TanStack Query parent scope is complete via closed children and current tree:

- `@tanstack/react-query` and devtools installed in `packages/app`
- `packages/app/src/lib/query-client.ts` — shared `QueryClient` with defaults
- `packages/app/src/routes/__root.tsx` — `QueryClientProvider` + dev-only `ReactQueryDevtools`
- Child #31 (devtools) already closed

- `bun run lint` — passed
- `bun run test` — passed (181 tests)
- `bun run build` — passed

Closes #29, #30.

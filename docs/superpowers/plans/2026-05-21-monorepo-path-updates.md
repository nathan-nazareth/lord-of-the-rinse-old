# Monorepo Path Updates - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update all import paths in the codebase from root-level imports to `packages/app`-relative paths, and verify the monorepo build succeeds.

**Architecture:** Bun workspaces monorepo with source in `packages/app/`. All paths must be updated so the app works when served from `packages/app/` instead of root.

**Tech Stack:** Bun, Vite, TypeScript, Biome

---

## File Structure

```
Root
├── package.json              # workspace root (already has "packages/*")
├── packages/
│   └── app/                   # ← everything moves here
│       ├── package.json       # workspace package
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── src/               # current ./src/
│       ├── components/        # current ./components/
│       ├── specs/             # current ./specs/
│       └── ...                # all root-level files except package.json, bun.lock, node_modules, .git
```

---

## Tasks

### Task 1: Create packages/app/package.json

**Files:**
- Create: `packages/app/package.json`

- [ ] **Step 1: Write packages/app/package.json**

```json
{
  "name": "@organic-soap/app",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "format:check": "biome format .",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "test:ui": "playwright test --ui",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@libsql/client": "^0.17.3",
    "@tabler/icons-react": "^3.44.0",
    "@tanstack/react-query": "^5.100.11",
    "@tanstack/react-query-devtools": "^5.100.11",
    "@tanstack/react-router": "^1.170.4",
    "@tanstack/router-vite-plugin": "^1.167.6",
    "lucide-react": "^0.562.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "zustand": "^5.0.13"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.15",
    "@playwright/test": "^1.57.0",
    "@tailwindcss/postcss": "^4.1.18",
    "@testing-library/react": "^16.3.2",
    "@types/node": "^22.14.0",
    "@types/react": "^19.2.14",
    "@vitejs/plugin-react": "^5.0.0",
    "@vitest/coverage-v8": "^4.1.6",
    "autoprefixer": "^10.4.23",
    "happy-dom": "^20.9.0",
    "jsdom": "^29.1.1",
    "playwright": "^1.57.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^4.1.18",
    "typescript": "~5.8.2",
    "vite": "^6.2.0",
    "vite-plugin-pwa": "^0.21.2",
    "vitest": "^4.1.6"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/app/package.json
git commit -m "chore: create packages/app workspace package"
```

---

### Task 2: Move source files to packages/app

**Files:**
- Create: `packages/app/vite.config.ts`
- Create: `packages/app/tsconfig.json`
- Create: `packages/app/postcss.config.js`
- Create: `packages/app/biome.json`
- Create: `packages/app/playwright.config.ts`
- Create: `packages/app/vitest.config.ts`
- Create: `packages/app/index.html`
- Create: `packages/app/index.tsx`
- Create: `packages/app/types.ts`
- Create: `packages/app/tailwind.config.js`
- Create: `packages/app/package.json` (already created in Task 1)
- Create: `packages/app/src/` (all contents of `./src/`)
- Create: `packages/app/components/` (all contents of `./components/`)
- Create: `packages/app/specs/` (all contents of `./specs/`)
- Create: `packages/app/public/` (all contents of `./public/`)
- Create: `packages/app/tests/` (all contents of `./tests/`)
- Create: `packages/app/.env.example`
- Create: `packages/app/.gitignore`
- Modify: root `package.json` (remove duplicated deps — keep root workspace scripts for running app from packages/app)

- [ ] **Step 1: Copy all source files to packages/app/**

```bash
mkdir -p packages/app/public packages/app/tests

cp vite.config.ts packages/app/
cp tsconfig.json packages/app/
cp postcss.config.js packages/app/
cp biome.json packages/app/
cp playwright.config.ts packages/app/
cp vitest.config.ts packages/app/
cp index.html packages/app/
cp index.tsx packages/app/
cp types.ts packages/app/
cp tailwind.config.js packages/app/
cp .env.example packages/app/

cp -r src/* packages/app/src/
cp -r components/* packages/app/components/
cp -r specs/* packages/app/specs/
cp -r public/* packages/app/public/
cp -r tests/* packages/app/tests/
```

- [ ] **Step 2: Update vite.config.ts base path**

Edit `packages/app/vite.config.ts` line 11: change `port: 3000` if needed (or keep as-is for now).

The file should remain identical since the alias `@` resolution uses `__dirname`.

- [ ] **Step 3: Verify copied files exist**

```bash
ls packages/app/
ls packages/app/src/components/
ls packages/app/src/routes/
```

Expected: all files present

- [ ] **Step 4: Commit**

```bash
git add packages/app/
git commit -m "chore: move application into packages/app"
```

---

### Task 3: Update root package.json to run app from packages/app

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update root package.json scripts to delegate to packages/app**

Replace the `scripts` section with:

```json
{
  "scripts": {
    "dev": "bun --filter @organic-soap/app run dev",
    "build": "bun --filter @organic-soap/app run build",
    "preview": "bun --filter @organic-soap/app run preview",
    "lint": "bun --filter @organic-soap/app run lint",
    "format": "bun --filter @organic-soap/app run format",
    "format:check": "bun --filter @organic-soap/app run format:check",
    "test": "bun --filter @organic-soap/app run test",
    "test:e2e": "bun --filter @organic-soap/app run test:e2e",
    "test:ui": "bun --filter @organic-soap/app run test:ui",
    "test:watch": "bun --filter @organic-soap/app run test:watch",
    "test:coverage": "bun --filter @organic-soap/app run test:coverage"
  }
}
```

- [ ] **Step 2: Run bun install to ensure workspace links work**

```bash
bun install
```

Expected: no errors, `@organic-soap/app` workspace is recognized

- [ ] **Step 3: Verify dev server starts**

```bash
timeout 10 bun run dev 2>&1 || true
```

Expected: Vite starts on port 3000 without errors

- [ ] **Step 4: Commit**

```bash
git add package.json
git commit -m "chore: delegate scripts to packages/app workspace"
```

---

### Task 4: Verify build succeeds

**Files:**
- (No file changes — verification only)

- [ ] **Step 1: Run production build**

```bash
bun run build
```

Expected: `dist/` created inside `packages/app/` (not at root)

- [ ] **Step 2: Verify dist/ output location**

```bash
ls packages/app/dist/
```

Expected: contains index.html and assets

- [ ] **Step 3: Commit**

```bash
git add packages/app/dist/ # if tracked, or ignore
git commit -m "chore: verify monorepo build succeeds"
```

---

### Task 5: Verify no broken imports

**Files:**
- (No file changes — verification only)

- [ ] **Step 1: Run lint check**

```bash
cd packages/app && bun run lint .
```

Expected: no errors

- [ ] **Step 2: Run tests**

```bash
cd packages/app && bun run test
```

Expected: all tests pass

- [ ] **Step 3: Commit any lint fixes if needed**

---

### Task 6: Clean up root-level leftover files

**Files:**
- Remove: `src/` (original, now in packages/app)
- Remove: `components/` (original, now in packages/app)
- Remove: `specs/` (original, now in packages/app)
- Remove: `public/` (original, now in packages/app)
- Remove: `tests/` (original, now in packages/app)
- Remove: `vite.config.ts`
- Remove: `tsconfig.json`
- Remove: `postcss.config.js`
- Remove: `biome.json`
- Remove: `playwright.config.ts`
- Remove: `vitest.config.ts`
- Remove: `index.html`
- Remove: `index.tsx`
- Remove: `types.ts`
- Remove: `tailwind.config.js`
- Remove: `.env.example`
- Keep: `package.json` (root workspace)
- Keep: `bun.lock` (root workspace)
- Keep: `node_modules/` (root workspace)
- Keep: `AGENTS.md`, `CLAUDE.md`, `README.md`

- [ ] **Step 1: Remove old files**

```bash
rm -rf src/ components/ specs/ public/ tests/
rm -f vite.config.ts tsconfig.json postcss.config.js biome.json
rm -f playwright.config.ts vitest.config.ts index.html
rm -f index.tsx types.ts tailwind.config.js .env.example
```

- [ ] **Step 2: Verify root structure is clean**

```bash
ls -la
```

Expected: only root workspace files remain (package.json, bun.lock, node_modules, AGENTS.md, CLAUDE.md, README.md, .git/, docs/, .opencode/, .tanstack/, .specify/, coverage/)

- [ ] **Step 3: Run build from root to confirm everything works**

```bash
bun run build
```

Expected: builds from packages/app

- [ ] **Step 4: Commit cleanup**

```bash
git add -A && git commit -m "chore: remove legacy root files, source now in packages/app"
```

---

## Verification Checklist

After all tasks:

- [ ] `bun run dev` starts Vite on port 3000
- [ ] `bun run build` produces `packages/app/dist/`
- [ ] `bun run lint` passes with no errors
- [ ] `bun run test` passes all tests
- [ ] `bun run test:e2e` runs Playwright tests
- [ ] No import paths reference `../src` or `../components` from inside packages/app
- [ ] `tsconfig.json` path aliases (`@/*`) resolve correctly from packages/app

---

## Notes

- The `@` alias in vite.config.ts uses `path.resolve(__dirname, '.')` which will correctly resolve to `packages/app/` when the app is in that location.
- TanStack Router plugin generates routes in `src/routes/` — path is already relative, should work.
- The `vitest.config.ts` `@/*` alias needs to resolve to `packages/app/` root — verify after move.
- Keep `.env.example` in `packages/app/` — apps should have their own env vars.
- No `.gitignore` needed at root for app files anymore (they're in packages/app).
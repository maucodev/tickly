# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Full-stack TypeScript monorepo managed as Bun workspaces (`client`, `server`), no shared package between them. All source and UI text must be written in English.

## Tech stack

- **Runtime / package manager / bundler (server)**: Bun `1.3.x`
- **Server**: Express `^5.1.0`, `cors` `^2.8.5`
- **Database**: PostgreSQL via Prisma ORM `^7.8.0`, connected through `@prisma/adapter-pg` (driver adapter, not the schema's `datasource.url`) + `pg`
- **Client**: React `^19.2.7`, Vite `^8.1.1` (bundles via Rolldown), `@vitejs/plugin-react` `^6.0.3`
- **Language**: TypeScript `~6.0.2` (client; type-checking only, no emit) — server has no separate `typescript` dependency, Bun executes `.ts` directly
- **Linting**: oxlint `^1.71.0` (client only)

## Commands

Run from the repo root unless noted. All package managers, runtimes, and executors are Bun — do not use npm/yarn/pnpm/node.

```bash
bun install                # install deps for all workspaces (run after editing any package.json)

bun run dev:server         # start Express with --watch (localhost:3001)
bun run dev:client         # start Vite dev server via `bunx --bun vite` (localhost:5173, proxies /api -> :3001)

bun run build:server       # bun build server/src/index.ts -> server/dist (target: bun)
bun run build:client       # tsc -b && vite build, from client/

bun run --cwd client lint  # oxlint (client only; no lint script on server or root)

bun run --cwd server db:generate  # prisma generate -> server/generated/prisma (no DB connection needed)
bun run --cwd server db:migrate   # prisma migrate dev (requires a reachable DATABASE_URL)
bun run --cwd server db:studio    # prisma studio
```

To target a single workspace directly instead of using the root scripts, use `bun run --cwd <client|server> <script>` or `bun run --filter <name> <script>`.

There is no test runner configured in either workspace yet.

## Architecture

- **`server/`** — Express 5 app (`src/index.ts`, single file). Runs directly as TypeScript via `bun run --watch`, no separate transpile step in dev. `bun build` only bundles for production (`build` script), emitting to `server/dist`, targeting the `bun` runtime. API routes are expected under `/api/*`. `tsconfig.json` uses `noEmit: true` with `"types": ["bun"]` — Bun itself executes the TS, tsc is type-checking only.
- **`client/`** — Standard Vite + React 19 + TypeScript app (scaffolded via `bun create vite`, template `react-ts`). Dev server is invoked as `bunx --bun vite` (not the `vite` package.json dev-dependency binary directly) so Bun's runtime is used instead of Node.
- **Client ↔ server wiring**: `client/vite.config.ts` proxies `/api` to `http://localhost:3001`. Both dev servers must be running (`dev:server` and `dev:client`) for the client to reach the API; there is no combined "run everything" script.
- **Workspaces**: root `package.json` declares `"workspaces": ["client", "server"]` and only holds pass-through scripts (`dev:*`, `build:*`) that delegate into each workspace via `--cwd`. There is a single root `bun.lock` for both workspaces — always run `bun install` from the root, not inside `client/` or `server/`.
- **Linting**: only `client` has oxlint configured (`.oxlintrc.json`, plugins: react/typescript/oxc). `server` has no linter set up.
- **Database wiring**: `server/prisma/schema.prisma` declares the `postgresql` datasource and generator (client output: `server/generated/prisma`, gitignored). The actual connection is created in `server/src/lib/prisma.ts`, which builds a `PrismaPg` adapter from `DATABASE_URL` and exports a singleton `PrismaClient` (cached on `globalThis` outside production to survive `--watch` reloads). `server/prisma.config.ts` (used by the `prisma` CLI, e.g. `db:migrate`) reads the same `DATABASE_URL`. The env var lives in `server/.env` (gitignored) and must point at a database named `helpdesk`; `GET /api/db-health` in `server/src/index.ts` runs `SELECT 1` through Prisma to verify connectivity. No models are defined yet — add them to `schema.prisma` and run `db:migrate` to create tables.

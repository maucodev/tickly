# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Tickly** is a full-stack TypeScript monorepo managed as Bun workspaces (`client`, `server`), no shared package between them. All source and UI text must be written in English.

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
bun run --cwd server db:seed      # runs scripts/seed-admin.ts (requires ADMIN_EMAIL and ADMIN_PASSWORD in server/.env)
```

To target a single workspace directly instead of using the root scripts, use `bun run --cwd <client|server> <script>` or `bun run --filter <name> <script>`.

There is no test runner configured in either workspace yet.

## Architecture

- **`server/`** — Express 5 app (`src/index.ts`, single file). Runs directly as TypeScript via `bun run --watch`, no separate transpile step in dev. `bun build` only bundles for production (`build` script), emitting to `server/dist`, targeting the `bun` runtime. API routes are expected under `/api/*`. `tsconfig.json` uses `noEmit: true` with `"types": ["bun"]` — Bun itself executes the TS, tsc is type-checking only.
- **`client/`** — Standard Vite + React 19 + TypeScript app (scaffolded via `bun create vite`, template `react-ts`). Dev server is invoked as `bunx --bun vite` (not the `vite` package.json dev-dependency binary directly) so Bun's runtime is used instead of Node.
- **Client ↔ server wiring**: `client/vite.config.ts` proxies `/api` to `http://localhost:3001`. Both dev servers must be running (`dev:server` and `dev:client`) for the client to reach the API; there is no combined "run everything" script.
- **Workspaces**: root `package.json` declares `"workspaces": ["client", "server"]` and only holds pass-through scripts (`dev:*`, `build:*`) that delegate into each workspace via `--cwd`. There is a single root `bun.lock` for both workspaces — always run `bun install` from the root, not inside `client/` or `server/`.
- **Linting**: only `client` has oxlint configured (`.oxlintrc.json`, plugins: react/typescript/oxc). `server` has no linter set up.
- **UI components (`client`)**: shadcn/ui is installed (`client/components.json`, registry-based CLI v4+) using the **nova** preset (`style: "base-nova"`, `baseColor: "neutral"`, `iconLibrary: "lucide"`, `font: "geist"`). Add components from `client/` with `bunx --bun shadcn@latest add <name> -y`. This registry version replaced the classic `Form`/`FormField`/`FormMessage` components with `Field`/`FieldLabel`/`FieldError` (`client/src/components/ui/field.tsx`), used together with react-hook-form's `Controller` directly — not the older shadcn Form pattern. Path alias `@/*` → `client/src/*` is wired in `vite.config.ts`, `tsconfig.json`, and `tsconfig.app.json` via `paths` only (no `baseUrl`, which is deprecated under this repo's TypeScript `~6.0.2`).
- **Database wiring**: `server/prisma/schema.prisma` declares the `postgresql` datasource and generator (client output: `server/generated/prisma`, gitignored). The actual connection is created in `server/src/lib/prisma.ts`, which builds a `PrismaPg` adapter from `DATABASE_URL` and exports a singleton `PrismaClient` (cached on `globalThis` outside production to survive `--watch` reloads). `server/prisma.config.ts` (used by the `prisma` CLI, e.g. `db:migrate`) reads the same `DATABASE_URL`. The env var lives in `server/.env` (gitignored) and must point at a database named `helpdesk`; `GET /api/db-health` in `server/src/index.ts` runs `SELECT 1` through Prisma to verify connectivity. Models: `User` (with a `Role` enum — `admin` | `agent`, default `agent`), `Session`, `Account`, `Verification` — this is the standard Better Auth schema plus the app-specific `role` field on `User`; add further domain models to `schema.prisma` and run `db:migrate` to create tables.
- **Authentication**: [Better Auth](https://www.better-auth.com/) (`better-auth` on both workspaces), email/password only, no self-service registration (`emailAndPassword.disableSignUp: true` in `server/src/lib/auth.ts`) — users only get created via the seed script or directly in the DB. Config adds a `role` additional field on `user` (`admin`/`agent`, not settable from the client). Reads `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CLIENT_URL` (for `trustedOrigins`) from `server/.env` (see `server/.env.example`). `server/src/index.ts` mounts `/api/auth/*` to `toNodeHandler(auth)` **before** `express.json()` is registered — Better Auth parses its own request body. On the client, `client/src/lib/auth-client.ts` creates the `better-auth/react` client (no explicit `baseURL`, relies on the Vite `/api` proxy) with the `inferAdditionalFields` plugin (`better-auth/client/plugins`, schema declared manually since client and server share no package) so custom fields like `role` are typed on `useSession()`'s `user` — needed any time a server-side `additionalFields` entry must be read on the client. Route-level access control (`App.tsx`): `ProtectedLayout` requires a session, redirecting to `/login` otherwise; `AdminRoute` (nested inside it) additionally requires `role === 'admin'`, redirecting to `/` otherwise — reuse this pair for any new page, adding `AdminRoute` only when the page must be admin-only. `server/scripts/seed-admin.ts` (`bun run --cwd server db:seed`) creates the first `admin` user from `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `server/.env` — the only bootstrap path since sign-up is disabled. Note: those two vars are required for seeding but **not** currently listed in `server/.env.example` — add them there when touching that file.
- **Client routing**: `react-router-dom` v7, `BrowserRouter` set up in `main.tsx`, routes declared in `App.tsx`. `/login` is public; every other route nests under `ProtectedLayout`, with admin-only routes additionally nested under `AdminRoute` (see Authentication bullet). `*` redirects to `/`. Pages live in `client/src/pages/*Page.tsx`; shared components in `client/src/components/` (`ui/` is shadcn-managed — see below — everything else, e.g. `NavBar.tsx`, `ProtectedLayout.tsx`, `AdminRoute.tsx`, is hand-written). `NavBar` is rendered by `ProtectedLayout`, so present on every authenticated page, and receives the session `user` (including `role`) as a prop to conditionally show admin-only nav links.
- **Client form validation**: `react-hook-form` + `zod` via `@hookform/resolvers/zod`, e.g. `LoginPage`'s `loginSchema`. Forms use `useForm({ resolver: zodResolver(schema) })` and wire individual fields with react-hook-form's `Controller` render prop into shadcn's `Field`/`FieldLabel`/`FieldError` (see the shadcn/ui bullet above) rather than plain `register()` + manual error markup.

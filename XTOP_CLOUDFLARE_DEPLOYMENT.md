# XTOP Video Studio — Cloudflare Workers deployment

This guide is for the `xtop-social-studio-editor` branch. Keep `main` unchanged until the app has passed build and browser acceptance tests.

## Current deployment architecture

- Next.js 16 app in `apps/web`.
- Bun 1.2.18 workspaces, with the lockfile at repository root.
- Existing Cloudflare adapter: `@opennextjs/cloudflare`.
- Worker configuration: `apps/web/wrangler.jsonc`.
- Worker name: `xtop-video-studio`.
- PostgreSQL is required by Drizzle and Better Auth.
- Upstash Redis REST is required by Better Auth rate-limit storage and request rate limiting.

This is a full-stack Worker, not a static Pages upload.

## Workers Builds settings

Connect repository `erodion4776/opencut-classic` and select production branch `xtop-social-studio-editor`.

Use repository root `/` so Bun can see the root workspace manifest and `bun.lock`.

- Build command: `cd apps/web && bunx opennextjs-cloudflare build`
- Deploy command: `cd apps/web && bunx opennextjs-cloudflare deploy`
- Preview builds: keep disabled until production configuration and preview runtime secrets are configured.
- Do not use `next build` alone as the Cloudflare build command. OpenNext must transform the Next.js output for Workers.
- Do not use the package's combined `bun run deploy` as both the build and deploy command in Workers Builds; the dashboard separates these two phases.

The repository's `apps/web/package.json` pins the OpenNext adapter and Wrangler as dependencies. Workers Builds should install dependencies using the root Bun workspace configuration.

## Runtime variables and secrets

Set these on the Worker under Settings → Variables and Secrets (production runtime), not only as build variables. Never commit real values to Git.

Required by `apps/web/src/env/web.ts`:

| Name | Type | Requirement |
| --- | --- | --- |
| `NODE_ENV` | Variable | Set to `production` |
| `NEXT_PUBLIC_SITE_URL` | Variable | Final HTTPS Worker/custom-domain URL |
| `NEXT_PUBLIC_MARBLE_API_URL` | Variable | Valid HTTPS Marble API URL |
| `DATABASE_URL` | Secret | PostgreSQL connection URL |
| `BETTER_AUTH_SECRET` | Secret | Long random secret, at least 32 bytes |
| `UPSTASH_REDIS_REST_URL` | Variable | Upstash Redis REST HTTPS URL |
| `UPSTASH_REDIS_REST_TOKEN` | Secret | Upstash Redis REST token |
| `MARBLE_WORKSPACE_KEY` | Secret | Valid Marble workspace key |
| `FREESOUND_CLIENT_ID` | Secret/variable | Freesound API client ID |
| `FREESOUND_API_KEY` | Secret | Freesound API key |

Important: the current Zod environment schema requires all of these values at startup, even if a related integration is not being used. Do not insert example strings or fake keys. Obtain valid credentials or deliberately change the app's environment schema and integration handling in a separate reviewed commit before deploying.

## Database and Redis preparation

1. Provision a managed PostgreSQL database with TLS and a Workers-compatible connection path. Review Cloudflare Hyperdrive or the selected database provider's Workers instructions before using a direct connection string.
2. Provision an Upstash Redis database and copy its REST URL and token.
3. Apply the app's Drizzle migrations using the production database URL from a secure local environment. Do not run schema push against production as an unreviewed shortcut.
4. Confirm the database and Redis can be reached by the deployed Worker.

The repository currently does not contain a verified production database migration run or an end-to-end Workers compatibility test.

## First deployment and verification

1. Confirm the selected production branch is `xtop-social-studio-editor`.
2. Add all runtime variables/secrets above.
3. Configure the Workers Builds build and deploy commands exactly as listed.
4. Trigger a build only after valid credentials and database migrations are ready.
5. Check the build logs and Worker URL.
6. Test sign-up/login, project creation, media import, editing, save/reopen, and export on Android Chrome and desktop.
7. Do not announce production readiness until these checks pass.

## Known limitations

- No production build, Cloudflare preview, or production deployment has been verified yet.
- No production PostgreSQL or Upstash Redis instance has been provisioned by this repository change.
- Database migration and Cloudflare runtime compatibility still need verification.
- The app's required Marble and Freesound credentials must be supplied or their integrations must be made optional intentionally.
- Keep secrets out of GitHub files, screenshots, chat messages, and build logs.

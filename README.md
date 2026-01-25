# Ansiversa Portfolio Creator

Portfolio Creator is an Ansiversa mini-app that lets users build, edit, and publish personal portfolios with a clean public page.

## Freeze status

Portfolio Creator v1 (frozen requirements).

## Quick start

1) Install dependencies

```
npm ci
```

2) Configure env vars (see `src/env.d.ts` for the full list)

- `ANSIVERSA_AUTH_SECRET`
- `ANSIVERSA_SESSION_SECRET`
- `ANSIVERSA_COOKIE_DOMAIN`
- `PUBLIC_ROOT_APP_URL` (optional)
- `PARENT_APP_URL` (optional)

Note: `ANSIVERSA_AUTH_SECRET` is reserved for future auth workflows (not used in this app yet).

3) Run the app

```
npm run dev
```

## Local dev without parent app

If you do not have the parent app session cookie, you can enable a DEV-only auth bypass
 to inject a dummy session during local development:

```
DEV_BYPASS_AUTH=true npm run dev
```

Optional overrides (defaults shown):

```
DEV_BYPASS_USER_ID=dev-user
DEV_BYPASS_EMAIL=dev@local
DEV_BYPASS_ROLE_ID=1
```

⚠️ This bypass only works in local development (import.meta.env.DEV) and is ignored in
production builds.

## First run checklist

You should be able to:

- Start the app with `npm run dev`
- Open `/app/portfolios` and create a new portfolio
- Open `/app/portfolios/[id]` to edit sections with the drawer workflow
- Publish the portfolio and access the public route at `/<slug>`

If this works, your setup is correct.

## Commands

- `npm run dev`
- `npm run typecheck` (Astro check)
- `npm run build`
- `npm run db:push`

## Database workflow (standard)

This app intentionally uses file-based remote DB locally for consistency.
`npm run dev` and `npm run build` run in `--remote` mode against `.astro/content.db`.
Use `npm run db:push` as the single schema push command.

---

Ansiversa motto: Make it simple — but not simpler.

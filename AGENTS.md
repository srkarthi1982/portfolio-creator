⚠️ Mandatory: AI agents must read this file before writing or modifying any code in the portfolio-creator repo.

# AGENTS.md
## Portfolio Creator Repo – Session Notes (Codex)

This file records what was built/changed so far for the portfolio-creator repo. Read first.

---

## 1. Bootstrap (Required)

- 2026-01-25 Created repo AGENTS.md per workspace rule.
- 2026-01-25 Backed up original portfolio-creator repo to `Portfolio-creator-backup/`.
- 2026-01-25 Flushed updated AppStarter into portfolio-creator without touching `.git`.
- 2026-01-25 Verified AppStarter in portfolio-creator: `npm ci`, `npm run typecheck`, `npm run build --remote`; dev server ran on `http://localhost:4322/` with `/` and `/items` loading (DEV_BYPASS_AUTH enabled).

## 2. Portfolio Creator V1 (In progress)

- 2026-02-01 Added `/help` page and wired Help link into the mini-app menu.
- 2026-02-01 Verified Portfolio Creator Pro gating: UI disabled/pro badges correct, server guards return PAYMENT_REQUIRED, delete remains allowed; access control locked and aligned with Quiz + Resume Builder.
- 2026-02-01 Removed "Use this layout" buttons from landing page layout cards (V1 simplification).
- 2026-02-01 Added Pro gating for templates 3/4 (UI disabled + Pro badge + pricing CTA) and server-side PAYMENT_REQUIRED guards across portfolio actions (create/edit/preview/publish/mutate). Delete remains allowed for free users. Template keys normalized to classic/gallery/minimal/story.
- 2026-01-31 Normalized payment fields in `Astro.locals.user` to avoid undefined values (stripeCustomerId/plan/planStatus/isPaid/renewalAt).
- 2026-01-31 Added locals.session payment flags in middleware/types and a temporary `/admin/session` debug page for Phase 2 verification.
- 2026-01-30 Rebuilt landing page to match Resume Builder structure with portfolio-specific copy and layout sections.
- 2026-01-29 Added parent notification helper and wired portfolio create/publish/update notifications.

- 2026-01-28 Added local ASTRO_DB_REMOTE_URL in .env to prevent ActionsCantBeLoaded invalid URL in dev.
- 2026-01-28 Bumped @ansiversa/components to ^0.0.119 for WebLayout mini-app links.
- 2026-01-28 Added portfolio-creator mini-app links (Home, Portfolios) via AppShell props for AvMiniAppBar.
- 2026-01-28 Added local/remote dev+build scripts for dual DB mode support.
- 2026-01-28 Ran `npm run db:push` with remote envs to recreate portfolio-creator tables on remote DB.
- 2026-01-27 Bumped @ansiversa/components to ^0.0.118 and enabled AvMiniAppBar via APP_KEY in AppShell.
- 2026-01-25 Implemented Portfolio Creator v1 structure: DB tables `PortfolioProject`, `PortfolioSection`, `PortfolioItem`, plus actions, store, and routes.
- 2026-01-25 Routes added: `/app/portfolios`, `/app/portfolios/[id]`, `/app/portfolios/[id]/preview`, and public `/<slug>` with publish/visibility rules (unlisted adds noindex).
- 2026-01-25 Dashboard push + summary v1: appId `portfolio-creator`, webhook target `/api/webhooks/portfolio-creator-activity.json`.
- 2026-01-25 Summary JSON fields: version, totalPortfolios, publishedCount, lastUpdatedAt, visibilityBreakdown, completionHint.
- 2026-01-25 Tests: `npm run db:push` (file-based remote DB), `npm run typecheck`, `npm run build --remote`; dev server on `http://localhost:4322/` with `/` and `/app/portfolios` loading; sample public slug returned 404 as expected.
- 2026-01-25 Backed up `.astro/content.db` to `.astro/content.db.bak-20260125-1235` before schema push.
- 2026-01-25 Verified webhook live: POST to `http://localhost:4322/api/webhooks/portfolio-creator-activity.json` returned 204 and Dashboard row updated for appId `portfolio-creator` (userId `2e3633d2-47bd-4885-acb2-24a0fa454f70`, summaryVersion 1).
- 2026-01-26 Fixed Astro DB scripts overriding remote envs by removing hardcoded ASTRO_DB_REMOTE_URL; added .env.example guidance and ignored .env.local/.env.*.local so Vercel uses env vars.
- 2026-01-26 Bumped @ansiversa/components to ^0.0.117 to align with latest resume schema (declaration field).

## Verification Log

- 2026-02-01 `npm run typecheck` (pass; 1 hint in baseRepository).
- 2026-02-01 `npm run build` (pass).
- 2026-02-01 Pending manual check: free user sees templates 3/4 disabled + Pro badge; direct preview/publish returns PAYMENT_REQUIRED; delete allowed. Paid user can use all templates.
- 2026-01-31 Pending manual check: paid user sees non-null fields; free user sees null/false in `Astro.locals.user`.
- 2026-01-31 Pending manual check: `/admin/session` shows isPaid true for paid user and false for free user.
- 2026-01-29 `npm run typecheck` (pass; 1 hint in baseRepository).
- 2026-01-29 `npm run build` (pass).
- 2026-01-29 Smoke test: not run (manual create/publish portfolio).

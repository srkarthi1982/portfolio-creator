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

- 2026-01-25 Implemented Portfolio Creator v1 structure: DB tables `PortfolioProject`, `PortfolioSection`, `PortfolioItem`, plus actions, store, and routes.
- 2026-01-25 Routes added: `/app/portfolios`, `/app/portfolios/[id]`, `/app/portfolios/[id]/preview`, and public `/<slug>` with publish/visibility rules (unlisted adds noindex).
- 2026-01-25 Dashboard push + summary v1: appId `portfolio-creator`, webhook target `/api/webhooks/portfolio-creator-activity.json`.
- 2026-01-25 Summary JSON fields: version, totalPortfolios, publishedCount, lastUpdatedAt, visibilityBreakdown, completionHint.
- 2026-01-25 Tests: `npm run db:push` (file-based remote DB), `npm run typecheck`, `npm run build --remote`; dev server on `http://localhost:4322/` with `/` and `/app/portfolios` loading; sample public slug returned 404 as expected.
- 2026-01-25 Backed up `.astro/content.db` to `.astro/content.db.bak-20260125-1235` before schema push.

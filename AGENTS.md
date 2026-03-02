⚠️ Mandatory: AI agents must read this file before writing or modifying any code.

MANDATORY: After completing each task, update this repo’s AGENTS.md Task Log (newest-first) before marking the task done.
This file complements the workspace-level Ansiversa-workspace/AGENTS.md (source of truth). Read workspace first.

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

- 2026-02-08 Final standards polish: removed remaining raw utility classes from `src/pages/app/portfolios/index.astro` and `src/pages/app/portfolios/[id].astro` by introducing `av-portfolio-*` classes in `src/styles/global.css` (`av-portfolio-template-grid`, `av-portfolio-template-card`, `av-portfolio-date-grid`).
- 2026-02-08 Replaced inline style in `src/pages/app/portfolios/[id]/preview.astro` with `av-portfolio-preview-cta` class.
- 2026-02-08 Enforced Ansiversa Standard B hardening pass: removed page-scoped `<style>` blocks from `src/pages/index.astro`, `src/pages/app/portfolios/index.astro`, and `src/pages/app/portfolios/[id].astro`; moved these pages to Av component/utility-driven structure only.
- 2026-02-08 Added `src/modules/portfolio-creator/constraints.ts` as single source of truth for form limits and year/month options.
- 2026-02-08 Hardened action validation in `src/actions/portfolioCreator.ts`: replaced permissive payload handling with section-key-aware sanitization/validation, added URL/email normalization, trimmed/deduped list fields, and chronology validation for structured dates.
- 2026-02-08 Fixed create item ordering collision in `createItem` by switching from `count + 1` to `max(order) + 1`.
- 2026-02-08 Removed admin debug route `src/pages/admin/session.astro` and simplified middleware protection to `/app/*` only.
- 2026-02-08 Updated editor/store to structured date fields, client-side clamps, counters, present-toggle/date guards, and section constraints wiring.
- 2026-02-08 Updated `src/modules/portfolio-creator/helpers.ts` to support structured date formatting with legacy fallback mapping.
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

- 2026-02-10 `npm run typecheck` (pass; 0 errors, 0 warnings, existing baseRepository hint remains) after migrating public/preview rendering to `@ansiversa/components` portfolio templates.
- 2026-02-10 `npm run build` (pass; astro build --remote complete) after package template integration and public output refactor.
- 2026-02-10 `npm install @ansiversa/components@^0.0.126` (updated dependency to consume published package templates and resolver).
- 2026-02-10 Static route parity checks by code inspection: `src/pages/[slug].astro` and `src/pages/app/portfolios/[id]/preview.astro` now resolve/render package templates via `resolvePortfolioPublicTemplate(themeKey)` and no longer render local `PortfolioPreview`; `src/layouts/AppShell.astro` remains app-shell-only wrapper while public routes render standalone white output.
- 2026-02-10 `npm run typecheck` (pass; 0 errors, 0 warnings, existing baseRepository hint remains).
- 2026-02-10 `npm run build` (pass; astro build --remote complete).
- 2026-02-10 `mcp__browser_tools__run_playwright_script` on local dev route failed to validate UI due `Invalid URL` DB env runtime error in `/app/portfolios/*`; captured diagnostic screenshot `browser:/tmp/codex_browser_invocations/ef359bc49d432205/artifacts/artifacts/portfolio-editor-mobile.png`.
- 2026-02-08 `rg -n -e 'class=\"[^\"]*(^| )(border|bg|text|grid|gap)(-|:)|class=\"[^\"]*(^| )(sm:|lg:)' src/pages/app/portfolios` (no matches for raw utility classes).
- 2026-02-08 `rg -n 'style=\"' src/pages/app/portfolios` (no matches).
- 2026-02-08 `npm run typecheck` (pass; 0 errors, 0 warnings, existing baseRepository hint remains).
- 2026-02-08 `npm run build` (pass).
- 2026-02-08 `npm run typecheck` (pass; 0 errors, 0 warnings, existing baseRepository hint remains).
- 2026-02-08 `npm run build` (pass; astro build --remote complete).
- 2026-02-08 `rg -n "<style" src/pages` (no matches).
- 2026-02-08 `rg -n "#[0-9a-fA-F]{3,8}" src/pages` (no matches).
- 2026-02-08 `rg -n "isProtectedRoute|/admin" src/middleware.ts` confirms `/app`-only protected route and no `/admin` handling.
- 2026-02-08 `rg -n "z\\.any\\(" src/actions/portfolioCreator.ts` (no matches).
- 2026-02-08 `rg -n "items\\.reduce\\(.*Math\\.max" src/actions/portfolioCreator.ts` confirms `max(order)+1` create-item strategy.
- 2026-02-08 Manual proof artifacts captured under `artifacts/standardB-verify-20260208/`:
  - `proof1_short_field_counter.png` (short field clamp)
  - `proof1_long_field_counter.png` (textarea clamp)
  - `proof2_invalid_date_blocked.png` (save blocked when end < start)
  - `proof3_present_toggle_on.png` and `proof3_present_toggle_off.png` (present toggle clear/disable and re-enable)
  - `proof4_item_before_delete.png`, `proof4_item_after_delete.png`, `proof4_project_deleted.png` (free-user delete behavior)
  - `proof5_pro_template_ui_locked.png` + `proof5_pro_template_direct_response.json` (UI lock + server PAYMENT_REQUIRED)
  - `proof.json` (summary values and confirmations)
- 2026-02-08 Pro template direct action verification: `POST /_actions/portfolioCreator.createProject/` as free user returned HTTP 402 with `code: PAYMENT_REQUIRED`.
- 2026-02-01 `npm run typecheck` (pass; 1 hint in baseRepository).
- 2026-02-01 `npm run build` (pass).
- 2026-02-01 Pending manual check: free user sees templates 3/4 disabled + Pro badge; direct preview/publish returns PAYMENT_REQUIRED; delete allowed. Paid user can use all templates.
- 2026-01-31 Pending manual check: paid user sees non-null fields; free user sees null/false in `Astro.locals.user`.
- 2026-01-31 Pending manual check: `/admin/session` shows isPaid true for paid user and false for free user.
- 2026-01-29 `npm run typecheck` (pass; 1 hint in baseRepository).
- 2026-01-29 `npm run build` (pass).
- 2026-01-29 Smoke test: not run (manual create/publish portfolio).

## Task Log (Recent)
- 2026-03-02 Switched existing AI-integrated Description field in `src/pages/app/portfolios/[id].astro` from suggestions to rewrite flow via `<AvAiAssist mode=\"rewrite\" rewriteField=\"generic\" maxChars={PORTFOLIO_MAX.projectDescription} onReplaceEvent=\"av:ai-replace\" />`, preserving single-field scope and replace-based store update behavior. Dependency bumped to `@ansiversa/components@^0.0.167` (`package.json` + lockfile). Verification: `npm run typecheck` ✅ (0 errors, existing hint), `npm run build` ✅.
- 2026-03-01 Live-app shared UI sync: upgraded `@ansiversa/components` to `^0.0.163` (or confirmed already aligned in `web`) and refreshed install state for this repo. Verification: `npm run build` ✅.
- Keep newest first; include date and short summary.
- 2026-02-27 Middleware Standard V1 normalization: added config-driven middleware (`src/lib/middlewareConfig.ts` + shared `src/middleware.ts`) with standardized invariants (identical static asset bypass list, production `ANSIVERSA_COOKIE_DOMAIN` enforcement, ordered middleware flow, safe numeric admin role check, DEV-only bypass gate). Preserved portfolio-creator public/private behavior using `protectPrefixes` with `['/app','/admin']` so public slug routes remain public. Updated `.env.example` with routing and standardized `DEV_BYPASS_*` contract. Verification: `npm run typecheck` ✅, `npm run build` ✅.
- 2026-02-27 Footer parent-origin rollout: bumped `@ansiversa/components` to `0.0.149` (lockfile refreshed) to consume shared footer absolute-parent links for Terms/Privacy/FAQ/Contact (`https://ansiversa.com/...` in prod, configurable locally via `PUBLIC_ANSIVERSA_PARENT_ORIGIN`). Verification: `npm run build` ✅.
- 2026-02-22 FAQ content refresh (production): replaced placeholder/demo FAQ entries with real Portfolio Creator user FAQs (5) via `db/seed-faq-content.ts` using audience=`user`, published entries, and stable sort order; aligned content with current Portfolio Creator V1 behavior and ecosystem FAQ contract.
- 2026-02-22 Mini-app navbar home-link rollout: upgraded `@ansiversa/components` to `0.0.145` so `AvMiniAppBar` app title/icon area is clickable and navigates to mini-app home (`links[0].href`, fallback `/`) with accessible aria-label + focus-visible state; verified no behavior changes to 3-dot menu. Verification: `npm run build` ✅.
- 2026-02-22 FAQ shared rollout: upgraded `@ansiversa/components` to `0.0.144` (shared `FaqManager` now includes debounced search + icon actions + no numeric order UI + no sort-order input), and updated `src/pages/api/admin/faqs.json.ts` GET to support `q` filtering across question/category/audience while preserving audience filter and existing CRUD/reorder behavior. Verification: `npm run build` ✅.
- 2026-02-22 Fix: portfolio delete confirmation now renders selected title reliably by setting `AvConfirmDialog` title text at click-time before `AvDialog.open(...)`, resolving static `headline` prop limitation for dynamic Alpine bindings.
- 2026-02-22 UX polish: portfolio list delete confirmation dialog now includes the selected portfolio title using `AvConfirmDialog` dynamic headline with fallback `Delete this item?`; delete behavior unchanged.
- 2026-02-22 Bookmarks V1 hardening: added `scripts/apply-bookmark-triggers.ts` using `@libsql/client` (`TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN`) and wired `db:triggers` + `postdb:push`; applied trigger `bookmark_cleanup_portfolio_project_delete` (`PortfolioProject` -> `Bookmark` cleanup for `entityType='portfolio'`). Verification: `npm run db:push` ✅, `npm run db:triggers` ✅, trigger query (`sqlite_master`) ✅, `npm run typecheck` ✅, `npm run build` ✅. Production checklist: pending manual smoke (delete bookmarked portfolio -> bookmark row auto-removed -> `/bookmarks` no orphan card).
- 2026-02-20 Portfolio Creator Bookmarks V1 shipped end-to-end: added DB `Bookmark` table (unique userId+entityType+entityId), wired in DB config, added actions `listBookmarks` + `toggleBookmark`, added optimistic bookmark state methods in portfolio Alpine store, added `AvBookmarkButton` to `/app/portfolios` cards, added `/bookmarks` page using `AvBookmarksEmpty` + `AvBookmarksList`, and enabled gated 3-dot menu Bookmarks item via `bookmarksHref="/bookmarks"` in AppShell; bumped `@ansiversa/components` to exact `0.0.142`. Verification: `npm run db:push` ✅, `npm run typecheck` ✅, `npm run build` ✅. Production checks: bookmark persists after refresh, `/bookmarks` list links to `/app/portfolios/{id}`, unbookmark reflects after refresh, and only apps passing `bookmarksHref` show Bookmarks menu item.
- 2026-02-19 Bumped `@ansiversa/components` to `0.0.141` and refreshed lockfile for latest shared FAQ order-arrow release; verification: `npm run build` ✅.
- 2026-02-19 Bumped `@ansiversa/components` to `0.0.140` and refreshed lockfile to consume the latest shared release; verification: `npm run build` ✅.
- 2026-02-19 Bumped `@ansiversa/components` to `0.0.139` (AvMiniAppBar AppLogo support) and verified with `npm run build` (pass).
- 2026-02-19 FAQ V1 added: faqs table + public endpoint + admin CRUD + /admin/faq using shared FaqManager.
- 2026-02-14 Added AI Suggestions V1 to Portfolio Creator on one field only (Featured Project `Description` textarea in `src/pages/app/portfolios/[id].astro`) using shared `<AvAiAssist />` with `featureKey=\"portfolio.project_summary_suggestions\"`, min 30 / max 1500, and event handlers `av:ai-append` + `av:ai-replace` wired in `src/modules/portfolio-creator/store.ts` (append newline when needed, replace overwrite). Added same-origin AI proxy route `src/pages/api/ai/suggest.ts` and shared parent-origin resolver `src/server/resolveParentOrigin.ts` (production canonical `https://www.ansiversa.com`), and reused resolver in notifications proxy route. Upgraded `@ansiversa/components` to `0.0.130`. Verification: `npm run typecheck` (pass; 0 errors, 1 existing hint), `npm run build` (pass). Manual test checklist: `<30` disabled, `30+` enabled, modal loads suggestions, Append/Replace/Copy behavior, and `1500+` disabled. Production network verification note: pending manual verification on Vercel (`/api/ai/suggest` -> parent `/api/ai/suggest.json` with no redirect).
- 2026-02-14 Upgraded `@ansiversa/components` to `^0.0.128` (lockfile resolved to `0.0.128`) and verified with `npm run typecheck` (pass; 0 errors, existing 1 hint).
- 2026-02-12 Updated upload proxy `src/pages/api/media/upload.json.ts` to forward same-site headers (`Origin`/`Referer` set to parent web origin) on server-to-server POST so parent Astro CSRF/origin checks accept multipart upload requests instead of returning `403 Cross-site POST form submissions are forbidden`.
- 2026-02-12 Replaced browser cross-origin upload call with same-origin proxy route `src/pages/api/media/upload.json.ts` (portfolio-creator -> parent web server-to-server forward with session cookie) and updated editor uploader on `/app/portfolios/[id]` to use local `/api/media/upload.json`, eliminating Astro cross-site POST/CORS 403 failures.
- 2026-02-12 Corrected parent upload origin normalization in `src/pages/app/portfolios/[id].astro` to canonicalize both `ansiversa.com` and `www.ansiversa.com` to `https://www.ansiversa.com`, fixing browser CORS failures caused by apex->www `307` redirects on `/api/media/upload.json`.
- 2026-02-12 Added upload-origin hardening in `src/pages/app/portfolios/[id].astro`: normalize parent upload origin and coerce `www.ansiversa.com` to `ansiversa.com` before building `${origin}/api/media/upload.json` to prevent CORS failures caused by `www` host mismatch.
- 2026-02-12 Fixed Alpine syntax error in `/app/portfolios/[id]` counters (`Unexpected token '{'`) by replacing `x-text` expressions with plain JS concatenation (`length + ' / ' + max`) for title/slug/profile/about/CTA/description counters in `src/pages/app/portfolios/[id].astro`.
- 2026-02-12 Fixed Alpine runtime crash on `/app/portfolios/[id]` (`PORTFOLIO_MAX is not defined`) by converting profile/editor counter `x-text` expressions to server-inlined max literals in `src/pages/app/portfolios/[id].astro` so browser expressions no longer reference server constants.
- 2026-02-12 Added portfolio profile photo V1: DB fields on `PortfolioProject` (`profilePhotoKey`, `profilePhotoUrl`, `profilePhotoUpdatedAt`), new `portfolioCreator.updateProfilePhoto` action, editor integration with shared `AvImageUploader` (using `PARENT_WEB_ORIGIN` absolute parent upload endpoint + remove flow), store wiring for save/remove + preview refresh, public data mapper includes `profilePhotoUrl`, and dependency updated to `@ansiversa/components@^0.0.127`.
- 2026-02-11 Fixed editor top action CTA behavior for visibility states on `/app/portfolios/[id]`: private now shows **Preview** to `/app/portfolios/{id}/preview`, public/unlisted open `/{slug}` with missing-slug disabled tooltip fallback; added subtle visibility indicator label (Private 🔒 / Public 🌐 / Unlisted 🔗) and responsive styles for mobile-safe wrapping.
- 2026-02-10 Refactored public output (`/[slug]`) and preview (`/app/portfolios/[id]/preview`) to consume package templates from `@ansiversa/components` via `PortfolioPublicData` mapping (`src/modules/portfolio-creator/publicOutput.ts`) and `resolvePortfolioPublicTemplate(themeKey)`; removed local public rendering path from these routes and updated dependency to `^0.0.126`.
- 2026-02-10 Dark theme leak fix aligned to package scope: public output routes now render neutral/white template pages while dark treatment is constrained to app-shell wrapper via `.av-theme-app` in shared components package.
- 2026-02-10 Mobile UI pass on `/app/portfolios/[id]`: replaced section status text with Eye/Eye-off icons + sr-only/title, added sticky responsive drawer footer actions (Save/Hide/Close), and added footer Close action; files touched: `src/pages/app/portfolios/[id].astro`, `src/styles/global.css`.
- 2026-02-09 Enforced repo-level AGENTS mandatory task-log update rule for Codex/AI execution.
- 2026-02-09 Verified repo AGENTS contract linkage to workspace source-of-truth.

## Template Visual Parity Checklist
- Header identity renders: name/title/headline/location are visible with stable hierarchy.
- Section visibility is respected: disabled/hidden sections do not render.
- Featured projects render: title, description, link, bullets, tags.
- Contact renders: email/phone/website/custom links with valid href targets.
- Output parity on both routes: `/<slug>` and `/app/portfolios/[id]/preview` render the same template for a given `themeKey`.

# Portfolio Creator Verification Checklist (2026-03-03)

Legend:
- ✅ Verified now (command/code check)
- ⬜ Pending manual verification

## A) Pre-flight
1. ✅ Pull latest branch locally (the one you'll merge).
2. Run:
   - ✅ `npm run typecheck` (pass: 0 errors, 0 warnings; 1 hint)
   - ✅ `npm run build` (pass)

## B) `/app/portfolios` List Page
3. ✅ Open `/app/portfolios` (fresh reload).
4. ✅ Confirm Create button exists and opens a right-side drawer. (code check)
5. ✅ Drawer UI checks (code check):
   - Title/description visible (no blank header strip)
   - Required fields visible
   - Footer has Create + Cancel/Close
6. ✅ Validation checks (code check):
   - Create with empty/invalid fields shows error in drawer footer notice area
   - No page-level alert/banner shown while drawer is open (guarded in editor/settings flow; list create should be manually smoke-tested)
7. ✅ Double-submit checks (code check):
   - Create button disables while loading (`:disabled="loading"`)
8. ✅ Success path (code check):
   - Valid create closes drawer and redirects to `/app/portfolios/{id}`

## C) List Card Action Row
9. ✅ For at least 1 portfolio card, action buttons are icon-only. (code check)
10. ✅ Accessibility (code check):
   - Hover/long-press title present
   - `aria-label` present on action buttons
11. ✅ Action behavior wiring present (code check):
   - Edit opens editor route
   - View/Preview route present
   - Delete opens confirm dialog and calls delete action

## D) `/app/portfolios/[id]` Editor Page
12. ✅ Load `/app/portfolios/{id}`.
13. ✅ Settings entry point exists and opens Settings drawer. (code check)

## E) Settings Drawer (Critical)
14. ✅ Settings drawer structure present (code check):
   - Title/description visible
   - Fields present (title/slug/visibility/template)
   - Footer has Save + Close
15. ✅ Drawer-scoped validation behavior implemented (code check):
   - Invalid values return errors in drawer footer notice
   - Page-level alerts are suppressed while settings drawer is open
16. ⬜ Full success case manual check:
   - Valid edit → Save → drawer closes
   - Refresh page → change persists

## F) Section Editing + Save & Next (If present)
17. ✅ Section editing drawer exists. (code check)
18. ✅ Footer includes Save & Next for supported sections. (code check)
19. ✅/⬜ Save & Next behavior:
   - ✅ Valid save advances to next section (code path exists)
   - ✅ Error case does not advance (guard exists)
   - ⬜ Last section Save & Next disabled/hidden (manual UI confirm)

## G) Drawer UX Hardening (Mobile + Scroll)
20. ⬜ Mobile-width drawer scroll/layout behavior.
21. ⬜ No stuck drawer content; full top-to-bottom scroll.

## H) Regression Quick Sweep
22. ⬜ Logout/login (or hard refresh) and re-check:
   - list page loads
   - editor loads
   - create still works

## I) Governance
23. ✅ Open `AGENTS.md` and confirm newest entry describes today's work.
24. ⬜ Confirm commit is clean and only expected files are touched.

---

## Evidence Run This Session
- `npm run typecheck` at 2026-03-03 (local) → pass
- `npm run build` at 2026-03-03 (local) → pass
- Targeted code checks in:
  - `src/pages/app/portfolios/index.astro`
  - `src/pages/app/portfolios/[id].astro`
  - `src/modules/portfolio-creator/store.ts`

# Ansiversa Drawer UX Standard V1

## Purpose & Scope
- Standardize drawer UX for `Create`, `Settings`, and `Section edit` flows.
- Solve repeat issues across mini-apps:
  - Inconsistent interaction patterns
  - Mixed error-routing (page vs drawer)
  - Mobile scroll/stuck-content failures
- Scope applies to app-shell editor/list routes where a drawer is the primary task surface.

## Drawer Types
- Create Drawer (list page)
  - Use for creating a new entity from the list/index screen.
- Settings Drawer (editor page)
  - Use for project-level metadata updates (title, slug, visibility, template/theme).
- Section Edit Drawer (editor page)
  - Use for section/item content editing within editor workflows.

## Drawer Layout Contract
- All drawers must follow a consistent three-part structure.
- Header
  - Contains drawer title.
  - May include an optional short description.
  - Must not render an empty header strip if description is absent.
- Body
  - Primary content container for forms or editor controls.
  - Must be scrollable when content exceeds viewport height.
  - Must use flex scroll hardening (`min-height: 0`) when inside flex layouts.
- Footer
  - Contains action buttons and drawer notice area.
  - Action buttons must follow the footer contract defined in Required Behaviors.
  - Drawer-scoped validation/errors must render in the notice area above footer actions.

## Required Behaviors
- Open/close rules
  - Drawer opens from explicit user action only.
  - Close is available via close button and explicit footer close/cancel action.
- Footer buttons contract
  - Create Drawer: primary `Create`, secondary `Cancel/Close`.
  - Settings Drawer: primary `Save`, secondary `Close`.
  - Section Edit Drawer: primary `Save`, optional `Save & Next`, and `Close`.
- Loading/double-submit prevention
  - Disable primary action while request is in progress.
  - Ignore repeated submits until current request resolves.
- Redirect rules for create success
  - On successful create, close drawer and redirect to the new editor route.
- Close-on-success rules for saves
  - On successful settings save, close settings drawer.
  - On successful section save, keep or advance based on action used (`Save` vs `Save & Next`).

## Validation & Error Routing
- Drawer-scoped errors must render inside the drawer footer notice area.
- Suppress page-level banners while drawer is open.
- Error lifecycle
  - Clear stale errors on drawer open.
  - Clear drawer errors on close.
  - Keep errors visible while the drawer remains open and request fails.

## Accessibility Contract
- Icon-only actions must include both `aria-label` and `title`.
- Focus management expectations
  - Interactive controls must be keyboard reachable.
  - Focus-visible styles must be present.
- Buttons must not rely on tooltip-only meaning.

## Mobile & Scroll Rules
- Use flex scroll hardening in drawer content containers:
  - `min-height: 0` on scroll-constrained flex children.
- Drawer body must allow full top-to-bottom scrolling with no stuck content.
- Textarea behavior
  - Prevent layout break from long content.
  - Ensure internal overflow is scrollable/resizable only within safe limits.

## Save & Next Standard (Optional Feature)
- Use only for section-based editor flows.
- Require a canonical section order constant.
- Must not advance when save/validation fails.
- Must be disabled or hidden on the last section.

## Adoption Checklist
- [ ] Create flow uses drawer.
- [ ] Settings moved into drawer.
- [ ] Drawer-scoped validation routing.
- [ ] Icon-only actions accessible (`aria-label` + `title`).
- [ ] Mobile scroll verified (no stuck content).
- [ ] Build/typecheck passed.
- [ ] AGENTS freeze marker added.

## Reference Implementation (Portfolio Creator)
- Routes:
  - `/app/portfolios`
  - `/app/portfolios/[id]`
- Verification checklist evidence:
  - `public/verification-checklist-2026-03-03.md`
- Freeze baseline commit:
  - `d8edcb6`

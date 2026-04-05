# App Spec: portfolio-creator

## 1) App Overview
- **App Name:** Portfolio Creator
- **Category:** Career / Personal Branding
- **Version:** V1
- **App Type:** Hybrid
- **Purpose:** Help an authenticated user create a portfolio project, edit structured sections, and publish a public portfolio page by slug.
- **Primary User:** A single signed-in user building a personal portfolio.

## 2) User Stories
- As a user, I want to create a portfolio project and choose a theme, so that I can start from a structured presentation baseline.
- As a user, I want to edit portfolio sections and reorder or toggle content, so that my public page reflects my real profile and projects.
- As a user, I want to publish or unpublish the portfolio and share a public slug route, so that others can view it outside the authenticated app.

## 3) Core Workflow
1. User signs in and opens `/app/portfolios`.
2. User creates a portfolio project with a title and theme.
3. User opens `/app/portfolios/[id]` to edit sections such as profile, about, featured projects, experience, skills, education, certifications, achievements, and contact.
4. User updates visibility and publish state, then accesses the public portfolio at `/<slug>`.
5. User can continue refining content, media, and ordering from the authenticated editor workflow.

## 4) Functional Behavior
- Portfolio Creator persists portfolio projects, sections, and section items in Astro DB per authenticated user.
- Public rendering is supported through a slug route, so the app has both authenticated editing surfaces and a public published output.
- Profile photo upload is supported via the repo’s media upload route and stored as project-level metadata.
- Visibility and publish state are stored explicitly; a project can exist without being publicly published.
- Current implementation includes bookmarks, FAQ, parent notification/activity integration, and Pro template access checks.
- Pro templates are gated truthfully through `PAYMENT_REQUIRED`; free users can still use non-Pro themes and core editing flows.

## 5) Data & Storage
- **Storage type:** Astro DB plus uploaded media/public rendering
- **Main entities:** `PortfolioProject`, `PortfolioSection`, `PortfolioItem`, `Bookmark`, `Faq`
- **Persistence expectations:** Portfolio data persists per authenticated user, while published output is rendered from that stored content via public slug.
- **User model:** Single-user ownership of each portfolio project

## 6) Special Logic (Optional)
- Default sections are provisioned in a fixed order and then user-managed through enable/reorder/item-edit flows.
- Slug uniqueness is enforced so public portfolio routes do not collide.
- Public/private/unlisted style visibility exists separately from `isPublished`, allowing conservative control over exposure.

## 7) Edge Cases & Error Handling
- Invalid slug/title updates: Slug normalization and uniqueness checks should prevent collisions or broken public routes.
- Missing ownership: Project, section, and item actions should reject non-owned IDs.
- Premium template access: Pro-only template choices should fail clearly for unpaid users.
- Missing public project: Unpublished or missing slugs should fail safely instead of leaking draft state.

## 8) Tester Verification Guide
### Core flow tests
- [ ] Create a portfolio, edit multiple sections, and confirm content persists after refresh.
- [ ] Upload a profile photo and confirm it appears in the editor and public output where supported.
- [ ] Publish the portfolio and verify the public `/<slug>` route renders the saved project.

### Safety tests
- [ ] Change slug or visibility and confirm public routing behavior remains consistent.
- [ ] Attempt to use a Pro-only template as a free user and confirm the app surfaces a truthful gate.
- [ ] Unpublish the portfolio and confirm the public route no longer exposes the previously published output as if it were still live.

### Negative tests
- [ ] Confirm the app does not provide team collaboration or multi-author editing in V1.
- [ ] Confirm media/public output behavior is backed by saved project state rather than unsaved client-only changes.

## 9) Out of Scope (V1)
- Multi-user collaboration
- Analytics dashboards for public visitors
- CMS-style custom page building beyond the supported sections
- Independent billing flows inside the mini-app

## 10) Freeze Notes
- V1 freeze: this document reflects the current authenticated editor plus public slug output implementation.
- Browser QA should still verify publish/unpublish transitions, media upload behavior, and public-route visibility because those are runtime-sensitive surfaces.
- During freeze, only verification fixes, cleanup, and documentation hardening are allowed.

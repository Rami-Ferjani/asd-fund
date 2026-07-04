Read the following project context documents before doing anything:

- @context/project-overview.md
- @context/architecture-context.md
- @context/DESIGN.md

Your task is to create a detailed implementation plan for making the admin pages fully mobile-first and responsive.

Inspect the following files to understand the current implementation:

- @app/admin/info/page.tsx
- @app/admin/donors/page.tsx
- @app/admin/layout.tsx

The sidebar in `app/admin/layout.tsx` is already responsive and mobile-friendly. Treat it as the source of truth. Only recommend modifications if they are absolutely necessary to improve the overall mobile experience, and ensure any suggested changes preserve the existing desktop behavior because other admin pages depend on it.

⚠️ IMPORTANT

This task is ONLY to create an implementation plan.

Do NOT modify any source code.

Do NOT edit:

- `app/admin/layout.tsx`
- `app/admin/info/page.tsx`
- `app/admin/donors/page.tsx`

Instead, write a detailed implementation plan inside:

`@app/admin/implementation.md`

The implementation plan should contain:

1. Overview of the current responsiveness issues.
2. A section dedicated to `app/admin/info/page.tsx`.
3. A section dedicated to `app/admin/donors/page.tsx`.
4. Any recommendations regarding `app/admin/layout.tsx` (only if absolutely necessary).
5. Required Tailwind responsive breakpoint changes.
6. Required shadcn/ui components (if any are missing), including the installation command.
7. A step-by-step implementation checklist that another AI can follow.
8. Acceptance criteria describing what the finished implementation should achieve.

Follow a mobile-first approach.

Do not simply shrink existing components.

At each Tailwind breakpoint (`sm`, `md`, `lg`, `xl`), adapt the layout appropriately by:

- Stacking headers and toolbars vertically on small screens.
- Making forms and search inputs full width on mobile.
- Adjusting spacing, padding, typography, and component sizes.
- Reorganizing grids where appropriate.
- Replacing desktop tables with mobile-friendly card layouts below the `md` breakpoint.
- Ensuring comfortable touch targets.
- Eliminating unnecessary horizontal scrolling.
- Preserving a polished and intentional mobile experience.

Preserve the existing visual design and branding.

Do not redesign the interface.

Do not change colors, typography, branding, or the overall design language defined in `@context/DESIGN.md`.

Use Tailwind CSS responsive utilities for all layout adaptations.

Reuse existing shadcn/ui components whenever possible.

If an additional shadcn component would significantly improve the implementation, recommend it and include the appropriate `npx shadcn@latest add ...` installation command in the plan.

This is strictly a frontend layout and styling task.

Do NOT propose or implement changes to:

- Convex
- Clerk
- Database schema
- Queries
- Mutations
- Backend logic
- Existing business logic
- Application functionality

Base every recommendation on the existing implementation. Do not invent components, features, or functionality that are not already present in the project. The goal is to improve responsiveness while preserving all existing behavior.

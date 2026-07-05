


Read the following project context documents before doing anything:

- @context/project-overview.md
- @context/architecture-context.md
- @context/DESIGN.md

Your task is to create a detailed implementation plan for converting the static HTML landing page into a production-ready Next.js page.
Inspect:

- @app/landingpage.html
- @convex/schema.ts
- @convex/donors.ts
- @convex/donations.ts

Do NOT modify any source code.

Instead, write the implementation plan inside:

`@app/implementation.md`

The implementation plan should contain:

1. Overall implementation strategy.
2. Component breakdown.
3. Required shadcn/ui components.
4. Required Tailwind styling strategy.
5. Required Convex queries for each section.
6. Responsive implementation strategy.
7. Step-by-step implementation checklist.
8. Acceptance criteria.

The goal is to faithfully recreate the design from `landingpage.html` as reusable Next.js components.


Use:

- shadcn/ui for UI components
- Tailwind CSS for styling
- Existing project conventions

If a required shadcn component is missing, include the appropriate installation command.

## Backend Constraints

Use ONLY the existing Convex queries and mutations.

Do NOT create new Convex queries.

Do NOT create new Convex mutations.

Do NOT modify:

- Convex schema
- Convex backend
- Clerk
- Authentication
- Business logic

Do not add authentication.

If additional backend functionality would be required, mention it in the implementation plan instead of inventing it.

## Homepage Data

Use only the existing Convex functions available in:

- @convex/donors.ts
- @convex/donations.ts

## 200 Challenge

Follow these business rules exactly:

- Every completed €100 earns one slot.
- Donations below €100 earn no slot.
- Slot count = floor(total donated / 100).
- A donor with €200 occupies two consecutive horizontal slots.
- A donor with €300 occupies three consecutive horizontal slots.
- Donor images are repeated; images are never stretched across multiple slots.
- Slot order follows donation order (oldest qualifying donor first).
- Filling starts from the top-left corner and proceeds left-to-right, top-to-bottom.
- Empty slots remain blank until filled.
- The challenge is generated using existing Convex queries only.
- Do not propose new backend functions for this feature  Unless you deem it necessary 

## 200 Challenge Interaction

Each occupied slot in the 200 Challenge should be interactive.

When a user clicks or taps a donor's picture, open a shadcn/ui Dialog (not a browser alert) displaying the donor's information.

The dialog should contain:

- Donor profile picture (larger version)
- Donor name
- Total amount donated
- Donation message (if one exists)
- A close button

If the donor has no message, simply omit the message section instead of displaying an empty placeholder.

The dialog should be responsive, accessible, and work well on both desktop and mobile devices.

Use existing Convex queries only. Do not create new backend functions for this feature.


## Responsive Design

The HTML design is desktop-oriented.

Convert it into a mobile-first implementation.

Do not simply shrink components.

At each Tailwind breakpoint (`sm`, `md`, `lg`, `xl`):

- Adapt layouts appropriately.
- Stack multi-column layouts vertically on mobile.
- Make forms and inputs full width.
- Adjust spacing, typography, and image sizes.
- Reorganize grids where appropriate.
- Ensure comfortable touch targets.
- Avoid unnecessary horizontal scrolling.
- Preserve the desktop experience.

## Design Constraints

Preserve the existing visual design.
The image of the bus is in `@app/images/car.jpeg`

Do not redesign the interface.

Do not change:

- Arabic text
- Colors
- Branding
- Typography
- Overall layout philosophy

Preserve all Arabic text exactly as it appears in `landingpage.html`. Do not translate or rewrite it.

Base every recommendation on the existing implementation. Do not invent functionality that is outside the project scope.
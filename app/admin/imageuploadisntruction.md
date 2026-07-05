Read the following project context documents before doing anything:

- @context/project-overview.md
- @context/architecture-context.md
- @context/DESIGN.md

Your task is to create a detailed implementation plan for adding donor image upload functionality using Vercel Blob.

⚠️ IMPORTANT

This is a planning task only.

Do NOT modify any source code.

Instead, write the implementation plan inside:

`@app/admin/image-upload-implementation.md`

Inspect the following files to understand the current implementation:

- @app/admin/donors/page.tsx
- @app/admin/donations/page.tsx
- @convex/schema.ts
- @convex/donors.ts

## Current Behavior

Currently, when creating or editing a donor, the administrator manually enters the donor image URL into a text field.

## Desired Behavior

Replace the manual image URL input with an image upload flow.

When creating or editing a donor:

1. The administrator clicks an "Upload Image" button.
2. The native file picker opens.
3. The administrator selects an image.
4. The image is uploaded to Vercel Blob through a Next.js API Route.
5. Vercel Blob returns the public image URL.
6. Only after the upload succeeds should the existing Convex mutation (`createDonor` or `updateDonor`) be called.
7. The returned Blob URL is stored in the existing `imageUrl` field.

The image itself must never be stored inside Convex.

Only the Blob URL is stored in the database.

The implementation plan may recommend creating a new Next.js API Route (for example `app/api/upload/route.ts`) to handle uploads securely.

Do NOT modify:

- Convex schema
- Convex queries
- Convex mutations
- Clerk
- Authentication
- Existing business logic

The implementation should continue using the existing Convex mutations.

No backend changes should be proposed outside of the upload API route.

## UI Requirements

The upload interface should:

- Use shadcn/ui components where appropriate.
- Follow the existing project design language.
- Be mobile-first and responsive.
- Show a preview of the selected image before submission.
- Display upload progress or loading feedback.
- Handle upload failures gracefully.
- Allow replacing an existing donor image during editing.

Drag-and-drop upload is NOT required.

A standard file picker is sufficient.

If additional shadcn/ui components or npm packages would significantly improve the implementation, include them in the implementation plan, but ask for approval before installing them.

## The implementation plan should include:

1. Overall architecture.
2. Upload flow.
3. Required Next.js API route.
4. Required frontend changes.
5. Required shadcn/ui components.
6. Required npm packages (if any).
7. Step-by-step implementation checklist.
8. Error handling strategy.
9. Acceptance criteria.

Base every recommendation on the existing implementation. Do not invent functionality outside the current project scope.
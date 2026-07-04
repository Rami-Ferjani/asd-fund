# Architecture Context

## Stack

| Layer | Technology | Role |
|--------|------------|------|
| Framework | Next.js 16 + TypeScript | Full-stack React application using the App Router |
| UI | Tailwind CSS + shadcn/ui | Component library and styling |
| Backend | Convex | Database, realtime queries, and server functions |
| Authentication | Clerk | Administrator authentication and route protection |
| File Storage | Vercel Blob | Donor image storage |
| Hosting | Vercel | Application hosting and deployment |

---

# System Boundaries

- `app/` — Next.js App Router pages and layouts.
- `app/admin` — Protected administrator dashboard.
- `components/` — Reusable UI components shared throughout the application.
- `convex/` — Database schema, queries, and mutations. All business logic lives here.
- `lib/` — Shared utilities, helper functions, constants, and configuration.
- `public/` — Static assets such as the club logo and placeholder images.

---

# Storage Model

## Convex Database

Convex stores all application data.

### donors

Stores donor information.

Fields:

- name
- imageUrl
- phone (optional)
- createdAt

### donations

Stores every donation.

Fields:

- donorId
- amount
- note (optional)
- createdAt

Relationships:

- One donor can have many donations.
- Every donation belongs to exactly one donor.

The database **does not** store:

- donor total donations
- challenge slots
- fundraising progress

These values are computed dynamically through Convex queries.

---

## Vercel Blob

Only donor images are stored in Vercel Blob.

Blob URLs are stored in the `imageUrl` field of the donor document.

No other application data belongs in Blob storage.

---# Backend Architecture

Business logic belongs inside Convex.

Queries are responsible for:

- Reading data
- Aggregating data
- Joining related data
- Computing derived values

Mutations are responsible for:

- Creating records
- Updating records
- Deleting records

React components should **never** duplicate business logic that already exists in Convex.

---

# Realtime Model

The application relies on Convex realtime queries.

Whenever the administrator creates, edits, or deletes data:

- Fundraising progress updates automatically.
- Latest donors update automatically.
- Latest donations update automatically.
- 200 Challenge updates automatically.

No manual refresh should ever be required.


# Frontend Architecture

Pages should remain lightweight.

React components are primarily responsible for:

- Rendering UI
- Handling user interaction
- Calling Convex queries
- Calling Convex mutations

Components should avoid containing business logic.

Whenever possible:

- Data transformations happen in Convex.
- UI rendering happens in React.

---
# Admin Dashboard

The administrator dashboard manages the application data.

Responsibilities:

- Donor CRUD
- Donation CRUD
- Image uploads
- Dashboard statistics

The dashboard should never contain duplicated public page logic.

Both the dashboard and the public website should consume the same Convex queries whenever possible.

# Data Access Rules

Whenever data requires relationships, Convex should return already-composed objects.

Example:

Instead of:

```
Donation

↓

donorId

↓

React fetches donor
```

Use:

```
Donation

↓

Convex joins donor

↓

React receives:

{
  donation,
  donor
}
```

The frontend should require as few queries as possible.
# UI Principles

The application should remain simple.

Preferred characteristics:

- Clean
- Fast
- Responsive
- Easy to understand
- Minimal animations
- Minimal dependencies

Avoid unnecessary abstraction.

Avoid premature optimization.

Prefer readability over clever implementations.

---

# Invariants

1. All business logic belongs in Convex.
2. React components focus on presentation.
4. Public pages never require authentication.
5. Images are stored only in Vercel Blob.

7. Donor totals are always calculated from donations.

9. Fundraising progress is calculated dynamically.
10. Every donation belongs to exactly one donor.
11. A donor may have multiple donations.
12. Realtime updates are handled by Convex queries.
13. The frontend should prefer one composed query over multiple related queries whenever practical.
14. The project favors simplicity over unnecessary architectural complexity.
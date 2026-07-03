# ASD Soccer Club Crowdfunding

## Overview

ASD Soccer Club Crowdfunding is a simple web application built to help a local soccer club raise funds to purchase a new team bus. The application is primarily a public information page where visitors can track fundraising progress, view recent donors, and see the "200 Challenge" board.

Donations are **not processed through the website**. Instead, supporters donate offline via bank transfer or directly to the club's fundraiser. The administrator records donations manually through a protected admin dashboard.

The project prioritizes simplicity, reliability, and fast development over unnecessary complexity.

---

## Goals

1. Display the current fundraising progress toward the bus purchase.
2. Showcase recent donors and their contributions.
3. Automatically populate the 200 Challenge board based on donations.
4. Allow an authenticated administrator to manage donors and donations.
5. Keep the public website lightweight and easy to maintain.
6. Support image uploads for donor profile pictures.

---

## Core User Flow

### Public User

1. Visitor opens the website.
2. Visitor sees the fundraising campaign information.
3. Visitor views the total amount raised.
4. Visitor sees the latest donors.
5. Visitor browses the 200 Challenge board.
6. Visitor finds the available donation methods.
7. Visitor contacts the fundraiser and donates offline.

### Administrator

1. Administrator signs in using Clerk authentication.
2. Administrator opens the admin dashboard.
3. Administrator creates or edits donors.
4. Administrator uploads donor profile pictures.
5. Administrator records donations.
6. Public website updates automatically through Convex realtime queries.

---

# Features

## Public Website

- Campaign presentation.
- Fundraising progress bar.
- Total amount raised.
- Recent donors section.
- 200 Challenge board.
- Donation instructions.
- Contact information.
- Responsive design.

## Donor Management

- Create donors.
- Edit donors.
- Delete donors.
- Upload donor profile image.
- Search donors by name.

## Donation Management

- Create donations.
- Edit donations.
- Delete donations.
- Associate each donation with a donor.
- Search donations by donor.

## Authentication

- Administrator authentication using Clerk.
- Protected admin routes.
- Public pages require no authentication.

## Image Uploads

- Images stored using Vercel Blob.
- Image URLs stored inside Convex.

---

# 200 Challenge

The 200 Challenge is one of the central features of the application.

The challenge contains exactly **200 slots**.

Each slot represents **100€** donated.

Rules:

- Donations are cumulative per donor.
- Every completed 100€ earns one slot.
- Donations below 100€ do not receive a slot until the cumulative total reaches 100€.
- If a donor contributes 200€, their picture appears twice.
- If a donor contributes 500€, their picture appears five times.
- Empty slots remain blank.
- The board always displays exactly 200 slots.

The challenge board is **generated automatically** from donation data. No manual slot assignment exists.

Example:

John → 250€

Slots:

- John
- John

Mike → 100€

Slots:

- Mike

Ali → 40€

No slot.

---

# Data Model

## Donors

Each donor contains:

- name
- imageUrl
- phone (optional)
- createdAt

A donor can have many donations.

---

## Donations

Each donation contains:

- donorId
- amount
- note (optional)
- createdAt

Each donation belongs to exactly one donor.

---

# Technology Stack

## Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend

- Convex
- Convex Realtime Queries
- Convex Mutations

## Authentication

- Clerk

## File Storage

- Vercel Blob

## Hosting

- Vercel

---

# Architecture

The project follows a simple architecture.

```
Public Website
        │
        ▼
     Convex
   Queries/Mutations
        │
        ▼
     Convex Database

Admin Dashboard
        │
        ▼
      Clerk Auth
        │
        ▼
     Convex Backend

Images
        │
        ▼
   Vercel Blob Storage
```

---

# Scope

## In Scope

- Public fundraising page
- Fundraising progress
- Recent donors
- 200 Challenge board
- Donor CRUD
- Donation CRUD
- Image uploads
- Admin authentication
- Responsive design
- Automatic realtime updates through Convex

## Out Of Scope

- Online payments
- Stripe integration
- User accounts
- Public authentication
- Donation checkout
- Email notifications
- Push notifications
- Multi-admin roles
- Analytics dashboard
- Mobile application

---

# Business Rules

- Donations are entered manually by the administrator.
- Money never passes through the website.
- Public visitors cannot submit donations.
- Every donation belongs to one donor.
- One donor may have multiple donations.
- Donor totals are computed from donations.
- The database never stores a donor's total donated amount.
- The database never stores challenge slots.
- Challenge slots are generated dynamically from donation totals.
- Images are stored in Vercel Blob and only the URL is stored in Convex.

---

# Success Criteria

1. Visitors can view fundraising progress.
2. Visitors can see recent donors.
3. Visitors can see the automatically generated 200 Challenge.
4. Administrator can manage donors.
5. Administrator can manage donations.
6. Uploaded donor images display correctly.
7. Donation totals update automatically.
8. The website updates in realtime after changes.
9. The application is fully responsive.
10. The project can be deployed entirely on Vercel using Convex, Clerk, and Vercel Blob.

---

# Development Philosophy

This project intentionally favors simplicity over unnecessary complexity.

The application is expected to have relatively low traffic and a single administrator. The architecture should remain lightweight, maintainable, and easy to understand.

AI assistants working on this project should:

- Prefer simple solutions over overly abstract ones.
- Avoid introducing unnecessary libraries or design patterns.
- Follow existing project conventions.
- Keep components reusable and readable.
- Use Convex queries and mutations appropriately.
- Keep business logic inside Convex whenever possible.
- Keep React components focused on presentation.
- Do not implement features that are outside the defined scope unless explicitly requested.
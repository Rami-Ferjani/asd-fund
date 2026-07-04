# Implementation Plan — Admin Donor Management Page

> **Audience:** the AI agent that will implement this. Follow this document exactly.
> **Visual source of truth:** `app/admin/screenshots/donors.html` — match its layout, colors, and typography.
> **Pattern reference:** `app/admin/info/page.tsx` — it already uses the same stack, tokens, shadcn components, and Convex hooks. Mirror its structure and conventions.

---

## 1. Goal

Implement the **Donor Management** page of the admin dashboard (`app/admin/donors/page.tsx`) as a CRUD interface over donors. The page lists donors in a table with their total donated amount, lets the admin search, and supports Add / Edit / Delete via dialogs. It interacts with the Convex backend in realtime.

The sidebar is already implemented in `app/admin/layout.tsx` and is shared across `/admin/info`, `/admin/donors`, and `/admin/donations`. **Do not touch the layout.** Implement only the page content that goes inside `{children}`.

---

## 2. Scope & Hard Constraints

### In scope
- Implement **only** `app/admin/donors/page.tsx`.
- Add **exactly one** new Convex query in `convex/donors.ts` (see §4). This is the **only** backend change allowed.

### Out of scope — DO NOT TOUCH
- `app/admin/info/page.tsx`, `app/admin/donations/page.tsx` (stubs for separate tasks).
- `app/admin/layout.tsx` (sidebar already done).
- Any other file in `convex/` besides adding the one query to `convex/donors.ts`.

### Hard rules
1. **Do not add authentication of any kind.** No Clerk, no route guards, no `useAuth`, no `ConvexProviderWithAuth`. Auth is a later task. Use plain `useQuery` / `useMutation` from `convex/react` (the provider is already wired at the app root).
2. **Do not add file upload for the profile picture.** The profile picture is a **URL text field** only. Image upload (Vercel Blob) is a future task.
3. **Do not calculate per-donor totals in the frontend.** Use the new `getDonorsWithTotals` Convex query (§4), which returns each donor already annotated with `totalDonated`. The React layer only renders the number.
4. **Do not add donations here.** Donations are managed in the "Add Donations" tab (separate task). The Add/Edit Donor dialog has only: name, phone, imageUrl.
5. **Do not add any Convex function other than `getDonorsWithTotals`.** Reuse the existing functions in `convex/donors.ts` for everything else.
6. Follow existing project conventions. Prefer simple, readable solutions over abstraction (per `context/project-overview.md`).

---

## 3. Decisions already made (do not re-litigate)

- **No top app bar.** The design HTML contains a TopAppBar (global search / notifications / account). **Skip it.** Implement only the table + CRUD area, matching how `info/page.tsx` is built.
- **One new Convex query is permitted** (`getDonorsWithTotals`) despite the general "no new functions" rule, because no existing function returns per-donor totals. This is the sole exception.
- **Search is client-side** over the realtime `getDonorsWithTotals` result (do **not** call `searchDonors` — it does not return totals).

---

## 4. Backend change — the one new Convex query

Add this query to `convex/donors.ts` (append at the end of the file, after `deleteDonor`):

```ts
// Returns every donor annotated with their total donated amount.
// Donations are summed server-side so the frontend never recomputes totals.
export const getDonorsWithTotals = query({
  args: {},
  handler: async (ctx) => {
    const donors = await ctx.db.query("donors").collect();

    const donorsWithTotals = await Promise.all(
      donors.map(async (donor) => {
        const donations = await ctx.db
          .query("donations")
          .withIndex("by_donor", (q) => q.eq("donorId", donor._id))
          .collect();

        const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

        return { ...donor, totalDonated };
      }),
    );

    return donorsWithTotals;
  },
});
```

Notes for the implementer:
- Uses the existing `by_donor` index on `donations` (defined in `convex/schema.ts`) — no schema change.
- `args: {}` satisfies the Convex rule that all functions must have argument validators.
- This mirrors the existing `getDonors` style (`.collect()` on the small admin donors table) — acceptable here per project conventions (low traffic, single admin).
- Do **not** edit `convex/schema.ts`, `convex/donations.ts`, or any other backend file.

### Convex functions to use (complete map)

| Action | Function reference | Args |
|--------|--------------------|------|
| List donors with totals | `api.donors.getDonorsWithTotals` | `{}` (the new query) |
| Create donor | `api.donors.createDonor` | `{ name: string, imageUrl: string, phone?: string }` |
| Update donor | `api.donors.updateDonor` | `{ donorId: Id<"donors">, name?: string, imageUrl?: string, phone?: string }` |
| Delete donor | `api.donors.deleteDonor` | `{ donorId: Id<"donors"> }` |

Important arg notes:
- `createDonor` **requires** `name` and `imageUrl` (both `v.string()`). `phone` is optional. The Add form must validate that name and imageUrl are non-empty before submitting.
- `updateDonor` patches — pass all three of `name`, `imageUrl`, `phone`.
- `deleteDonor` also deletes that donor's donations server-side (see `convex/donors.ts`). The UI only needs to confirm and call it; mention in the delete confirmation that the donor's donations will also be removed.

Do **not** use `getDonors`, `getDonorById`, or `searchDonors` for the table — they do not return `totalDonated`. Use only `getDonorsWithTotals` for the list.

---

## 5. Frontend file to create

Replace the stub at `app/admin/donors/page.tsx` with a full client component.

```tsx
"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { UserPlus, Search, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
```

Page must be a `"use client"` component (it uses hooks). Default-export a `DonorsPage` component.

---

## 6. Component structure

Mirror the composition style of `info/page.tsx` (page + small sub-components + helpers).

```
DonorsPage (default export)
├── helpers: formatEur(n), initials(name)
├── <main> wrapper
│   ├── Header row: title "Donor Management" + "Add New Donor" button
│   │     └── AddDonorDialog  (triggered by the Add button)
│   └── Card container (white, border, offset shadow)
│       ├── Toolbar: search Input + (optional) filter/download placeholder buttons
│       ├── Table
│       │     ├── header row: Donor Name | Phone Number | Total Donation | Actions
│       │     └── body rows:  <DonorRow />  (loading skeletons / empty state / data)
│       └── Footer: "Showing X–Y of Z donors" + pagination controls
└── <Toaster />
```

Sub-components to define in the same file (like `info/page.tsx` does with `ManageDonationDialog`):
- `AddDonorDialog` — dialog with empty form, calls `createDonor`.
- `EditDonorDialog({ donor })` — dialog prefilled, calls `updateDonor`.
- `DeleteDonorDialog({ donor })` — `AlertDialog` confirmation, calls `deleteDonor`.
- `DonorRow({ donor })` — one table row; renders avatar + name, phone, total, and the Edit + Delete action buttons.

### State in `DonorsPage`
- `const donors = useQuery(api.donors.getDonorsWithTotals);` — realtime list with totals.
- `const [search, setSearch] = useState("");`
- `const [page, setPage] = useState(0);`
- `const PAGE_SIZE = 10;`

### Derived data
- `filtered` = `donors` filtered client-side by `donor.name.toLowerCase().includes(search.toLowerCase())`. Recompute via `useMemo` on `[donors, search]`. Reset `page` to 0 whenever `search` changes (do this in the input's `onChange` or via `useEffect`).
- `paged` = `filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)`.
- `total = filtered.length`; `showingFrom = total === 0 ? 0 : page * PAGE_SIZE + 1`; `showingTo = Math.min((page + 1) * PAGE_SIZE, total)`.
- `pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))`.

---

## 7. Behaviors

### Search
- Bind the toolbar search `Input` to `search` state. Filter is client-side over the realtime list (per §3). No debounce needed (small list).
- Reset to page 0 when the query changes.

### Pagination
- Simple client-side pagination, `PAGE_SIZE = 10`.
- Footer text: ``Showing {showingFrom}–{showingTo} of {total} donors`` (use `–` en-dash to match the design).
- Buttons: `Prev` (disabled when `page === 0`), numbered page buttons `1..pageCount`, `Next` (disabled when `page === pageCount - 1`). Active page button: green bg. Match the design's compact `px-3 py-1 border` buttons.
- Keep it lightweight — no server pagination.

### Add New Donor (Dialog)
Fields (vertical stack, `gap-4`):
1. **Donor Name** — `Input`, required.
2. **Phone Number** — `Input`, optional.
3. **Profile Picture URL** — `Input type="url"`, required. **No file picker.** Helper text under the field: "Paste an image URL. File upload is coming soon."
On submit:
- Validate `name.trim()` and `imageUrl.trim()` are non-empty → else `toast.error("Name and image URL are required.")`.
- Call `createDonor({ name: name.trim(), imageUrl: imageUrl.trim(), phone: phone.trim() || undefined })`.
- On success: `toast.success("Donor added")`, close dialog, reset form.
- On failure: `toast.error("Failed to add donor")`.
Use local `useState` for the three fields; reset them when the dialog opens (mirror the `useEffect` reset pattern in `info/page.tsx`'s `ManageDonationDialog`).

### Edit Donor (Dialog)
Same three fields, prefilled from the donor. On save call `updateDonor({ donorId: donor._id, name, imageUrl, phone: phone || undefined })`. Same validation + toast pattern. Reset form on open.

### Delete Donor (AlertDialog)
- Triggered by the row's trash button.
- Title: "Delete donor?"; Description: `"This will permanently delete ${donor.name} and all of their donations. This action cannot be undone."`
- Confirm → `deleteDonor({ donorId: donor._id })`; toast success/error.

### Row actions
Two icon buttons in the Actions cell (right-aligned):
- **Edit** — opens `EditDonorDialog`.
- **Delete** — opens `DeleteDonorDialog`.
Style per the design: small square buttons, `p-2`, `border`, green for edit / red for delete, invert colors on hover.

---

## 8. shadcn components to use

All of these are **already installed** (see `components/ui/`). Do not reinstall them. If you find one missing, install with `npx shadcn@latest add <name>` — but none should be missing.

| Component | Used for |
|-----------|----------|
| `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell` | Donor list table |
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` | Add / Edit dialogs |
| `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel` | Delete confirmation |
| `Input` | Name, phone, imageUrl, search |
| `Label` | Form field labels |
| `Button` | Add / Edit / Delete / pagination |
| `Avatar`, `AvatarImage`, `AvatarFallback` | Donor avatar (image with initials fallback) |
| `Skeleton` | Loading rows |
| `Toaster` (from `sonner`) | Toast notifications |

Do **not** introduce `Select`, `DropdownMenu`, `Card`, or any other shadcn component unless strictly necessary — the design uses a plain bordered `<div>` card, so use a raw `div` for the card container (matches `info/page.tsx`).

---

## 9. Colors (use raw hex, NOT shadcn theme tokens)

The shadcn theme in `app/globals.css` uses a neutral oklch palette — it does **not** carry the Pitch Power brand colors. The existing pages (`layout.tsx`, `info/page.tsx`) apply brand colors as **arbitrary Tailwind hex values** (e.g. `text-[#006b3f]`). Follow that convention exactly. Do not try to remap shadcn tokens.

| Role | Hex | Tailwind usage |
|------|-----|----------------|
| Primary green (text, borders, active) | `#006b3f` | `text-[#006b3f]`, `border-[#006b3f]` |
| Primary-container green (button bg, active bg, strong borders) | `#008751` | `bg-[#008751]`, `border-[#008751]` |
| On-primary (text on green) | `#fdfff9` | `text-[#fdfff9]` |
| On-surface (primary text) | `#1c1b1b` | `text-[#1c1b1b]` |
| On-surface-variant (secondary text) | `#3e4a41` | `text-[#3e4a41]` |
| Surface / background | `#fcf9f8` | `bg-[#fcf9f8]` (page bg comes from layout) |
| Surface-container-lowest (card bg) | `#ffffff` | `bg-white` |
| Surface-container-low (zebra / hover) | `#f6f3f2` | `bg-[#f6f3f2]` |
| Surface-container (hover bg) | `#f0eded` | `bg-[#f0eded]` / `hover:bg-[#f0eded]` |
| Surface-container-high (table header bg, avatar fallback bg) | `#eae7e7` | `bg-[#eae7e7]` |
| Surface-container-highest / surface-variant (borders) | `#e5e2e1` | `border-[#e5e2e1]` |
| Secondary gold (Add button bg) | `#7a590c` | `bg-[#7a590c]` |
| On-secondary-container (gold hover) | `#78580b` | `hover:bg-[#78580b]` |
| Error (delete) | `#ba1a1a` | `text-[#ba1a1a]`, `border-[#ba1a1a]` |
| On-error (text on error hover) | `#ffffff` | `hover:bg-[#ba1a1a] hover:text-[#ffffff]` |

### Specific styling to match the design
- **"Add New Donor" button:** `bg-[#7a590c] text-[#fdfff9] hover:bg-[#78580b] border-2 border-transparent shadow-[4px_4px_0px_#006b3f] flex items-center gap-2 uppercase font-bold tracking-[0.05em] text-sm px-6 py-2`. Icon: `<UserPlus className="size-4" />`.
- **Card container:** `bg-white border-2 border-[#e5e2e1] p-6 shadow-[8px_8px_0px_#f0eded]`.
- **Table header row:** `bg-[#eae7e7] border-b-2 border-[#008751]`. Header cells: `p-4 text-sm font-bold uppercase tracking-[0.05em] text-[#1c1b1b]`. Actions header: add `text-right`.
- **Body rows:** `border-b border-[#e5e2e1] hover:bg-[#f0eded]`. Optional zebra: even rows `bg-[#f6f3f2]` (matches `info/page.tsx`).
- **Donor name cell:** `p-4 flex items-center gap-3`. Avatar `size-10 rounded-full`, fallback `bg-[#eae7e7] text-[#006b3f] font-bold` showing `initials(name)`. Name: `font-bold text-[#1c1b1b]`.
- **Phone cell:** `p-4 text-[#3e4a41]`.
- **Total Donation cell:** `p-4 font-[family-name:var(--font-anton)] text-[#006b3f] text-[20px]`. Value: `formatEur(donor.totalDonated)`.
- **Actions cell:** `p-4 text-right`. Edit button: `p-2 bg-white border border-[#008751] text-[#006b3f] hover:bg-[#008751] hover:text-[#fdfff9]` with `<Pencil className="size-4" />`. Delete button: same shape but `border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white` with `<Trash2 className="size-4" />`.
- **Search input (toolbar):** `pl-10 pr-4 py-2 border-2 border-[#e5e2e1] bg-white text-[#1c1b1b] focus:outline-none focus:border-[#006b3f] w-full` with a `<Search className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7a70]" />` icon. Wrap in a `relative w-96` container.
- **Filter / Download placeholder buttons (optional):** render as `p-2 border border-[#e5e2e1] text-[#3e4a41]` non-functional buttons (or omit entirely — they are not part of CRUD). If rendered, do not wire any behavior.
- **Pagination buttons:** `px-3 py-1 border border-[#e5e2e1] hover:bg-[#f0eded] disabled:opacity-50`. Active page: `border-[#008751] bg-[#008751] text-[#fdfff9]`.
- **Sharp corners:** inputs, table, and card use `rounded-none` (brutalist-athletic aesthetic). The shadcn `Dialog` keeps its default `rounded-xl` — do not override.

---

## 10. Typography

Fonts are already loaded in `app/admin/layout.tsx` as CSS variables:
- `--font-anton` (Anton) — headlines, all-caps.
- `--font-be-vietnam` (Be Vietnam Pro) — body / interface (default body font).

Usage:
- **Page title "Donor Management":** `font-[family-name:var(--font-anton)] text-[32px] leading-[40px] text-[#006b3f] uppercase tracking-wide`.
- **Table header labels:** `text-sm font-bold uppercase tracking-[0.05em]` (label-bold, Be Vietnam Pro via default body).
- **Donor name:** `font-bold text-[#1c1b1b]`.
- **Total Donation value:** `font-[family-name:var(--font-anton)] text-[#006b3f] text-[20px]`.
- **Footer text:** `text-sm text-[#3e4a41]`.

---

## 11. Helpers

Define these at the top of the file (mirror `info/page.tsx`'s `formatEur` / `formatDate`):

```ts
function formatEur(n: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
```

> Note: `info/page.tsx` uses `maximumFractionDigits: 0` for its large stat tiles. Here we want cents in the per-donor total, so use `minimumFractionDigits: 2, maximumFractionDigits: 2` (the design shows `$2,450.00`).

---

## 12. Loading, empty, and error states

Match `info/page.tsx`:
- **Loading** (`donors === undefined`): render `PAGE_SIZE` skeleton rows using `<Skeleton>` (e.g. `<Skeleton className="h-10 w-full" />` per cell).
- **Empty** (`donors !== undefined && donors.length === 0`): one row, `<TableCell colSpan={4} className="p-8 text-center text-[#3e4a41]">No donors yet.</TableCell>`.
- **Search with no matches:** one row, `colSpan={4}`, text `"No donors match "{search}".`".
- **Mutation errors:** caught with `try/catch` → `toast.error(...)` (see §7). Do not throw to the UI.

---

## 13. Layout wrapper

Wrap the page content in a `<main>` consistent with `info/page.tsx` but sized to the design's 1200px canvas and without the top-bar offset (no top bar):

```tsx
<main className="flex-1 w-full max-w-[1200px] mx-auto px-8 py-12 flex flex-col gap-6">
  {/* header row + card */}
</main>
```

End the component with `<Toaster />` (same as `info/page.tsx`).

---

## 14. Reference: how `info/page.tsx` does things to mirror

- `"use client"`; imports from `convex/react`, `@/convex/_generated/api`, `sonner`.
- `useQuery(api.donations.getTotalRaised)` returns `number | undefined`.
- `useMutation(api.donations.updateDonation)` / `deleteDonation`.
- Sub-component `ManageDonationDialog` holds its own `open` state and resets the form in a `useEffect` on `open`.
- `AlertDialog` nested inside `DialogFooter` for delete.
- `Skeleton` rows while `=== undefined`; empty-state row when `length === 0`.
- `<Toaster />` rendered once at the bottom of the page.

Copy these patterns verbatim in spirit.

---

## 15. Acceptance checklist

Before declaring done, verify:
- [ ] `app/admin/donors/page.tsx` is a `"use client"` component rendering the full Donor Management UI.
- [ ] `getDonorsWithTotals` query added to `convex/donors.ts` and used for the list; no other Convex file changed.
- [ ] No new Convex functions besides `getDonorsWithTotals`.
- [ ] Table shows: Donor Name (avatar + name), Phone Number, Total Donation, Actions.
- [ ] Total Donation comes from `donor.totalDonated` (server-computed) — no client-side summing of donations.
- [ ] Add New Donor dialog: name + phone + imageUrl URL field, **no file upload**. Calls `createDonor`.
- [ ] Edit dialog prefills and calls `updateDonor`.
- [ ] Delete uses `AlertDialog` confirmation and calls `deleteDonor`; copy mentions donations are also removed.
- [ ] Search filters the list client-side; pagination works (10/page, Prev/Next, active page highlighted).
- [ ] Loading skeletons, empty state, and no-match state all render correctly.
- [ ] Toasts on success/failure of every mutation.
- [ ] Colors are raw hex from §9; fonts use `--font-anton` / `--font-be-vietnam`; sharp corners on table/inputs/card.
- [ ] **No authentication code added.**
- [ ] `app/admin/info/page.tsx`, `app/admin/donations/page.tsx`, and `app/admin/layout.tsx` are **not modified**.
- [ ] `npx tsc --noEmit` passes (no type errors).
- [ ] `npm run dev` — the page loads at `/admin/donors`, realtime updates after add/edit/delete.

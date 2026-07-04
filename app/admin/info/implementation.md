# Admin Dashboard — Implementation Plan

> **Audience:** an AI implementer with a smaller context window. Follow this file step‑by‑step. Do not improvise outside it.

You are implementing the **Admin Dashboard** page for the ASD Soccer Club crowdfunding app. The design already exists as a static HTML mockup at `app/admin/screenshots/info.html`. Your job is to reproduce that design as a real **Next.js (App Router) + React + TypeScript** page that reads/writes data through **Convex**, styled with **Tailwind CSS** and **shadcn/ui** components.

---

## 0. Hard rules (read first)

1. **Use ONLY existing Convex functions.** Do **not** create, edit, or add any new function in `convex/`. All queries/mutations you need already exist (listed in §5).
2. **Style with Tailwind CSS** utility classes. Do **not** write custom CSS files. Inline `style={{}}` is forbidden except where this plan explicitly gives one.
3. **Use shadcn/ui components** for all primitives (cards, table, buttons, dialogs, inputs, etc.). Every component listed in §4 is **already installed** under `components/ui/`. If (and only if) one is missing, install it with `npx shadcn@latest add <name>`.
4. **Stay faithful to `app/admin/screenshots/info.html`.** Same layout, same sections, same copy text ("Fund Overview", "Manage donations for the new club bus.", "Recent Activity", "ASD ADMIN", etc.).
5. **Scope:** implement **only the dashboard page** (`app/admin/info/page.tsx`) and the **shared admin shell** (`app/admin/layout.tsx`). Do **not** touch `app/admin/donors/page.tsx` or `app/admin/donations/page.tsx` (they are stubs for a separate task).
6. **No authentication in this task.** Clerk is referenced in the project docs but is **not installed** in `package.json` and the Convex provider is the plain `ConvexProvider` (see `app/ConvexClientProvider.tsx`). Do **not** add auth gating. Treat the admin route as accessible. Leave auth for a later task.
7. Before writing any code, read `convex/_generated/ai/guidelines.md` (Convex rules that override training data) and heed `AGENTS.md` (this Next.js version has breaking changes vs. training data).
8. Keep all business logic in Convex (already done). React components only render UI, call queries/mutations, and format display values. Do **not** recompute totals in React — use the Convex query.

---

## 1. File plan

| File | Action | Purpose |
|------|--------|---------|
| `app/admin/layout.tsx` | **Rewrite** | Shared admin shell: loads brand fonts, renders a full‑height flex container with `{children}`. (The sidebar lives in the page — see §2.) |
| `app/admin/info/page.tsx` | **Rewrite** | The dashboard: sidebar + header + stats + recent‑activity table + manage‑donation dialog. `"use client"`. |
| `lib/constants.ts` | **Create** | The fundraising `GOAL` constant (euros). Not a Convex function — a client‑side constant. |

Do **not** create any other files. Do **not** modify `convex/*`, `app/layout.tsx`, `app/globals.css`, or `components/ui/*`.

---

## 2. Layout: `app/admin/layout.tsx`

This is a **server component**. It loads the two brand fonts with `next/font/google` and provides a full‑height flex wrapper so the page’s sidebar+main can sit side by side.

Replace the current stub with:

```tsx
import type { ReactNode } from "react";
import { Anton, Be_Vietnam_Pro } from "next/font/google";

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`${anton.variable} ${beVietnam.variable} flex min-h-screen bg-[#fcf9f8] text-[#1c1b1b]`}
    >
      {children}
    </div>
  );
}
```

> The page uses the CSS variables `--font-anton` and `--font-be-vietnam` via arbitrary Tailwind classes (see §3). Root layout (`app/layout.tsx`) already wraps the app in `ConvexClientProvider`, so Convex hooks work here.

---

## 3. Colors, fonts, spacing (use these exact values)

The project’s `app/globals.css` uses neutral shadcn tokens, **not** the brand palette. So use **Tailwind arbitrary‑value classes with these hex values** directly. Do not try to remap shadcn tokens.

### Brand colors

| Token | Hex | Use for |
|------|-----|---------|
| Primary green (fill/border) | `#008751` | card borders, sidebar active bg, table header bottom border, Manage button border/hover bg |
| Primary green (text accent) | `#006b3f` | "Fund Overview" title, "ASD ADMIN" wordmark, stat value for Total Donations, amounts in the table |
| Gold (bright) | `#fed17b` | "Remaining Goal" stat value text |
| Gold (deep) | `#c9a050` | optional gold accents (badges) — not required by the mockup |
| On‑surface (charcoal) | `#1c1b1b` | primary text, "Total Donors" stat value |
| On‑surface‑variant | `#3e4a41` | labels, subtitle, dates, inactive nav text |
| Surface (page bg) | `#fcf9f8` | page background (set on layout wrapper) |
| Card surface | `#ffffff` | stat cards, table container, sidebar |
| Surface‑container‑low | `#f6f3f2` | zebra row alt background |
| Surface‑container‑high | `#eae7e7` | table header row background |
| Surface‑variant (divider) | `#e5e2e1` | row dividers, sidebar bottom border |
| On‑primary‑container | `#fdfff9` | text on the active (green) nav item |

### Fonts (apply with arbitrary family classes)

| Role | Class | Font |
|------|-------|------|
| Headlines / display / wordmark | `font-[family-name:var(--font-anton)]` | Anton |
| Body / labels / table | `font-[family-name:var(--font-be-vietnam)]` | Be Vietnam Pro |

All headlines are **uppercase**. Labels are `text-sm font-bold uppercase tracking-[0.05em]`.

### Type scale → Tailwind

| Design token | Tailwind classes |
|------|------|
| display‑lg (72/80) | `text-[72px] leading-[80px]` |
| headline‑xl (48/56) | `text-[48px] leading-[56px]` |
| headline‑lg (32/40) | `text-[32px] leading-[40px]` |
| body‑lg (18/28) | `text-[18px] leading-[28px]` |
| body‑md (16/24) | `text-base leading-6` |
| label‑bold | `text-sm font-bold uppercase tracking-[0.05em] leading-5` |

### Spacing → Tailwind

| Design token | Tailwind |
|------|------|
| section‑gap (80) | `py-20` / `mb-20` |
| grid‑margin (32) | `p-8` / `px-8` |
| grid‑gutter (24) | `gap-6` |
| stack‑md (24) | `mb-6` / `py-6` |

### Reusable “brutalist card” className

Use this exact string for the three stat cards and the table container (matches `.brutalist-border` + `.brutalist-card` in the mockup):

```
bg-white p-8 border-2 border-[#008751] transition-[border-width] hover:border-[3px]
```

---

## 4. shadcn/ui components to use

All are **already installed** in `components/ui/`. Import from `@/components/ui/<name>`.

| Component | Used for |
|-----------|----------|
| `Button` | "Manage" button, dialog Save/Delete/Cancel |
| `Card` (optional) | You may use raw `<div>` with the brutalist className instead; Card is fine too |
| `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell` | Recent Activity table |
| `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` | Manage‑donation modal |
| `AlertDialog` + parts | Confirm before deleting a donation |
| `Input` | Amount field in the manage dialog |
| `Textarea` | Note field in the manage dialog |
| `Label` | Field labels |
| `Skeleton` | Loading placeholders while Convex queries are `undefined` |
| `sonner` `toast` | Success/error feedback after mutations |

**Icons:** the mockup uses Google Material Symbols. **Do not** load Material Symbols. Use **`lucide-react`** (already a dependency) instead:
- Dashboard → `LayoutDashboard`
- Donor Management → `Users`
- Add Donations → `HandCoins` (or `Plus`)

If any shadcn component above is missing from `components/ui/`, install only that one:
```bash
npx shadcn@latest add <component-name>
```

---

## 5. Convex functions to use (EXACT — do not add new ones)

Import the API surface and types:

```ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
```

### Queries (read)

| What | Function | Args | Returns |
|------|----------|------|---------|
| Total € raised | `api.donations.getTotalRaised` | none | `number` |
| Latest 10 donations (with donor joined) | `api.donations.getLatestDonations` | none | `Array<{ ...donation, donor: Doc<"donors"> | null }>` |
| All donors (for the donor count) | `api.donors.getDonors` | none | `Doc<"donors">[]` |

### Mutations (write — inside the Manage dialog)

| What | Function | Args |
|------|----------|------|
| Edit a donation | `api.donations.updateDonation` | `{ donationId: Id<"donations">, amount: number, note?: string }` |
| Delete a donation | `api.donations.deleteDonation` | `{ donationId: Id<"donations"> }` |

**Important Convex argument rules** (these come from the existing validators in `convex/donations.ts`; the Convex server will throw if you violate them):
- `amount` must be a **positive, finite number** (`> 0`, not `NaN`/`Infinity`). Parse with `parseFloat()` and validate before calling.
- `note` is `v.optional(v.string())`. Pass **`undefined`** (not `null`, not `""`) when empty: `note: note.trim() ? note.trim() : undefined`.
- `donationId` must be a real `Id<"donations">` from the row you clicked.

Do not call `createDonation`, `searchDonationsByDonor`, etc. on this page — they belong on `/admin/donations`, not here.

---

## 6. The fundraising goal constant

`lib/constants.ts`:

```ts
// Total euros needed for the new club bus.
// Used to compute "Remaining Goal" = max(0, GOAL - totalRaised).
// Adjust this value when the real target is known.
export const FUNDRAISING_GOAL_EUR = 21000;
```

(21,000 € makes the mockup’s numbers consistent: 12,500 raised + 8,500 remaining = 21,000.)

---

## 7. Page structure: `app/admin/info/page.tsx`

This is a `"use client"` component. Top‑level layout mirrors the mockup: a flex row with a **Sidebar** and a **Main** area.

```
<div class="flex w-full">
  <Sidebar />            // hidden on mobile (hidden md:flex)
  <main class="flex-1 max-w-7xl mx-auto px-8 py-20 w-full">
    <Header />
    <Stats />
    <RecentActivity />
  </main>
</div>
```

You may inline everything in one file, or split `Sidebar` into `app/admin/_components/sidebar.tsx` (folder already exists). **Either is fine — pick one, do not over‑split.** A single file is simplest.

### 7.1 Sidebar

```
<aside class="hidden md:flex w-64 flex-col h-screen sticky top-0 bg-white border-r-2 border-[#008751]">
  <div class="p-8 border-b-2 border-[#e5e2e1]">
    <h1 class="font-[family-name:var(--font-anton)] text-[32px] leading-[40px] text-[#006b3f] uppercase tracking-tighter">ASD ADMIN</h1>
  </div>
  <nav class="flex-1 py-6 flex flex-col gap-2 px-4">
    {/* nav items — see below */}
  </nav>
</aside>
```

Nav items are Next.js `<Link>`s. Use `usePathname()` from `next/navigation` to mark the active one.

| Label | href | Icon (lucide) |
|-------|------|---------------|
| Dashboard | `/admin/info` | `LayoutDashboard` |
| Donor Management | `/admin/donors` | `Users` |
| Add Donations | `/admin/donations` | `HandCoins` |

Active item className:
```
flex items-center gap-3 px-4 py-3 bg-[#008751] text-[#fdfff9] text-sm font-bold uppercase tracking-[0.05em] rounded
```
Inactive item className:
```
flex items-center gap-3 px-4 py-3 text-[#3e4a41] hover:text-[#006b3f] transition-colors text-sm font-bold uppercase tracking-[0.05em] rounded
```
The active item’s icon should appear filled; lucide icons accept a `fill="currentColor"` prop when active.

> The “Dashboard” link points to `/admin/info` because that is where this page lives. (There is currently no `/admin` page — do not create one.)

### 7.2 Header

```
<header class="mb-20 flex justify-between items-end">
  <div>
    <h2 class="font-[family-name:var(--font-anton)] text-[48px] leading-[56px] text-[#006b3f] uppercase">Fund Overview</h2>
    <p class="text-[18px] leading-[28px] text-[#3e4a41] mt-2 font-[family-name:var(--font-be-vietnam)]">Manage donations for the new club bus.</p>
  </div>
</header>
```

### 7.3 Stats (3 cards)

```
<section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
  <StatCard label="Total Donations"   value={formatEur(total)}    valueClass="text-[#006b3f]" loading={!totalLoaded} />
  <StatCard label="Remaining Goal"    value={formatEur(remaining)} valueClass="text-[#fed17b]" loading={!totalLoaded} />
  <StatCard label="Total Donors"      value={donorsCount}          valueClass="text-[#1c1b1b]" loading={!donorsLoaded} />
</section>
```

`StatCard` markup (use the brutalist className from §3):
```
<div class="bg-white p-8 border-2 border-[#008751] transition-[border-width] hover:border-[3px]">
  <div class="text-[#3e4a41] text-sm font-bold uppercase tracking-[0.05em] mb-2">{label}</div>
  <div class={`font-[family-name:var(--font-anton)] text-[72px] leading-[80px] ${valueClass}`}>{value}</div>
</div>
```
While `loading`, render `<Skeleton className="h-[80px] w-full" />` in place of the value.

Data:
- `total` = `useQuery(api.donations.getTotalRaised)` → `number | undefined`.
- `donors` = `useQuery(api.donors.getDonors)` → `Doc<"donors">[] | undefined`.
- `remaining = Math.max(0, FUNDRAISING_GOAL_EUR - (total ?? 0))`.
- `donorsCount = donors?.length ?? 0`.

`formatEur(n)`: `new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)` → e.g. `€12,500`.

### 7.4 Recent Activity table

Section heading:
```
<h3 class="font-[family-name:var(--font-anton)] text-[32px] leading-[40px] text-[#1c1b1b] mb-6 uppercase">Recent Activity</h3>
```

Use shadcn `Table` inside a brutalist container:
```
<div class="bg-white border-2 border-[#008751] overflow-x-auto">
  <Table class="w-full text-left border-collapse">
    <TableHeader>
      <TableRow class="bg-[#eae7e7] border-b-2 border-[#008751] hover:bg-[#eae7e7]">
        <TableHead class="p-4 text-sm font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">Donor Name</TableHead>
        <TableHead class="p-4 ...">Amount</TableHead>
        <TableHead class="p-4 ...">Date</TableHead>
        <TableHead class="p-4 ... text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody class="text-base divide-y divide-[#e5e2e1]">
      {rows}
    </TableBody>
  </Table>
</div>
```

Data: `latest = useQuery(api.donations.getLatestDonations)` → array of `{ _id, donorId, amount, note, createdAt, donor }`.

Each row (zebra: add `bg-[#f6f3f2]` to every second row; all rows `hover:bg-[#f0eded]`):
```
<TableRow key={d._id} class="hover:bg-[#f0eded]">
  <TableCell class="p-4 font-bold">{d.donor?.name ?? "Unknown"}</TableCell>
  <TableCell class="p-4 text-[#006b3f] font-bold">{formatEur(d.amount)}</TableCell>
  <TableCell class="p-4 text-[#3e4a41]">{formatDate(d.createdAt)}</TableCell>
  <TableCell class="p-4 text-right">
    <ManageDonationDialog donation={d} />
  </TableCell>
</TableRow>
```

`formatDate(ms)`: `new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(ms))` → e.g. `Oct 24, 2024`.

**Empty state:** if `latest` is loaded and `latest.length === 0`, render one full‑width row: "No donations yet."
**Loading state:** if `latest === undefined`, render 4 `<TableRow>`s with `<Skeleton>` cells.

### 7.5 ManageDonationDialog (edit + delete)

A shadcn `Dialog` triggered by the "Manage" button. Trigger button className (matches mockup):
```
text-[#006b3f] hover:text-[#fdfff9] border border-[#008751] px-3 py-1 hover:bg-[#008751] transition-all text-sm font-bold uppercase tracking-[0.05em]
```
Use shadcn `<Button variant="outline" size="sm" className="...">` to get base behavior, then override colors with the className above.

Dialog content:
- `DialogHeader` / `DialogTitle`: "Manage Donation"
- `DialogDescription`: shows the donor name (read‑only): "Donor: {d.donor?.name ?? "Unknown"}"
- Form fields:
  - `Label` "Amount (€)" + `Input type="number" step="0.01"` bound to local state, initialized from `d.amount`.
  - `Label` "Note" + `Textarea` bound to local state, initialized from `d.note ?? ""`.
- `DialogFooter`:
  - **Save** (`Button`): validates `amount > 0` and finite, then calls `updateDonation({ donationId: d._id, amount, note: note.trim() ? note.trim() : undefined })`. On success: `toast.success("Donation updated")` and close. On error: `toast.error("Failed to update donation")`.
  - **Delete** (`AlertDialog`): trigger is a `Button` "Delete"; the alert asks "Delete this donation?" with a Confirm button that calls `deleteDonation({ donationId: d._id })`. On success: `toast.success("Donation deleted")` and close. On error: `toast.error("Failed to delete donation")`.
  - **Cancel** (`DialogClose` as `Button variant="ghost"`).

Wire mutations at the top of the dialog component:
```ts
const updateDonation = useMutation(api.donations.updateDonation);
const deleteDonation = useMutation(api.donations.deleteDonation);
```

Reset local form state whenever the dialog opens (use an `open` state + `useEffect`, or key the dialog content by `d._id`).

> The mockup’s "Manage" button has no menu behind it — it opens the edit modal directly. Do not build a dropdown.

### 7.6 Toaster

Render `<Toaster />` from `@/components/ui/sonner` once at the bottom of the page so `toast()` calls show up. (If `components/ui/sonner.tsx` already exports `Toaster`, use it; otherwise `npx shadcn@latest add sonner`.)

---

## 8. Implementation order (do this top to bottom)

1. Read `convex/_generated/ai/guidelines.md` and `AGENTS.md`.
2. Create `lib/constants.ts` (§6).
3. Rewrite `app/admin/layout.tsx` (§2). Run `npm run dev`; confirm the page at `/admin/info` still loads (fonts may warn until used — fine).
4. Scaffold `app/admin/info/page.tsx` as `"use client"` with the sidebar + header + empty stats/table sections using **static placeholder data**. Match the mockup visually first (colors, fonts, spacing) before wiring Convex.
5. Add the three Convex queries (§5) and replace placeholders with real data + `Skeleton` loading states (§7.3, §7.4).
6. Implement `ManageDonationDialog` with `updateDonation` + `deleteDonation` + `AlertDialog` confirm + `toast` (§7.5).
7. Add `<Toaster />`.
8. Verify (§9).

---

## 9. Acceptance checklist

- [ ] `/admin/info` visually matches `app/admin/screenshots/info.html`: sidebar with "ASD ADMIN" + 3 nav items, "Fund Overview" header, 3 stat cards, "Recent Activity" table with the 4 columns.
- [ ] Anton for headlines, Be Vietnam Pro for body; all headlines uppercase.
- [ ] Colors match §3 (greens `#008751`/`#006b3f`, gold `#fed17b`, charcoal `#1c1b1b`, surfaces as listed).
- [ ] Stats show real data from `getTotalRaised` + `getDonors`; Remaining = `GOAL − total`.
- [ ] Table shows `getLatestDonations` rows: donor name, € amount, formatted date, Manage button.
- [ ] Manage dialog edits amount/note via `updateDonation` and deletes via `deleteDonation` (with confirm), each followed by a toast.
- [ ] Loading states use `Skeleton`; empty table shows "No donations yet."
- [ ] No new Convex functions; no files changed outside the list in §1.
- [ ] `amount` validated positive/finite; empty `note` passed as `undefined`.
- [ ] No `any` types; imports use `@/` alias.

## 10. Do‑not list

- Do **not** add Clerk/auth.
- Do **not** create `/admin` page or implement `/admin/donors`, `/admin/donations`.
- Do **not** add a "create donation" form on this page (it lives on `/admin/donations`).
- Do **not** load Material Symbols; use `lucide-react`.
- Do **not** recompute totals in React; use `api.donations.getTotalRaised`.
- Do **not** edit `convex/`, `app/globals.css`, `app/layout.tsx`, or `components/ui/*`.

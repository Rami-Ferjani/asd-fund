# Donations Management Page — Implementation Plan

> **For the implementing AI:** Follow this plan top-to-bottom. Use shadcn/ui components + Tailwind for all styling. Use ONLY the Convex functions listed in each task — do **not** add new backend functions unless a task explicitly says so and the human has approved (see Task 0). Do **not** add any authentication — auth is a later task. Do **not** touch `app/admin/info/page.tsx` or `app/admin/donors/page.tsx`.

**Goal:** Turn the static HTML mock in `app/admin/screenshots/donations.html` into a real Next.js client component at `app/admin/donations/page.tsx` that performs CRUD against the Convex backend, is mobile-first responsive, and reuses the existing admin sidebar layout.

**Architecture:** A single client page composed of focused sub-components in `app/admin/donations/_components/`. Data comes from Convex realtime queries (`useQuery`) and writes go through Convex mutations (`useMutation`) with `sonner` toasts for feedback. The admin sidebar in `app/admin/layout.tsx` gets a mobile drawer so the three admin routes work on phones without breaking the existing desktop view.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Convex, `sonner`, `lucide-react`.

---

## Global Constraints

- **Currency is EUR (€), not USD ($).** The HTML mock uses `$`, but the project (200 Challenge = 100€, existing admin pages) uses euros. Format with `Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" })`. Ignore the `$` symbols in the mock.
- **Colors are hard-coded hex tokens** (the project does not wire DESIGN.md tokens into `tailwind.config.ts` — existing pages use raw hex). Use the palette below verbatim. Do **not** add new tokens to Tailwind config unless a task says to.
- **Fonts:** Anton via `font-[family-name:var(--font-anton)]` (headlines, uppercase), Be Vietnam Pro is the body default (set on the layout root via `--font-be-vietnam`).
- **"use client"** at the top of every file that uses hooks/Convex.
- **Convex imports:** `import { useQuery, useMutation } from "convex/react";` and `import { api } from "@/convex/_generated/api";`.
- **Toasts:** `import { toast } from "sonner";` and render `<Toaster />` once per page (see `app/admin/donors/page.tsx` for the pattern).
- **No auth.** No `useAuth`, no route guards, no `ctx.auth` — nothing.
- **No file upload.** The "Add New Donor" popup uses a text field for the profile picture URL only.
- **Scope:** Only `app/admin/donations/` and (for responsiveness) `app/admin/layout.tsx`. Leave `info` and `donors` pages untouched.
- **Mobile-first:** Every layout must work on a 360px phone first, then adapt at `sm`/`md`/`lg`. No horizontal scroll on phones. Tables become cards below `md`.
- **Before editing `app/admin/layout.tsx`**, run `impact({ target: "AdminLayout", direction: "upstream" })` per project CLAUDE.md and report the blast radius. (It is consumed by all three admin routes, so expect MEDIUM/HIGH — call it out and proceed carefully, desktop view must not change.)

### Color palette (use these hex values)

| Role | Hex |
|------|-----|
| Primary green (text/accents) | `#006b3f` |
| Primary container / borders / hover bg | `#008751` |
| On-primary (text on green) | `#fdfff9` |
| Secondary gold (CTA button bg) | `#7a590c` |
| Secondary hover bg | `#78580b` |
| Secondary-fixed (gold highlight text) | `#fed17b` |
| Error | `#ba1a1a` |
| On-error | `#ffffff` |
| Background / surface | `#fcf9f8` |
| Card surface (lowest) | `#ffffff` |
| Surface container low | `#f6f3f2` |
| Surface container | `#f0eded` |
| Surface container high | `#eae7e7` |
| Surface variant (borders) | `#e5e2e1` |
| On-surface (primary text) | `#1c1b1b` |
| On-surface-variant (secondary text) | `#3e4a41` |
| Outline | `#6e7a70` |
| Brutalist shadow color | `#f0eded` |

### shadcn components used (all already installed — do NOT reinstall)

`button`, `input`, `textarea`, `label`, `select`, `table`, `dialog`, `alert-dialog`, `skeleton`, `avatar`, `sonner` (Toaster), `badge`, `separator`.

Available at `@/components/ui/*`. **One component is missing and must be installed in Task 1:** `sheet` (for the mobile sidebar drawer).

### Convex functions available (do not add new ones unless Task 0 is approved)

`convex/donors.ts`: `getDonors`, `getDonorById`, `searchDonors`, `createDonor`, `updateDonor`, `deleteDonor`, `getDonorsWithTotals`.

`convex/donations.ts`: `getDonations`, `getDonationById`, `getDonationsByDonor`, `searchDonationsByDonor`, `createDonation`, `updateDonation`, `deleteDonation`, `getTotalRaised`, `getLatestDonations`.

---

## ⚠️ Backend gap — REQUIRES HUMAN APPROVAL (Task 0)

The "Recent Donations" table needs **all donations joined with their donor** (donor name + phone + amount + date), paginated, with a total count for "Showing X–Y of N". No existing query does this:

- `getLatestDonations` — returns donations with `donor` attached, but capped at `.take(10)` and no total count.
- `getDonations` — returns all donations but **without donor info**.

Two paths:

- **Option A (recommended):** Add one new query `getDonationsWithDonors` to `convex/donations.ts` — mirrors the existing `getDonorsWithTotals` + `getLatestDonations` join pattern, returns all donations (newest first) with `donor` attached. This is the architecturally clean choice and matches the "frontend prefers one composed query" invariant in `context/architecture-context.md`.
- **Option B (no backend change):** Use existing `getDonations` + `getDonors` and join them client-side with a `Record<Id, Donor>` map. Works today, but puts joining logic in React (the architecture doc says joins belong in Convex).

> **STOP and ask the human which option before writing any code.** If they pick Option A, do Task 0 first. If Option B, skip Task 0 and follow the fallback note in Task 5.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `app/admin/donations/page.tsx` (modify) | Page shell: header, 12-col grid (form + list), `<Toaster/>`. Orchestrates queries. |
| `app/admin/donations/_components/AddDonorDialog.tsx` (create) | Popup with name / phone / image-URL fields; calls `donors.createDonor`. |
| `app/admin/donations/_components/AddDonationForm.tsx` (create) | Left column: donor `<Select>` with "+ Add New Donor" option, amount input, optional note, "Process Donation" button. Calls `donations.createDonation`. |
| `app/admin/donations/_components/DonationsTable.tsx` (create) | Right column: desktop `<Table>` + mobile card list, pagination footer, empty/loading states. |
| `app/admin/donations/_components/DonationRow.tsx` (create) | One desktop table row + one mobile card, with Edit/Delete actions. |
| `app/admin/donations/_components/EditDonationDialog.tsx` (create) | Edit amount + note for a donation. Calls `donations.updateDonation`. |
| `app/admin/donations/_components/DeleteDonationDialog.tsx` (create) | Confirm delete. Calls `donations.deleteDonation`. |
| `lib/format.ts` (create) | `formatEur`, `formatDate`, `initials` helpers (currently duplicated in info/donors pages; centralize here for the donations page — do NOT refactor the other pages). |
| `app/admin/layout.tsx` (modify) | Add mobile sidebar drawer (`Sheet`) + a mobile top bar. Keep desktop `md:flex w-64` sidebar exactly as-is. |
| `convex/donations.ts` (modify — Task 0 only) | Add `getDonationsWithDonors` query (gated). |

---

## Task 0 (gated on human approval): Add `getDonationsWithDonors` query

**Only do this task if the human chose Option A.** Skip entirely for Option B.

**Files:**
- Modify: `convex/donations.ts` (append at end of file)

**Produces:** `api.donations.getDonationsWithDonors` — a `query` returning `{ ...donation, donor: Donor | null }[]` ordered newest-first, no cap.

- [ ] **Step 1: Add the query**

Append to `convex/donations.ts`:

```ts
// Returns every donation with its donor attached, newest first.
// Mirrors getLatestDonations but without the take(10) cap so the admin
// donations table can paginate client-side over the full history.
export const getDonationsWithDonors = query({
  args: {},
  handler: async (ctx) => {
    const donations = await ctx.db
      .query("donations")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    const withDonors = await Promise.all(
      donations.map(async (donation) => {
        const donor = await ctx.db.get(donation.donorId);
        return { ...donation, donor };
      }),
    );

    return withDonors;
  },
});
```

- [ ] **Step 2: Verify the backend compiles**

Run: `npx convex dev` (or `npx convex codegen` then `tsc --noEmit`).
Expected: no type errors; `api.donations.getDonationsWithDonors` is now callable.

- [ ] **Step 3: Commit**

```bash
git add convex/donations.ts
git commit -m "feat: add getDonationsWithDonors query for admin donations table"
```

---

## Task 1: Mobile-first admin sidebar (layout)

**Files:**
- Modify: `app/admin/layout.tsx`
- Install: `sheet` shadcn component

**Why:** The current sidebar is `hidden md:flex w-64` — on mobile there is no navigation at all. Add a mobile top bar with a hamburger that opens the same nav in a `Sheet` drawer. The desktop sidebar stays untouched.

- [ ] **Step 1: Install the missing shadcn component**

Run: `npx shadcn@latest add sheet`
Expected: creates `components/ui/sheet.tsx`. (If the CLI prompts for registry/style, accept the project defaults already in `components.json`.)

- [ ] **Step 2: Run impact analysis before editing (CLAUDE.md requirement)**

Run (via GitNexus MCP): `impact({ target: "AdminLayout", direction: "upstream" })`
Report the blast radius to the human. It is used by `/admin/info`, `/admin/donors`, `/admin/donations` — MEDIUM risk. Desktop classes are preserved, so actual regression risk is low.

- [ ] **Step 3: Rewrite `app/admin/layout.tsx`**

Replace the whole file with:

```tsx
"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anton, Be_Vietnam_Pro } from "next/font/google";
import { LayoutDashboard, Users, HandCoins, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

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

const links = [
  { label: "Dashboard", href: "/admin/info", icon: LayoutDashboard },
  { label: "Donor Management", href: "/admin/donors", icon: Users },
  { label: "Add Donations", href: "/admin/donations", icon: HandCoins },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={
              active
                ? "flex items-center gap-3 px-4 py-3 bg-[#008751] text-[#fdfff9] text-sm font-bold uppercase tracking-[0.05em] rounded"
                : "flex items-center gap-3 px-4 py-3 text-[#3e4a41] hover:text-[#006b3f] transition-colors text-sm font-bold uppercase tracking-[0.05em] rounded"
            }
          >
            <link.icon className="size-5" fill={active ? "currentColor" : "none"} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

function DesktopSidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col h-screen sticky top-0 bg-white border-r-2 border-[#008751]">
      <div className="p-8 border-b-2 border-[#e5e2e1]">
        <h1 className="font-[family-name:var(--font-anton)] text-[32px] leading-[40px] text-[#006b3f] uppercase tracking-tighter">
          ASD ADMIN
        </h1>
      </div>
      <NavLinks />
    </aside>
  );
}

function MobileTopBar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b-2 border-[#008751]">
      <h1 className="font-[family-name:var(--font-anton)] text-[20px] leading-[24px] text-[#006b3f] uppercase tracking-tighter">
        ASD ADMIN
      </h1>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="Open navigation"
            className="p-2 border-2 border-[#008751] text-[#006b3f] rounded"
          >
            <Menu className="size-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-white border-r-2 border-[#008751]">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="p-8 border-b-2 border-[#e5e2e1]">
            <SheetClose asChild>
              <h1 className="font-[family-name:var(--font-anton)] text-[24px] leading-[28px] text-[#006b3f] uppercase tracking-tighter">
                ASD ADMIN
              </h1>
            </SheetClose>
          </div>
          <NavLinks onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${anton.variable} ${beVietnam.variable} flex min-h-screen bg-[#fcf9f8] text-[#1c1b1b]`}
    >
      <DesktopSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileTopBar />
        {children}
      </div>
    </div>
  );
}
```

Notes:
- Desktop sidebar markup is byte-for-byte the same classes as before (`hidden md:flex w-64 ...`). Desktop view is unchanged.
- On mobile, content gets a sticky top bar; the drawer slides in from the left.
- `min-w-0` on the content wrapper prevents flex overflow causing horizontal scroll.

- [ ] **Step 4: Verify desktop is unchanged + mobile drawer works**

Run the app (`npm run dev`), visit `/admin/donations` at ≥768px: sidebar visible, no top bar. Resize <768px: sidebar hidden, top bar with hamburger appears, drawer opens and closes, links navigate. Run `detect_changes()` before any commit.

- [ ] **Step 5: Commit**

```bash
git add app/admin/layout.tsx components/ui/sheet.tsx
git commit -m "feat(admin): mobile-first sidebar drawer"
```

---

## Task 2: Formatting helpers

**Files:**
- Create: `lib/format.ts`

- [ ] **Step 1: Create the file**

```ts
// Shared formatting helpers for the admin dashboard.
// (info/donors pages still have their own copies — do not refactor them yet.)

export function formatEur(n: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(ms: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(ms));
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/format.ts
git commit -m "feat: shared format helpers"
```

---

## Task 3: `AddDonorDialog`

**Files:**
- Create: `app/admin/donations/_components/AddDonorDialog.tsx`

**Produces:** A controlled `Dialog` exposing a trigger button. Calls `api.donors.createDonor` with `{ name, imageUrl, phone? }`. On success, calls `onDonorCreated(donorId)` so the parent form can auto-select the new donor.

**Consumes:** `api.donors.createDonor` mutation.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export function AddDonorDialog({
  onDonorCreated,
  trigger,
}: {
  onDonorCreated?: (donorId: Id<"donors">) => void;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const createDonor = useMutation(api.donors.createDonor);

  useEffect(() => {
    if (open) {
      setName("");
      setPhone("");
      setImageUrl("");
    }
  }, [open]);

  async function handleSubmit() {
    if (!name.trim() || !imageUrl.trim()) {
      toast.error("Name and image URL are required.");
      return;
    }
    try {
      const id = await createDonor({
        name: name.trim(),
        imageUrl: imageUrl.trim(),
        phone: phone.trim() || undefined,
      });
      toast.success("Donor added");
      onDonorCreated?.(id);
      setOpen(false);
    } catch {
      toast.error("Failed to add donor");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            type="button"
            className="text-[#7a590c] hover:text-[#78580b] font-bold text-xs uppercase tracking-[0.05em] flex items-center gap-1 bg-transparent shadow-none border-0"
          >
            <UserPlus className="size-4" />
            + Add New Donor
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Donor</DialogTitle>
          <DialogDescription>Create a donor to associate with a donation.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="add-name">Donor Name</Label>
            <Input id="add-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="add-phone">Phone Number</Label>
            <Input id="add-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+353 87 123 4567" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="add-image">Profile Picture URL</Label>
            <Input id="add-image" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/photo.jpg" />
            <p className="text-xs text-[#3e4a41]">Paste an image URL. File upload is coming soon.</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="sm">Cancel</Button>
          </DialogClose>
          <Button size="sm" onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/donations/_components/AddDonorDialog.tsx
git commit -m "feat(donations): add donor dialog"
```

---

## Task 4: `AddDonationForm` (left column)

**Files:**
- Create: `app/admin/donations/_components/AddDonationForm.tsx`

**Consumes:** `api.donors.getDonors` (for the select), `api.donations.createDonation`.

**Produces:** A form that lets the admin pick an existing donor, add a new donor (via `AddDonorDialog`), enter an amount and optional note, and submit. Resets on success.

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { HandCoins } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AddDonorDialog } from "./AddDonorDialog";

export function AddDonationForm() {
  const donors = useQuery(api.donors.getDonors);
  const createDonation = useMutation(api.donations.createDonation);

  const [donorId, setDonorId] = useState<Id<"donors"> | "">("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  function reset() {
    setDonorId("");
    setAmount("");
    setNote("");
  }

  async function handleSubmit() {
    if (!donorId) {
      toast.error("Please select a donor.");
      return;
    }
    const parsed = parseFloat(amount);
    if (!(parsed > 0) || !Number.isFinite(parsed)) {
      toast.error("Donation amount must be a positive number.");
      return;
    }
    try {
      await createDonation({
        donorId,
        amount: parsed,
        note: note.trim() ? note.trim() : undefined,
      });
      toast.success("Donation processed");
      reset();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to process donation");
    }
  }

  return (
    <div className="bg-white border border-[#e5e2e1] p-5 sm:p-6 shadow-[8px_8px_0px_#f0eded] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#e5e2e1]">
        <HandCoins className="size-6 text-[#006b3f]" />
        <h3 className="font-[family-name:var(--font-anton)] text-[20px] leading-[24px] text-[#1c1b1b] uppercase">
          New Donation
        </h3>
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
      >
        {/* Donor select */}
        <div className="flex flex-col gap-1">
          <Label className="text-[#1c1b1b] uppercase tracking-[0.05em] text-xs font-bold">Donor Name</Label>
          {donors === undefined ? (
            <Skeleton className="h-11 w-full" />
          ) : (
            <Select value={donorId} onValueChange={(v) => setDonorId(v as Id<"donors"> | "")}>
              <SelectTrigger className="w-full border border-[#e5e2e1] bg-[#fcf9f8] focus:border-[#008751] rounded-none h-11">
                <SelectValue placeholder="Select or search donor..." />
              </SelectTrigger>
              <SelectContent>
                {donors.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <AddDonorDialog
            onDonorCreated={(id) => setDonorId(id)}
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-1">
          <Label className="text-[#1c1b1b] uppercase tracking-[0.05em] text-xs font-bold">Donation Amount (€)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-[family-name:var(--font-anton)] text-[#006b3f] text-xl">$</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 border border-[#e5e2e1] bg-[#fcf9f8] focus:border-[#008751] rounded-none h-11 font-[family-name:var(--font-anton)] text-[20px] text-[#1c1b1b]"
            />
          </div>
        </div>

        {/* Note */}
        <div className="flex flex-col gap-1">
          <Label className="text-[#1c1b1b] uppercase tracking-[0.05em] text-xs font-bold">Message (Optional)</Label>
          <Textarea
            rows={3}
            placeholder="Add a public message..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="resize-none border border-[#e5e2e1] bg-[#fcf9f8] focus:border-[#008751] rounded-none"
          />
        </div>

        <Button
          type="submit"
          className="mt-2 bg-[#7a590c] text-[#fdfff9] hover:bg-[#78580b] font-bold uppercase tracking-[0.05em] text-sm py-4 px-6 shadow-[4px_4px_0px_#006b3f] border-2 border-transparent rounded-none h-12"
        >
          <HandCoins className="size-5" />
          Process Donation
        </Button>
      </form>
    </div>
  );
}
```

Notes for the implementer:
- The project uses `lucide-react` for icons (see `app/admin/layout.tsx`, `app/admin/donors/page.tsx`). Only `HandCoins` is needed here.
- The `$` prefix glyph in the mock is kept as a visual accent inside the amount field; the label says "(€)" and the stored value is a plain number interpreted as euros.
- shadcn `Select` does not support a literal "+ Add New Donor" `<option>` that opens a dialog. Instead, the `AddDonorDialog` trigger button sits **below** the select (matching the mock's secondary "+ Add New Donor" button). When a new donor is created, `onDonorCreated` auto-selects them in the `Select`.

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors in this file.

- [ ] **Step 3: Commit**

```bash
git add app/admin/donations/_components/AddDonationForm.tsx
git commit -m "feat(donations): add donation form"
```

---

## Task 5: `DonationsTable` + `DonationRow` (right column, responsive)

**Files:**
- Create: `app/admin/donations/_components/DonationsTable.tsx`
- Create: `app/admin/donations/_components/DonationRow.tsx`

**Consumes (Option A):** `api.donations.getDonationsWithDonors`.
**Consumes (Option B fallback):** `api.donations.getDonations` + `api.donors.getDonors`, joined client-side.

**Produces:** A responsive list — desktop `<Table>` (≥`md`) with Donor / Amount / Date / Actions columns + the **missing Edit and Delete buttons** the mock lacks; mobile cards (`<` `md`) with comfortable touch targets; loading skeletons; empty state; client-side pagination footer with "Showing X–Y of N".

- [ ] **Step 1: Decide the data source**

If Task 0 was done (Option A): `const rows = useQuery(api.donations.getDonationsWithDonors);`
If Option B: see the fallback block at the end of this task.

- [ ] **Step 2: Create `DonationRow.tsx`**

```tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { TableRow, TableCell } from "@/components/ui/table";
import { formatEur, formatDate, initials } from "@/lib/format";
import { EditDonationDialog } from "./EditDonationDialog";
import { DeleteDonationDialog } from "./DeleteDonationDialog";

export type DonationWithDonor = {
  _id: string;
  donorId: string;
  amount: number;
  note?: string;
  createdAt: number;
  donor: { name: string; phone?: string; imageUrl: string } | null;
};

export function DonationDesktopRow({ d, index }: { d: DonationWithDonor; index: number }) {
  return (
    <TableRow className={`hover:bg-[#fcf9f8] ${index % 2 === 1 ? "bg-[#f6f3f2]" : ""}`}>
      <TableCell className="p-4">
        <div className="font-bold text-[#1c1b1b] text-base">{d.donor?.name ?? "Unknown"}</div>
        <div className="text-sm text-[#3e4a41]">{d.donor?.phone || "—"}</div>
      </TableCell>
      <TableCell className="p-4 font-[family-name:var(--font-anton)] text-[#006b3f] text-[20px]">
        {formatEur(d.amount)}
      </TableCell>
      <TableCell className="p-4 text-[#3e4a41]">{formatDate(d.createdAt)}</TableCell>
      <TableCell className="p-4 text-right">
        <div className="flex justify-end gap-2">
          <EditDonationDialog donation={d} />
          <DeleteDonationDialog donation={d} />
        </div>
      </TableCell>
    </TableRow>
  );
}

export function DonationMobileCard({ d }: { d: DonationWithDonor }) {
  return (
    <div className="bg-white border border-[#e5e2e1] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-[#1c1b1b] truncate">{d.donor?.name ?? "Unknown"}</div>
          <div className="text-sm text-[#3e4a41] truncate">{d.donor?.phone || "—"}</div>
        </div>
        <div className="font-[family-name:var(--font-anton)] text-[#006b3f] text-[20px] whitespace-nowrap">
          {formatEur(d.amount)}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-[#3e4a41]">{formatDate(d.createdAt)}</span>
        <div className="flex gap-2">
          <EditDonationDialog donation={d} />
          <DeleteDonationDialog donation={d} />
        </div>
      </div>
    </div>
  );
}
```

> The mock's table only shows edit/delete on `group-hover` (`opacity-0 group-hover:opacity-100`). That pattern is invisible on touch devices. **Always show the Edit and Delete buttons** (no hover gating) so they work on mobile — this also adds the two buttons the mock is missing on each row.

- [ ] **Step 3: Create `DonationsTable.tsx`**

```tsx
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Filter, Download } from "lucide-react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DonationDesktopRow,
  DonationMobileCard,
  type DonationWithDonor,
} from "./DonationRow";

const PAGE_SIZE = 10;

export function DonationsTable() {
  // Option A (Task 0 done):
  const rows = useQuery(api.donations.getDonationsWithDonors);
  // Option B fallback: see the bottom of this task.

  const [page, setPage] = useState(0);

  const total = rows?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const paged = useMemo(() => {
    if (!rows) return undefined;
    return rows.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);
  }, [rows, safePage]);

  const showingFrom = total === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const showingTo = Math.min((safePage + 1) * PAGE_SIZE, total);

  return (
    <div className="bg-white border border-[#e5e2e1] p-5 sm:p-6 shadow-[8px_8px_0px_#f0eded] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-[#e5e2e1]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-[family-name:var(--font-anton)] text-[20px] leading-[24px] text-[#1c1b1b] uppercase truncate">
            Recent Donations
          </span>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="icon" className="rounded-none border-[#e5e2e1] text-[#3e4a41] hover:text-[#006b3f] size-9" aria-label="Filter">
            <Filter className="size-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-none border-[#e5e2e1] text-[#3e4a41] hover:text-[#006b3f] size-9" aria-label="Download">
            <Download className="size-4" />
          </Button>
        </div>
      </div>

      {/* Loading */}
      {rows === undefined && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}

      {/* Empty */}
      {rows !== undefined && rows.length === 0 && (
        <div className="p-8 text-center text-[#3e4a41]">No donations yet.</div>
      )}

      {/* Desktop table (>= md) */}
      {rows !== undefined && rows.length > 0 && (
        <div className="hidden md:block flex-1 overflow-auto">
          <Table className="w-full text-left border-collapse">
            <TableHeader>
              <TableRow className="bg-[#eae7e7] border-b-2 border-[#008751] hover:bg-[#eae7e7]">
                <TableHead className="p-4 text-xs font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">Donor</TableHead>
                <TableHead className="p-4 text-xs font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">Amount</TableHead>
                <TableHead className="p-4 text-xs font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">Date</TableHead>
                <TableHead className="p-4 text-xs font-bold uppercase tracking-[0.05em] text-[#1c1b1b] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged?.map((d, i) => (
                <DonationDesktopRow key={d._id} d={d as DonationWithDonor} index={i} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Mobile cards (< md) */}
      {rows !== undefined && rows.length > 0 && (
        <div className="md:hidden flex-1 flex flex-col gap-3">
          {paged?.map((d) => (
            <DonationMobileCard key={d._id} d={d as DonationWithDonor} />
          ))}
        </div>
      )}

      {/* Footer / pagination */}
      {rows !== undefined && rows.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#e5e2e1] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between text-[#3e4a41] text-sm">
          <span>
            Showing {showingFrom}–{showingTo} of {total} donations
          </span>
          <div className="flex gap-1 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-none border-[#e5e2e1] disabled:opacity-50 h-9"
            >
              Prev
            </Button>
            {Array.from({ length: pageCount }).slice(0, 5).map((_, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => setPage(i)}
                className={`rounded-none h-9 ${
                  i === safePage
                    ? "border-[#008751] bg-[#008751] text-[#fdfff9]"
                    : "border-[#e5e2e1] text-[#1c1b1b]"
                }`}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-none border-[#e5e2e1] disabled:opacity-50 h-9"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Option B fallback (only if Task 0 was NOT approved):
// Replace the `const rows = useQuery(api.donations.getDonationsWithDonors);`
// line above with the following client-side join. Keep everything else.
// ---------------------------------------------------------------------------
//
// const raw = useQuery(api.donations.getDonations);          // newest? sort below
// const donors = useQuery(api.donors.getDonors);
// const rows = useMemo(() => {
//   if (!raw || !donors) return undefined;
//   const map = new Map(donors.map((d) => [d._id, d] as const));
//   return raw
//     .slice()
//     .sort((a, b) => b.createdAt - a.createdAt)
//     .map((d) => ({ ...d, donor: map.get(d.donorId) ?? null })) as DonationWithDonor[];
// }, [raw, donors]);
```

- [ ] **Step 4: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors. (If Option B, comment out the Option A line and uncomment the fallback.)

- [ ] **Step 5: Commit**

```bash
git add app/admin/donations/_components/DonationsTable.tsx app/admin/donations/_components/DonationRow.tsx
git commit -m "feat(donations): responsive donations table with edit/delete"
```

---

## Task 6: `EditDonationDialog` + `DeleteDonationDialog`

**Files:**
- Create: `app/admin/donations/_components/EditDonationDialog.tsx`
- Create: `app/admin/donations/_components/DeleteDonationDialog.tsx`

**Consumes:** `api.donations.updateDonation`, `api.donations.deleteDonation`. Reuses the `DonationWithDonor` type from `DonationRow.tsx`.

- [ ] **Step 1: Create `EditDonationDialog.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import type { DonationWithDonor } from "./DonationRow";

export function EditDonationDialog({ donation }: { donation: DonationWithDonor }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(donation.amount));
  const [note, setNote] = useState(donation.note ?? "");

  const updateDonation = useMutation(api.donations.updateDonation);

  useEffect(() => {
    if (open) {
      setAmount(String(donation.amount));
      setNote(donation.note ?? "");
    }
  }, [open, donation.amount, donation.note]);

  async function handleSave() {
    const parsed = parseFloat(amount);
    if (!(parsed > 0) || !Number.isFinite(parsed)) {
      toast.error("Amount must be a positive number.");
      return;
    }
    try {
      await updateDonation({
        donationId: donation._id as never,
        amount: parsed,
        note: note.trim() ? note.trim() : undefined,
      });
      toast.success("Donation updated");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update donation");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          aria-label="Edit donation"
          className="p-2 bg-white border border-[#008751] text-[#006b3f] hover:bg-[#008751] hover:text-[#fdfff9] rounded-none size-9"
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Donation</DialogTitle>
          <DialogDescription>Donor: {donation.donor?.name ?? "Unknown"}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-amount">Amount (€)</Label>
            <Input id="edit-amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-note">Note</Label>
            <Textarea id="edit-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost" size="sm">Cancel</Button></DialogClose>
          <Button size="sm" onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

> Note: `donation._id` is typed as `string` in `DonationWithDonor` for portability; cast to `Id<"donations">` via `as never` only if the linter complains. Prefer importing `Id` from `@/convex/_generated/dataModel` and typing `_id: Id<"donations">` in `DonationWithDonor` — adjust the type in `DonationRow.tsx` if you do.

- [ ] **Step 2: Create `DeleteDonationDialog.tsx`**

```tsx
"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent,
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import type { DonationWithDonor } from "./DonationRow";

export function DeleteDonationDialog({ donation }: { donation: DonationWithDonor }) {
  const deleteDonation = useMutation(api.donations.deleteDonation);

  async function handleDelete() {
    try {
      await deleteDonation({ donationId: donation._id as never });
      toast.success("Donation deleted");
    } catch {
      toast.error("Failed to delete donation");
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          aria-label="Delete donation"
          className="p-2 bg-white border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white rounded-none size-9"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this donation?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the donation of {donation.donor?.name ?? "this donor"}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/donations/_components/EditDonationDialog.tsx app/admin/donations/_components/DeleteDonationDialog.tsx
git commit -m "feat(donations): edit + delete donation dialogs"
```

---

## Task 7: Assemble `page.tsx`

**Files:**
- Modify: `app/admin/donations/page.tsx`

- [ ] **Step 1: Replace the stub**

```tsx
"use client";

import { AddDonationForm } from "./_components/AddDonationForm";
import { DonationsTable } from "./_components/DonationsTable";
import { Toaster } from "@/components/ui/sonner";

export default function DonationsPage() {
  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 flex flex-col gap-6">
      {/* Page header — stacked on mobile, row on sm+ */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-anton)] text-[28px] sm:text-[32px] lg:text-[40px] leading-[34px] sm:leading-[40px] text-[#006b3f] uppercase tracking-tighter">
            Add Donations
          </h1>
          <p className="text-[#3e4a41] text-sm sm:text-base mt-1">
            Record offline contributions and manage recent donations.
          </p>
        </div>
      </header>

      {/* 12-col grid: form (4) + list (8) on lg; stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <section className="lg:col-span-4">
          <AddDonationForm />
        </section>
        <section className="lg:col-span-8">
          <DonationsTable />
        </section>
      </div>

      <Toaster />
    </main>
  );
}
```

Mobile-first notes:
- `px-4 sm:px-6 lg:px-8` + `py-8` — comfortable phone padding, grows at each breakpoint.
- Header stacks vertically on mobile (`flex-col`), becomes a row at `sm:`.
- Grid is single-column on mobile, splits 4/8 at `lg` (not `md`) so the form and table each get full width on tablets too.
- Gutter `gap-4` on mobile, `gap-6` from `sm`.

- [ ] **Step 2: Verify in the browser**

Run `npm run dev`. Visit `/admin/donations`:
- Mobile (360px): header stacked, form full width, donations render as cards, pagination wraps, no horizontal scroll, sidebar reachable via hamburger.
- Desktop (≥1024px): form left (4 cols), table right (8 cols) with zebra rows, Edit/Delete buttons always visible.
- Create a donor via "+ Add New Donor", then submit a donation → toast "Donation processed", table updates in realtime, form resets.
- Edit a donation → changes persist + toast.
- Delete a donation → confirm dialog → toast.

- [ ] **Step 3: Run impact + change detection before committing**

Run (GitNexus MCP):
- `impact({ target: "DonationsPage", direction: "upstream" })`
- `detect_changes()` (and optionally `detect_changes({ scope: "compare", base_ref: "main" })`)

Confirm only donations-page + layout symbols are affected.

- [ ] **Step 4: Commit**

```bash
git add app/admin/donations/page.tsx
git commit -m "feat(donations): implement donations management page"
```

---

## Self-Review (planner's checklist)

- **Spec coverage:**
  - Donations CRUD (create/edit/delete) → Tasks 4, 6, 5. ✅
  - Donor chosen from existing donors; "+ Add New Donor" popup with name/phone/image-URL text fields, no file upload → Tasks 3, 4. ✅
  - Recent donations table with Edit + Delete buttons added (mock lacked them) → Task 5. ✅
  - Only `app/admin/donations/page.tsx` touched for scope; `info`/`donors` untouched. ✅
  - shadcn + Tailwind, install missing component → Task 1 installs `sheet`; all others already installed. ✅
  - Only existing Convex functions, except Task 0 which is gated on human approval. ✅
  - Colors specified (hex palette), fonts specified. ✅
  - Mobile-first at every breakpoint, sidebar made responsive without breaking desktop → Tasks 1, 5, 7. ✅
  - No auth. ✅
- **Backend gap surfaced:** Task 0, Option A/B — human must choose before implementation. ✅
- **Placeholder scan:** code blocks are complete; the only "see bottom of task" reference is the Option B fallback, which is fully written out. ✅
- **Type consistency:** `DonationWithDonor` is defined in `DonationRow.tsx` and imported by `DonationsTable`, `EditDonationDialog`, `DeleteDonationDialog`. `AddDonorDialog.onDonorCreated` returns `Id<"donors">`, consumed by `AddDonationForm.setDonorId`. ✅

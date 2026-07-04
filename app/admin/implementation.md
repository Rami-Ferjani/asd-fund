# Implementation Plan — Mobile-First Admin Dashboard

> **Scope:** Frontend layout & Tailwind styling only. No Convex, Clerk, schema, query, mutation, or business-logic changes. Preserve all existing behavior, colors, typography, and the design language defined in `context/DESIGN.md`.
>
> **Mobile-first principle:** Default classes target the smallest viewport (`base`), then `sm:` (640px), `md:` (768px), `lg:` (1024px), and `xl:` (1280px) progressively restore the desktop layout. Do **not** simply shrink existing components — restructure layouts at each breakpoint.

---

## 1. Overview of Current Responsiveness Issues

The admin sidebar (`app/admin/layout.tsx`) is already fully responsive (desktop sidebar above `md`, mobile `Sheet` drawer below `md`) and is treated as the **source of truth** — no changes required there.

The two admin pages, however, were authored desktop-first and exhibit the following problems on small viewports:

### `app/admin/info/page.tsx`

| # | Issue | Evidence |
|---|-------|----------|
| 1 | Page padding is fixed and oversized on mobile. | `<main className="... px-8 py-20 ...">` — 32px horizontal + 80px vertical padding leaves little room on a 360px screen. |
| 2 | Headline does not scale down. | `text-[48px] leading-[56px]` renders at the same size on a 360px phone as on desktop, causing wraps/overflow. `DESIGN.md` defines a `headline-lg-mobile` token at `28px / 34px` for exactly this case. |
| 3 | Section gaps are desktop-scale. | `mb-20` (80px) between header, stats, and recent activity is excessive on mobile. |
| 4 | `StatCard` value typography is too large for mobile. | `text-[72px] leading-[80px]` and `p-8` padding dominate a small screen; three stacked cards become very tall. |
| 5 | "Recent Activity" table relies on `overflow-x-auto`. | Horizontal scrolling to reach the **Actions** column is a poor mobile experience. The four-column table (Donor / Amount / Date / Actions) should become a stacked card list below `md`. |
| 6 | Table cell padding `p-4` is acceptable, but row content is not reorganized for narrow widths. | No card alternative exists. |

### `app/admin/donors/page.tsx`

| # | Issue | Evidence |
|---|-------|----------|
| 1 | Page padding is fixed. | `px-8 py-12` — 32px horizontal padding on mobile is wasteful. |
| 2 | Header row does not stack. | `<div className="flex items-center justify-between">` puts the `text-[32px]` title and the **Add New Donor** button on one line; on narrow screens the button wraps awkwardly or overflows. |
| 3 | Search input has a **fixed desktop width**. | `<div className="relative w-96">` (384px) is wider than many phone viewports and forces horizontal overflow inside the card. |
| 4 | Toolbar is a single non-wrapping row. | `flex items-center gap-3` with no `flex-wrap` / full-width behavior. |
| 5 | Donor table uses `overflow-x-auto`. | The four-column table (Donor / Phone / Total / Actions) should become a card list below `md`. |
| 6 | Action buttons are icon-only at `size-4` inside `p-2` containers. | Below the ~44px comfortable touch-target minimum on mobile. |
| 7 | Footer (pagination) is a single row that overflows. | `flex items-center justify-between` places "Showing X–Y of Z donors" beside a `Prev / 1 / 2 / … / Next` button group. With many pages, the number buttons overflow horizontally. |
| 8 | Pagination buttons are too small for touch. | `px-3 py-1 text-sm` ≈ well under 44px tall. |

### Shared / cross-cutting

- No consistent mobile padding scale across admin pages (info uses `px-8 py-20`; donors uses `px-8 py-12`). The plan standardizes a mobile-first padding token set.
- Several touch targets fall below the 44×44px comfort threshold.
- Horizontal scrolling is the default fallback for both tables; the plan replaces it with card layouts below `md` and reserves the table for `md` and up.

---

## 2. `app/admin/info/page.tsx`

> Goal: a mobile-first dashboard overview. Stat cards stack and shrink gracefully; the recent-activity table becomes a card list below `md` and a real table at `md`+.

### 2.1 Page shell (`<main>`)

Current:
```tsx
<main className="flex-1 max-w-7xl mx-auto px-8 py-20 w-full">
```

Mobile-first replacement:
```tsx
<main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-20">
```

- Base `px-4 py-8` (16px / 32px) for phones.
- `sm:` nudges to `px-6 py-12`.
- `md:` restores the original `px-8 py-20` desktop spacing — **desktop behavior preserved exactly**.

### 2.2 Header

Current:
```tsx
<header className="mb-20 flex justify-between items-end">
  <h2 className="font-[family-name:var(--font-anton)] text-[48px] leading-[56px] text-[#006b3f] uppercase">
    Fund Overview
  </h2>
  <p className="text-[18px] leading-[28px] text-[#3e4a41] mt-2 font-[family-name:var(--font-be-vietnam)]">
    Manage donations for the new club bus.
  </p>
</header>
```

Mobile-first replacement:
```tsx
<header className="mb-10 sm:mb-16 md:mb-20 flex flex-col gap-2">
  <h2 className="font-[family-name:var(--font-anton)] text-[28px] leading-[34px] sm:text-[36px] sm:leading-[40px] md:text-[48px] md:leading-[56px] text-[#006b3f] uppercase">
    Fund Overview
  </h2>
  <p className="text-[16px] leading-[24px] sm:text-[18px] sm:leading-[28px] text-[#3e4a41] font-[family-name:var(--font-be-vietnam)]">
    Manage donations for the new club bus.
  </p>
</header>
```

- Headline uses `28px / 34px` on mobile (the `headline-lg-mobile` token from `DESIGN.md`), `36px` at `sm`, and the original `48px` at `md`.
- Body text drops to `body-md` (16/24) on mobile, returns to `18/28` at `sm`+.
- Section gap scales `mb-10 → sm:mb-16 → md:mb-20`.
- Header is a vertical `flex-col` (it already only contained a title + subtitle; the original `justify-between items-end` was a no-op for single-child content).

### 2.3 Stat cards

Current `StatCard`:
```tsx
<div className="bg-white p-8 border-2 border-[#008751] transition-[border-width] hover:border-[3px]">
  ...
  <div className={`font-[family-name:var(--font-anton)] text-[72px] leading-[80px] ${valueClass}`}>
```

Section wrapper:
```tsx
<section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
```

Mobile-first changes:

- Wrapper: `grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16 md:mb-20`. (Three-up from `sm` keeps cards compact on small tablets; original was `md:grid-cols-3` — restoring `md:grid-cols-3` is also acceptable if you prefer the single-column stack through tablet. Recommended: `sm:grid-cols-3` to use width better on small tablets.)
- Card padding: `p-5 sm:p-6 md:p-8`.
- Value typography: `text-[40px] leading-[44px] sm:text-[56px] sm:leading-[64px] md:text-[72px] md:leading-[80px]`.
- Skeleton height should match: `h-[44px] sm:h-[64px] md:h-[80px]` instead of fixed `h-[80px]`.
- Label, border, and hover behavior are unchanged (preserves branding).

Updated `StatCard`:
```tsx
<div className="bg-white p-5 sm:p-6 md:p-8 border-2 border-[#008751] transition-[border-width] hover:border-[3px]">
  <div className="text-[#3e4a41] text-sm font-bold uppercase tracking-[0.05em] mb-2">
    {label}
  </div>
  {loading ? (
    <Skeleton className="h-[44px] sm:h-[64px] md:h-[80px] w-full" />
  ) : (
    <div
      className={`font-[family-name:var(--font-anton)] text-[40px] leading-[44px] sm:text-[56px] sm:leading-[64px] md:text-[72px] md:leading-[80px] ${valueClass}`}
    >
      {value}
    </div>
  )}
</div>
```

### 2.4 Recent Activity — table → card list

Strategy: render **two layouts from the same data**.

- A card list, shown below `md` (`md:hidden`).
- The existing table, shown at `md`+ (`hidden md:block`). The `overflow-x-auto` wrapper can remain on the table for safety, but at `md`+ the viewport is wide enough that it will not scroll.

Section heading:
```tsx
<h3 className="font-[family-name:var(--font-anton)] text-[24px] leading-[32px] sm:text-[28px] sm:leading-[34px] md:text-[32px] md:leading-[40px] text-[#1c1b1b] mb-4 sm:mb-6 uppercase">
  Recent Activity
</h3>
```

#### Mobile card list (`md:hidden`)

A vertical list of cards, one per donation, using the existing `Card` component (`components/ui/card.tsx` is already installed). Each card surfaces the same information as a table row: donor name, amount, date, and the **Manage** action.

```tsx
{/* Mobile card list */}
<div className="md:hidden flex flex-col gap-3">
  {/* Loading */}
  {latest === undefined &&
    Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white border-2 border-[#008751] p-4">
        <Skeleton className="h-5 w-32 mb-3" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}

  {/* Empty */}
  {latest !== undefined && latest.length === 0 && (
    <div className="bg-white border-2 border-[#008751] p-6 text-center text-[#3e4a41]">
      No donations yet.
    </div>
  )}

  {/* Cards */}
  {latest?.map((d) => (
    <div
      key={d._id}
      className="bg-white border-2 border-[#008751] p-4 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-bold text-[#1c1b1b] text-base">
          {d.donor?.name ?? "Unknown"}
        </span>
        <span className="font-[family-name:var(--font-anton)] text-[#006b3f] text-[20px] leading-[24px]">
          {formatEur(d.amount)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-[#3e4a41]">{formatDate(d.createdAt)}</span>
        <ManageDonationDialog donation={d} />
      </div>
    </div>
  ))}
</div>
```

#### Desktop table (`hidden md:block`) — keep existing markup

Wrap the existing `<Table>` block in `<div className="hidden md:block ...">` (move `overflow-x-auto` onto this wrapper or keep it inside — behavior at `md`+ is unchanged). No row markup changes required.

> The `ManageDonationDialog` component itself needs **no changes** — it is already `sm:max-w-md` and Dialog/AlertDialog are responsive by default. Its trigger button has comfortable sizing.

---

## 3. `app/admin/donors/page.tsx`

> Goal: a mobile-first donor list. Header stacks, search is full-width, the donor table becomes a card list below `md`, and pagination reflows comfortably.

### 3.1 Page shell

Current:
```tsx
<main className="flex-1 w-full max-w-[1200px] mx-auto px-8 py-12 flex flex-col gap-6">
```

Mobile-first replacement:
```tsx
<main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 flex flex-col gap-4 sm:gap-6">
```

### 3.2 Header row (title + Add button)

Current:
```tsx
<div className="flex items-center justify-between">
  <h1 className="font-[family-name:var(--font-anton)] text-[32px] leading-[40px] text-[#006b3f] uppercase tracking-wide">
    Donor Management
  </h1>
  <AddDonorDialog />
</div>
```

Mobile-first replacement:
```tsx
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
  <h1 className="font-[family-name:var(--font-anton)] text-[24px] leading-[32px] sm:text-[28px] sm:leading-[34px] md:text-[32px] md:leading-[40px] text-[#006b3f] uppercase tracking-wide">
    Donor Management
  </h1>
  <AddDonorDialog />
</div>
```

- Stacks vertically on mobile (`flex-col`), row at `sm`+.
- Title scales `24 → 28 → 32` across `sm → md`.
- The **Add New Donor** button keeps its bold styling; on mobile it becomes full-width via the dialog trigger change below.

### 3.3 Add New Donor trigger — full-width on mobile

Current trigger button:
```tsx
<Button className="bg-[#7a590c] text-[#fdfff9] hover:bg-[#78580b] border-2 border-transparent shadow-[4px_4px_0px_#006b3f] flex items-center gap-2 uppercase font-bold tracking-[0.05em] text-sm px-6 py-2 rounded-none">
```

Mobile-first addition — make it fill width on mobile and auto-size from `sm`+:
```tsx
<Button className="... w-full sm:w-auto justify-center ...">
```

(Prepend `w-full sm:w-auto justify-center` to the existing class string; leave all color/shadow/typography classes untouched.)

### 3.4 Card container padding

Current:
```tsx
<div className="bg-white border-2 border-[#e5e2e1] p-6 shadow-[8px_8px_0px_#f0eded]">
```

Mobile-first replacement:
```tsx
<div className="bg-white border-2 border-[#e5e2e1] p-4 sm:p-6 shadow-[8px_8px_0px_#f0eded]">
```

### 3.5 Toolbar + search (full-width, wrapping)

Current:
```tsx
<div className="flex items-center gap-3 mb-6">
  <div className="relative w-96">
    <Search className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7a70]" />
    <Input ... className="pl-10 pr-4 py-2 ... w-full rounded-none" />
  </div>
</div>
```

The `w-96` is the core mobile defect. Mobile-first replacement:
```tsx
<div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
  <div className="relative w-full sm:w-80 md:w-96">
    <Search className="size-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#6e7a70]" />
    <Input
      placeholder="Search donors..."
      value={search}
      onChange={(e) => handleSearchChange(e.target.value)}
      className="pl-10 pr-4 py-2.5 sm:py-2 border-2 border-[#e5e2e1] bg-white text-[#1c1b1b] focus:outline-none focus:border-[#006b3f] w-full rounded-none"
    />
  </div>
</div>
```

- Search is `w-full` on mobile, `sm:w-80`, `md:w-96` — restores the original desktop width at `md`.
- Slightly taller vertical padding on mobile (`py-2.5`) for a bigger touch target.
- Toolbar wraps to a column on mobile; future toolbar additions can sit alongside at `sm`+.

### 3.6 Donor table → card list

Same dual-render strategy as the info page.

#### Mobile card list (`md:hidden`)

```tsx
<div className="md:hidden flex flex-col gap-3">
  {/* Loading */}
  {donors === undefined &&
    Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="border-2 border-[#e5e2e1] p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-24 mt-3" />
      </div>
    ))}

  {/* Empty */}
  {donors !== undefined && donors.length === 0 && (
    <div className="border-2 border-[#e5e2e1] p-6 text-center text-[#3e4a41]">
      No donors yet.
    </div>
  )}

  {/* No search matches */}
  {filtered !== undefined &&
    filtered.length === 0 &&
    donors !== undefined &&
    donors.length > 0 && (
      <div className="border-2 border-[#e5e2e1] p-6 text-center text-[#3e4a41]">
        No donors match &ldquo;{search}&rdquo;.
      </div>
    )}

  {/* Cards */}
  {paged?.map((donor) => (
    <div
      key={donor._id}
      className="border-2 border-[#e5e2e1] p-4 flex flex-col gap-3"
    >
      <div className="flex items-center gap-3">
        <Avatar className="size-10 rounded-full">
          <AvatarImage src={donor.imageUrl} alt={donor.name} />
          <AvatarFallback className="bg-[#eae7e7] text-[#006b3f] font-bold">
            {initials(donor.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-[#1c1b1b] truncate">{donor.name}</span>
          <span className="text-sm text-[#3e4a41] truncate">
            {donor.phone ?? "—"}
          </span>
        </div>
        <span className="ml-auto font-[family-name:var(--font-anton)] text-[#006b3f] text-[20px] leading-[24px]">
          {formatEur(donor.totalDonated)}
        </span>
      </div>
      <div className="flex items-center justify-end gap-2">
        <EditDonorDialog donor={donor} />
        <DeleteDonorDialog donor={donor} />
      </div>
    </div>
  ))}
</div>
```

#### Desktop table (`hidden md:block`)

Keep the existing `<Table>` markup unchanged; wrap it in `<div className="hidden md:block overflow-x-auto">`. The `DonorRow` sub-component is reused as-is.

### 3.7 Action buttons — touch targets

The `EditDonorDialog` and `DeleteDonorDialog` triggers use `size="icon"` with `p-2` and a `size-4` icon. On mobile these render inside the card's action row (§3.6) where there is room. Bump the touch target on mobile only:

Edit trigger:
```tsx
<Button
  size="icon"
  className="p-2 sm:p-2 size-9 sm:size-auto bg-white border border-[#008751] text-[#006b3f] hover:bg-[#008751] hover:text-[#fdfff9] rounded-none"
>
  <Pencil className="size-4" />
</Button>
```

Delete trigger: same pattern with the red border classes. (A `size-9` (36px) button is acceptable; if you want to hit the 44px guideline strictly, use `size-11` on mobile via `size-11 sm:size-auto`.) Keep colors and icons unchanged.

### 3.8 Footer / pagination — reflow

Current:
```tsx
<div className="flex items-center justify-between mt-6">
  <p className="text-sm text-[#3e4a41]">Showing {showingFrom}&ndash;{showingTo} of {total} donors</p>
  <div className="flex items-center gap-1">
    {/* Prev / numbers / Next */}
  </div>
</div>
```

Problems: on mobile the count text and the button group compete for one row; many page-number buttons overflow horizontally.

Mobile-first replacement:
```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4 sm:mt-6">
  <p className="text-sm text-[#3e4a41]">
    Showing {showingFrom}&ndash;{showingTo} of {total} donors
  </p>
  <div className="flex items-center gap-1 flex-wrap">
    <button
      disabled={page === 0}
      onClick={() => setPage((p) => p - 1)}
      className="px-3 py-2 min-h-[40px] border border-[#e5e2e1] hover:bg-[#f0eded] disabled:opacity-50 text-sm text-[#1c1b1b]"
    >
      Prev
    </button>
    {Array.from({ length: pageCount }).map((_, i) => (
      <button
        key={i}
        onClick={() => setPage(i)}
        className={`px-3 py-2 min-h-[40px] min-w-[40px] border text-sm ${
          i === page
            ? "border-[#008751] bg-[#008751] text-[#fdfff9]"
            : "border-[#e5e2e1] hover:bg-[#f0eded] text-[#1c1b1b]"
        }`}
      >
        {i + 1}
      </button>
    ))}
    <button
      disabled={page === pageCount - 1}
      onClick={() => setPage((p) => p + 1)}
      className="px-3 py-2 min-h-[40px] border border-[#e5e2e1] hover:bg-[#f0eded] disabled:opacity-50 text-sm text-[#1c1b1b]"
    >
      Next
    </button>
  </div>
</div>
```

- Stacks vertically on mobile; row at `sm`+.
- `flex-wrap` lets page-number buttons wrap instead of overflowing.
- `min-h-[40px]` + `min-w-[40px]` bring buttons up to a comfortable touch size (close to the 44px guideline) without changing their visual style.

> **Optional enhancement (not required):** if donor counts grow large enough that page-number buttons wrap awkwardly, consider replacing the number-button sequence with a shadcn `Select` page picker on mobile. This is an enhancement, not a requirement, and does not change any data logic. The `select` component (`components/ui/select.tsx`) is already installed.

---

## 4. `app/admin/layout.tsx` — Recommendations

**No source changes required.** The layout is already mobile-first and is the designated source of truth:

- `DesktopSidebar` is `hidden md:flex` (desktop only).
- `MobileTopBar` is `md:hidden` and uses a `Sheet` drawer with a hamburger trigger — correct mobile pattern.
- The content region is `flex-1 flex flex-col min-w-0` — `min-w-0` is the correct guard against horizontal overflow from wide children.
- The layout applies the Anton / Be Vietnam Pro font variables at the root, so child pages inherit them.

The only note (not an edit): because the layout already handles the sidebar/topbar, **all responsive work belongs in the individual pages**. The `px-*` / `py-*` padding for admin content lives on each page's `<main>`, so the page-level changes in §2.1 and §3.1 are the correct place to adjust spacing — `layout.tsx` should stay untouched.

---

## 5. Required Tailwind Responsive Breakpoint Changes

Summary of the breakpoint strategy applied throughout. Defaults target mobile; each breakpoint restores a step toward the existing desktop layout.

| Concern | Base (mobile) | `sm` (640) | `md` (768) | `lg`/`xl` |
|---|---|---|---|---|
| Page horizontal padding | `px-4` | `px-6` | `px-8` (original) | unchanged |
| Page vertical padding (info) | `py-8` | `py-12` | `py-20` (original) | unchanged |
| Page vertical padding (donors) | `py-8` | `py-10` | `py-12` (original) | unchanged |
| Section gaps | `mb-10` | `mb-16` | `mb-20` (original) | unchanged |
| Headlines | mobile token (24–28px) | 28–36px | original (32–48px) | unchanged |
| Body text | 16/24 | 18/28 (original) | unchanged | unchanged |
| Stat card value | `40px` | `56px` | `72px` (original) | unchanged |
| Stat card padding | `p-5` | `p-6` | `p-8` (original) | unchanged |
| Stat grid columns | `grid-cols-1` | `grid-cols-3` | unchanged | unchanged |
| Header row (donors) | `flex-col` | `flex-row justify-between` | unchanged | unchanged |
| Search width | `w-full` | `w-80` | `w-96` (original) | unchanged |
| Toolbar | `flex-col` | `flex-row` | unchanged | unchanged |
| Table vs cards | card list (`md:hidden`) | cards | table (`hidden md:block`) | table |
| Pagination layout | `flex-col` | `flex-row justify-between` | unchanged | unchanged |
| Pagination buttons | `min-h-[40px] min-w-[40px]` | unchanged | unchanged | unchanged |
| Add-Donor button | `w-full` | `w-auto` | unchanged | unchanged |
| Card container padding | `p-4` | `p-6` (original) | unchanged | unchanged |

All changes use Tailwind responsive utilities only — no custom CSS, no inline breakpoints in JS.

---

## 6. Required shadcn/ui Components

All components needed for this plan are **already installed** in `components/ui/`:

- `card.tsx` — available (optional; the plan uses plain `<div>` containers with the existing border styling to stay closer to the current visual language, but `Card` may be used if preferred).
- `avatar.tsx` — used by donor cards (already in use).
- `skeleton.tsx` — used for loading states (already in use).
- `dialog.tsx` / `alert-dialog.tsx` — used by Manage/Edit/Delete flows (already in use, no changes).
- `input.tsx`, `button.tsx`, `table.tsx` — already in use.

**No new shadcn/ui component installation is required.**

> Optional, only if the pagination enhancement in §3.8 is desired: `select` is already installed, so no `npx shadcn@latest add ...` command is needed in any case.

---

## 7. Step-by-Step Implementation Checklist

> A second AI can follow these in order. Each step is self-contained and verifiable. Run the dev server between steps and visually check mobile (360px), tablet (768px), and desktop (1280px) widths.

### Prep
- [ ] 1. Confirm `layout.tsx` will **not** be edited (§4). All work is in `info/page.tsx` and `donors/page.tsx`.
- [ ] 2. Start the dev server and open `/admin/info` and `/admin/donors` at 360px, 768px, and 1280px to capture the "before" state.

### `app/admin/info/page.tsx`
- [ ] 3. Update `<main>` padding to `px-4 py-8 sm:px-6 sm:py-12 md:px-8 md:py-20` (§2.1).
- [ ] 4. Update the header: `flex-col gap-2`, scaled headline (`28→36→48`), scaled subtitle (`16→18`), scaled `mb-10 sm:mb-16 md:mb-20` (§2.2).
- [ ] 5. Update the stats section wrapper: `grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16 md:mb-20` (§2.3).
- [ ] 6. Update `StatCard`: scaled padding `p-5 sm:p-6 md:p-8`, scaled value typography `40→56→72`, and matching `Skeleton` height (§2.3).
- [ ] 7. Update the "Recent Activity" heading to scale `24→28→32` with `mb-4 sm:mb-6` (§2.4).
- [ ] 8. Add the mobile card list block (`md:hidden`) for recent activity — loading, empty, and per-donation cards reusing `ManageDonationDialog` (§2.4).
- [ ] 9. Wrap the existing `<Table>` in `<div className="hidden md:block">` (keep `overflow-x-auto` inside if present) (§2.4).
- [ ] 10. Verify: at 360px, no horizontal scroll; stat cards stack; recent activity shows cards with Manage buttons. At 1280px, layout is visually identical to the original.

### `app/admin/donors/page.tsx`
- [ ] 11. Update `<main>` padding to `px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12` and gap to `gap-4 sm:gap-6` (§3.1).
- [ ] 12. Reflow the header row to `flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between` and scale the title `24→28→32` (§3.2).
- [ ] 13. Make the **Add New Donor** trigger `w-full sm:w-auto justify-center` (keep all existing classes) (§3.3).
- [ ] 14. Update the card container to `p-4 sm:p-6` (§3.4).
- [ ] 15. Reflow the toolbar to `flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6` and the search wrapper to `w-full sm:w-80 md:w-96`; bump Input `py` to `py-2.5 sm:py-2` (§3.5).
- [ ] 16. Add the mobile donor card list (`md:hidden`) — loading, empty, no-match, and per-donor cards with Avatar, name, phone, total, and Edit/Delete actions (§3.6).
- [ ] 17. Wrap the existing donor `<Table>` in `<div className="hidden md:block overflow-x-auto">`; leave `DonorRow` unchanged (§3.6).
- [ ] 18. Bump Edit/Delete trigger touch targets on mobile (`size-11 sm:size-auto` or `min-h`/`min-w` to ~40–44px), keeping all colors and icons (§3.7).
- [ ] 19. Reflow the pagination footer to `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4 sm:mt-6`; add `flex-wrap` to the button group and `min-h-[40px] min-w-[40px]` to each button (§3.8).
- [ ] 20. Verify: at 360px, no horizontal scroll; header stacks; search is full-width; donor cards render with actions; pagination wraps. At 1280px, layout is visually identical to the original.

### Final verification
- [ ] 21. Resize through 320px → 1920px on both pages; confirm no horizontal scrollbar appears at any width.
- [ ] 22. Confirm all dialogs (Add/Edit/Delete donor, Manage donation) still open, validate, and save correctly at mobile widths.
- [ ] 23. Confirm no Convex queries/mutations were touched (`git diff` should only show the two page files).
- [ ] 24. Confirm `layout.tsx` is unmodified (`git diff app/admin/layout.tsx` is empty).

---

## 8. Acceptance Criteria

The implementation is complete when **all** of the following are true:

### Layout & responsiveness
1. **No horizontal scrolling** on either `/admin/info` or `/admin/donors` at any viewport width from 320px upward.
2. **Mobile-first scaling:** default classes target the smallest viewport; `sm`, `md`, `lg`, `xl` progressively restore the desktop layout.
3. **Desktop parity:** at `md`+ (≥768px), both pages are visually and functionally identical to their current desktop appearance — same colors, typography, spacing, borders, shadows, and component structure.
4. **Breakpoint-appropriate restructuring** (not shrinking):
   - Headers and toolbars stack vertically below `sm`/`md` and go row at `sm`+.
   - Forms and search inputs are full-width on mobile.
   - Grids reorganize (stats: 1 → 3 columns).
   - Tables are replaced by card layouts below `md` and reappear as tables at `md`+.

### Touch & usability
5. All interactive controls (pagination buttons, icon action buttons, the hamburger menu, dialog triggers) have a comfortable touch target (≥40px, ideally ~44px) on mobile.
6. The donor search input is full-width on mobile and reaches its original `w-96` width at `md`.
7. Pagination buttons wrap rather than overflow when there are many pages.

### Design fidelity
8. No changes to colors, typography families, border styles, shadow styles, or the overall design language defined in `context/DESIGN.md`.
9. The mobile headline sizes use the `headline-lg-mobile` (28px/34px) spirit from `DESIGN.md`; Anton remains the headline font and Be Vietnam Pro the body font (inherited from `layout.tsx`).
10. Card/list styling on mobile reuses the existing border (`#008751` / `#e5e2e1`) and surface (`bg-white`) palette — no new visual vocabulary is introduced.

### Scope discipline
11. `app/admin/layout.tsx` is **not modified**.
12. No Convex schema, query, mutation, Clerk, or business-logic files are touched (`git diff` is limited to `app/admin/info/page.tsx` and `app/admin/donors/page.tsx`).
13. No new npm dependencies are added; no `npx shadcn@latest add` command is required (all components already installed).
14. All existing functionality is preserved: donor CRUD, donation manage (edit/delete), search, pagination, loading skeletons, empty/no-match states, and realtime updates behave exactly as before.

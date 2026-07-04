# Implementation Plan — Static HTML Landing Page → Next.js

Convert `app/landingpage.html` (a single RTL Arabic Tailwind-CDN mock) into a production-ready, mobile-first Next.js App Router page that pulls live data from the existing Convex backend.

> **Scope of this document:** planning only. No source code is modified as part of this task. The plan is written so it can be executed in a follow-up change with zero ambiguity.

---

## 0. Governing constraints (read first)

These come from `app/instruction.md`, `context/project-overview.md`, `context/architecture-context.md`, `context/DESIGN.md`, and `CLAUDE.md`/`AGENTS.md`.

- **Do NOT create new Convex queries or mutations.** Use only the functions already exported in `convex/donors.ts` and `convex/donations.ts`.
- **Do NOT modify** the Convex schema, Convex backend, Clerk, auth, or business logic. Do **not** add authentication. The public page is fully public.
- **Preserve all Arabic text verbatim.** Do not translate, rewrite, or "fix" the Tunisian Arabic strings. Copy them character-for-character from `landingpage.html`.
- **Preserve the visual design** (colors, typography, layout philosophy, branding). Do not redesign.
- **Mobile-first responsive** at every Tailwind breakpoint (`sm`, `md`, `lg`, `xl`) — do not simply shrink the desktop layout.
- **Keep business logic in Convex; React is presentation.** Per `architecture-context.md`, prefer **one composed query** over several related queries.
- **Follow existing project conventions** (see §4): hardcoded brand hex via Tailwind arbitrary values, `font-[family-name:var(--font-anton)]` for headlines, shadcn components from `@/components/ui`, `useQuery`/`useMutation` from `convex/react`, `sonner` for toasts.
- **Next.js 16 is not the Next.js from training data.** Per `AGENTS.md`, consult the bundled guides in `node_modules/next/dist/docs/` for App Router, `next/font`, `next/image`, and metadata behavior before writing code. Heed deprecation notices.

---

## 1. Overall implementation strategy

### 1.1 File layout

Replace the placeholder `app/page.tsx` with a **Server Component** that composes focused section components. Data-driven sections are client components (they call `useQuery`).

```
app/
  page.tsx                      # Server Component — composes sections, sets dir/lang
  layout.tsx                   # (modified) add Anton + Be Vietnam Pro fonts, Material Symbols link
  (home)/                       # optional route group for public-only layout
    _components/
      top-nav.tsx              # client (mobile sheet menu)
      hero-section.tsx         # server (static)
      progress-section.tsx     # client (useQuery)
      recent-donors-section.tsx# client (useQuery)
      challenge-board.tsx      # client (useQuery + slot algorithm)
      donor-dialog.tsx         # client (shadcn Dialog)
      contribution-section.tsx # server (static)
      impact-section.tsx       # server (static)
      site-footer.tsx          # server (static)
      use-home-data.ts         # client hook: one query + derived state for the whole page
lib/
  constants.ts                 # (extended) add CAMPAIGN_DEADLINE_ISO, brand constants
  challenge.ts                 # pure client helper: build the 200-slot array (see §5.4)
public/
  images/
    car.jpeg                   # bus image (moved from repo-root images/car.jpeg — see §1.4)
```

The `(home)` route group is optional. If the team prefers flat files, place `_components/` directly under `app/`. The grouping only matters if we later want a public-specific layout (RTL, fonts) separate from admin.

### 1.2 Data strategy — one composed query drives the page

The architecture doc says *"the frontend should prefer one composed query over multiple related queries whenever practical."* `convex/donations.ts` already exports exactly the right function:

- **`api.donations.getDonationsWithDonors`** → returns every donation, newest-first, with the full donor document attached (`{ ...donation, donor }`). `donor` includes `name`, `imageUrl`, `phone`.

From this **single** query the page derives everything:

| Derived value | Derivation |
|---|---|
| Total raised | `sum(d.amount)` over all returned donations |
| Donor count (داعمين) | `new Set(donations.map(d => d.donorId)).size` |
| Latest donations (Recent Donors list) | first 10 of the array (already newest-first) |
| 200 Challenge slots | chronological pass (§5.4) |
| Donor's latest message (for dialog) | newest non-empty `note` among that donor's donations |

`api.donations.getTotalRaised` and `api.donations.getLatestDonations` exist as lighter alternatives if the team ever wants to split concerns, but the consolidated single-query approach is recommended because it matches the architecture invariant and avoids three subscriptions for one screen.

A single client hook `useHomeData()` wraps `useQuery(api.donations.getDonationsWithDonors)` and returns `{ donations, totalRaised, donorCount, latestDonations, slots, donorLatestNote }`. `ProgressSection`, `RecentDonorsSection`, and `ChallengeBoard` all consume the hook's output (lifted to the page or via a small context so the query runs once).

### 1.3 RTL & language

The HTML root is `<html dir="rtl" lang="ar">`. The shared `app/layout.tsx` currently sets `<html lang="en">` and is used by the (English) admin dashboard. To avoid disturbing admin:

- Keep `app/layout.tsx` as `lang="en"` for the document root.
- Wrap the home page content in `<div dir="rtl" lang="ar" className="...">` so Arabic flow + RTL is scoped to the public page.
- The top nav stays `dir="ltr"` (English links) exactly as in the HTML.
- Load Material Symbols Outlined + Anton + Be Vietnam Pro in the root layout (§4.2) — admin already references `var(--font-anton)`, so this fixes a latent gap there too.

### 1.4 Bus image location (discrepancy to resolve)

`app/instruction.md` says the bus image is at `@app/images/car.jpeg`, but the actual untracked file is at the **repo root**: `images/car.jpeg` (confirmed: `app/images/` does not exist; `images/car.jpeg` does). For Next.js, static assets must live under `public/`. **Recommendation:** copy `images/car.jpeg` → `public/images/car.jpeg` and reference it as `src="/images/car.jpeg"` with `next/image`. No source code outside `public/` is changed by this copy.

---

## 2. Component breakdown

Each section maps 1:1 to a section of `landingpage.html`. Arabic strings are copied verbatim.

### 2.1 `TopNav` (client) — `<nav dir="ltr">`
- Logo: `ASD Soccer Club` (Anton, primary green, uppercase, tracking-tighter).
- Desktop links (`hidden md:flex`): `Home`, `Our Goal`, `Donate`, `About`. Active state on `Our Goal` (secondary-container underline) per mock.
- `Support Now` button (secondary-container bg).
- **Mobile (`< md`):** replace the hidden link list with a hamburger button that opens a `Sheet` (existing shadcn component) listing the same links + `Support Now`. This is a responsive *addition*, not a redesign — the desktop nav is preserved pixel-faithfully.
- Links are in-page anchors (`#hero`, `#progress`, `#contribute`, `#impact`) since the site is a single page. No new routes.

### 2.2 `HeroSection` (server, static) — `#hero`
- Two-column grid (`lg:grid-cols-2`), stacked on mobile.
- Headline (verbatim):
  > وصلوا ASD للثنية:
  > اليد في اليد نشريو حافلة للجمعية
  (second line in `text-secondary-container`)
- Four paragraphs verbatim, including `🎯 هدفنا: 21 ألف يورو` (the `21,000` comes from `FUNDRAISING_GOAL_EUR`, rendered into the Arabic string).
- CTAs: `تبرع توة` (primary, secondary-container → hover primary-container) and `اعرف أكثر` (secondary outline). Both are anchor-style buttons scrolling to `#contribute` / `#impact`.
- Bus image: `next/image`, `src="/images/car.jpeg"`, `alt="ASD Soccer Club Team Bus"`, `priority`, `fill`/fixed height `h-[400px] lg:h-[600px]`, `object-cover`, `rounded-xl`, `border-2 border-primary`.

### 2.3 `ProgressSection` (client) — `#progress`
- Card (`bg-surface`, `border-2 border-outline-variant`, `rounded-lg`).
- Right (RTL start): raised amount `formatEur(totalRaised)` in `headline-xl` primary, plus `تجمعوا من هدف 21,000 يورو` (goal rendered from `FUNDRAISING_GOAL_EUR`).
- Left: `125 داعمين` → replace `125` with live `donorCount`; `15 أيام مازالت` → from `CAMPAIGN_DEADLINE_ISO` constant (§1.2 / §5.3 — no backend field exists).
- Progress bar: pill track `bg-surface-variant`, fill `bg-primary` width `Math.min(100, totalRaised / FUNDRAISING_GOAL_EUR * 100)%`, gold gradient glow at the leading edge (`bg-gradient-to-l from-secondary-container to-transparent`). `dir="ltr"` on the bar so it fills left-to-right.

### 2.4 `RecentDonorsSection` (client) — `#donors`
- Tab pill `أحدث التبرعات` (single tab; see §3 for Tabs decision).
- Donor cards (render first N from `latestDonations`, N=10 to match HTML's four-card mock with room to grow):
  - Avatar (`shadcn Avatar`): `AvatarImage src={donor.imageUrl}`, `AvatarFallback` = soccer icon or `initials(name)`.
  - Name (`donor.name`, `title-md`, uppercase) + date (`formatDate(createdAt)`).
  - Amount pill: `formatEur(amount)`, `bg-inverse-surface text-surface-bright rounded-full`.
- `عرض كل الداعمين` button → anchor to `#donors`/challenge (single page; no all-donors route in scope).

### 2.5 `ChallengeBoard` (client) — `#challenge`
- Title `تحدي الـ 200 خانة` + description (verbatim, with `100 يورو` bold).
- Container: `bg-surface border-4 border-primary p-6 rounded-xl relative overflow-hidden` with the giant `directions_bus` Material Symbol watermark at 10% opacity.
- `slot-grid` (CSS §4.4): `auto-fill minmax(40px,1fr)` on mobile, `repeat(20,1fr)` at `md+`. `dir="ltr"` so slot 1 is top-left.
- Exactly 200 cells. Occupied cell = donor image (`object-cover`, `rounded-sm`, interactive). Empty cell = `+` placeholder, non-interactive (or anchor to `#contribute`).
- Clicking an occupied slot opens `DonorDialog`.

### 2.6 `DonorDialog` (client) — shadcn `Dialog`
Content (per `instruction.md` §"200 Challenge Interaction"):
- Larger profile picture (`donor.imageUrl`, fixed size e.g. `size-24` / `w-40`, `rounded`).
- Donor name (`donor.name`).
- Total amount donated (`formatEur(totalDonated)`).
- Donation message — `donorLatestNote.get(donorId)`; **omit the section entirely if empty** (no placeholder).
- Close button (shadcn `DialogClose` / the dialog's built-in X).
- Responsive: `sm:max-w-md`, full-width on mobile with `max-w-[calc(100%-2rem)]` (already the dialog default), `role="dialog"` + focus trap from Radix.

### 2.7 `ContributionSection` (server, static) — `#contribute`
- Title `كيفاش تساهم`.
- 3-card grid (`md:grid-cols-3`):
  1. `تحويل بنكي (RIB)` — `account_balance` icon, RIB `FR76 1360 6000 7231 3343 7700 069` (`dir="ltr"`, monospace-ish bold tracking-wider).
  2. `المسؤل عن البترعات` — `person` icon, `Samir Al-Sharqi`.
  3. `الهاتف / واتساب` — `chat` icon, link `+33 6 61 62 58 42` → `https://wa.me/33661625842`.
- Italic note: `بعد مساهمتك، ابعثلنا ميساج باش تاخذ بلاصتك في التحدي!`

### 2.8 `ImpactSection` (server, static) — `#impact`
- Title `علاش حاجتنا بالحافلة هذه`.
- 3 cards (`groups` / `health_and_safety` / `workspace_premium` icons) with verbatim titles + paragraphs. Hover: border thickens to primary, bottom-border to secondary-container (per mock).

### 2.9 `SiteFooter` (server, static)
- `bg-inverse-surface`, `border-t-4 border-secondary`.
- `ASD Soccer Club` (headline-xl, secondary-fixed) + `© 2024 ASD Soccer Club - Building Our Future Together`.

---

## 3. Required shadcn/ui components

All components below **already exist** under `components/ui/` (confirmed by glob): `button`, `card`, `progress`, `table`, `input`, `textarea`, `label`, `select`, `dropdown-menu`, `avatar`, `tooltip`, `skeleton`, `sonner` (toaster), `separator`, `badge`, `hover-card`, `dialog`, `alert-dialog`, `sheet`.

Mapping:

| Section | shadcn component | Notes |
|---|---|---|
| TopNav (mobile) | `Sheet` | hamburger menu for `< md` |
| TopNav (desktop) | `Button` | `Support Now` CTA |
| Hero | `Button` | `تبرع توة` / `اعرف أكثر` |
| Progress | `Progress` *or* custom div | The mock's pill-with-glow is bespoke; use a custom styled `<div>` to match exactly. `Progress` is available but its styling is harder to match — recommend custom div. |
| Recent Donors | `Avatar`, `Skeleton` | avatar + loading states |
| Recent Donors tab | `Tabs` **(optional)** | Only one tab in the mock. A plain styled `<button>` is sufficient and cheaper. If semantic tabs are desired: `npx shadcn@latest add tabs` (not currently installed). |
| Challenge | `Dialog`, `Avatar` | donor info dialog |
| Dialog | `Dialog`, `DialogClose` | built-in close button already rendered |
| Contribution / Impact | `Card` (optional) | The mock uses plain `<div>`s with borders; `Card`/`CardHeader`/`CardContent` can be used but the brutalist borders/shadows are easier as plain divs matching admin convention. |

**Missing-component install commands** (only if the team chooses the optional routes above):
- Tabs: `npx shadcn@latest add tabs`

No other shadcn installs are required.

---

## 4. Required Tailwind styling strategy

### 4.1 Tailwind v4, not v3

The project uses **Tailwind CSS v4** (`@tailwindcss/postcss ^4`, `tailwindcss ^4`). There is **no `tailwind.config.js`** — the HTML's `tailwind.config = { theme: { extend: { colors, fontFamily, fontSize, spacing, borderRadius } } }` block does **not** apply. Configuration is done via CSS `@theme` in `app/globals.css` and/or Tailwind v4 arbitrary values.

The admin dashboard's established convention (which we follow) is **hardcoded hex via arbitrary values**: `bg-[#006b3f]`, `text-[#1c1b1b]`, `font-[family-name:var(--font-anton)]`, `shadow-[8px_8px_0px_#f0eded]`, `rounded-none`. The landing page will use the same convention so it visually matches the dashboard and the mock.

### 4.2 Brand palette (from `context/DESIGN.md` + the HTML config)

Use these hex values as arbitrary classes throughout (e.g. `bg-[#006b3f]`, `text-[#fed17b]`, `border-[#bdcabe]`):

| Token | Hex | Token | Hex |
|---|---|---|---|
| primary | `#006b3f` | primary-container | `#008751` |
| secondary | `#7a590c` | secondary-container | `#fed17b` |
| secondary-fixed | `#ffdea5` | surface | `#fcf9f8` |
| surface-container-low | `#f6f3f2` | surface-container | `#f0eded` |
| surface-container-high | `#eae7e7` | surface-variant | `#e5e2e1` |
| on-surface | `#1c1b1b` | on-surface-variant | `#3e4a41` |
| outline | `#6e7a70` | outline-variant | `#bdcabe` |
| inverse-surface | `#313030` | surface-bright | `#fcf9f8` |
| error | `#ba1a1a` | background | `#fcf9f8` |

(Optional cleanup: define these as CSS variables in `@theme` inside `globals.css` — e.g. `--color-primary: #006b3f;` — so classes like `bg-primary` work. This is a **stylistic refactor** and is **optional**; it must not change the rendered colors. Recommended only if the team wants token-based classes instead of arbitrary hex. Default recommendation: arbitrary hex to match existing admin code.)

### 4.3 Fonts

`app/layout.tsx` currently loads only `Geist` + `Geist_Mono`. The landing page (and already the admin pages) need **Anton** (headlines) and **Be Vietnam Pro** (body). Wire them with `next/font/google` and expose as CSS variables:

```tsx
// app/layout.tsx (additions)
import { Anton, Be_Vietnam_Pro } from "next/font/google";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"], weight: ["400", "700"], variable: "--font-be-vietnam",
});
```

Apply `${anton.variable} ${beVietnam.variable}` on `<html>` (alongside the existing Geist variables). Then:
- Headlines: `font-[family-name:var(--font-anton)]` (matches admin convention) and `uppercase`.
- Body: `font-[family-name:var(--font-be-vietnam)]`, or set `--font-sans` to Be Vietnam Pro in `@theme` so the default `font-sans` body uses it.

**Material Symbols Outlined** is an icon font, not available via `next/font`. Load it with a `<link>` in the root layout's `<head>` (via the `metadata`/`links` API or a raw `<link>` in the layout), matching the HTML:

```
https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap
```

Usage: `<span className="material-symbols-outlined no-rtl">sports_soccer</span>`.

### 4.4 Custom CSS (in `globals.css`)

Port the two small style rules from the HTML `<style>` block into `globals.css`:

```css
.slot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 4px;
}
@media (min-width: 768px) {
  .slot-grid { grid-template-columns: repeat(20, 1fr); }
}
[dir="rtl"] .material-symbols-outlined { transform: scaleX(-1); }
[dir="rtl"] .material-symbols-outlined.no-rtl { transform: scaleX(1); }
```

Also set the body default font to Be Vietnam Pro via `@layer base { html { @apply font-[family-name:var(--font-be-vietnam)]; } }` (or by aliasing `--font-sans`).

### 4.5 Type scale (responsive)

The HTML defines `display-lg` 72px / `headline-xl` 48px / `headline-lg` 32px / `title-md` 20px / `body-lg` 18px / `body-md` 16px / `label-bold` 14px. Since we use arbitrary values, render these as responsive arbitrary strings. Example for the hero headline:

```
text-[40px] leading-[44px] sm:text-[56px] sm:leading-[60px] lg:text-[72px] lg:leading-[80px]
```

All headline tokens get a mobile step down; body/label tokens stay fixed. This is the core of "mobile-first without just shrinking."

### 4.6 Icon strategy

The HTML uses Material Symbols throughout (`sports_soccer`, `directions_bus`, `account_balance`, `person`, `chat`, `groups`, `health_and_safety`, `workspace_premium`, `add`). To **faithfully recreate** the design, keep Material Symbols Outlined for the landing page (the font is loaded per §4.3). This intentionally diverges from the project's lucide default (`components.json` `iconLibrary: "lucide"`) because lucide has no soccer-ball or bus-equivalent that matches the mock. If the team prefers a single icon system, lucide near-equivalents are: `Landmark`, `User`, `MessageCircle`, `Users`, `ShieldCheck`, `Award`, `Plus` — but `sports_soccer`/`directions_bus` have no faithful lucide match. **Recommendation: keep Material Symbols on the landing page.**

---

## 5. Required Convex queries for each section

**Only existing functions are used.** No new queries/mutations. (Read `convex/_generated/ai/guidelines.md` before writing any Convex code — though here we only *consume* queries from the client.)

### 5.1 Primary query (drives the data-driven sections)

```ts
const donations = useQuery(api.donations.getDonationsWithDonors);
// each item: { _id, donorId, amount, note?, createdAt, donor: Doc<"donors"> | null }
// ordered newest-first (by_createdAt desc)
```

### 5.2 Per-section mapping

| Section | Query / source | How |
|---|---|---|
| TopNav | none | static |
| Hero | `lib/constants.ts` `FUNDRAISING_GOAL_EUR` | rendered into the `21 ألف يورو` string |
| Progress | `api.donations.getDonationsWithDonors` (derived) | `totalRaised = sum(amount)`; `donorCount = unique donorId` |
| Progress (goal) | `FUNDRAISING_GOAL_EUR` constant | |
| Progress (days left) | `CAMPAIGN_DEADLINE_ISO` constant (new, in `lib/constants.ts`) | **No backend field exists for a deadline** — see §5.3 |
| Recent Donors | `getDonationsWithDonors` (derived) | `latestDonations = donations.slice(0, 10)` (already newest-first) |
| Challenge | `getDonationsWithDonors` (derived) | chronological slot algorithm (§5.4) |
| DonorDialog (message) | `getDonationsWithDonors` (derived) | `donorLatestNote` map (§5.4) |
| Contribution | none | static |
| Impact | none | static |
| Footer | none | static |

### 5.3 Campaign deadline — backend gap (documented, not invented)

The mock shows `15 أيام مازالت` (days remaining). There is **no deadline field in the schema** and the instruction forbids backend changes. Options, in order of preference:

1. **Add a constant** `CAMPAIGN_DEADLINE_ISO` to `lib/constants.ts` (e.g. a fixed ISO date) and compute days remaining on the client. This is a config value, not backend functionality. **Recommended.**
2. Omit the "days remaining" element entirely.

State this explicitly to the user during implementation; do not silently invent a date.

### 5.4 200 Challenge slot algorithm (client-side, pure)

Implemented in `lib/challenge.ts` as a pure function tested independently. Input: the `getDonationsWithDonors` result. Output: a fixed-length-200 array of slot objects, each either `{ kind: "occupied", donorId, donor, totalDonated }` or `{ kind: "empty" }`, plus a `donorLatestNote: Map<Id<"donors">, string | undefined>` for the dialog.

**Business rules (from `instruction.md` + `project-overview.md`):**
- Slot count per donor = `floor(totalDonated / 100)`.
- Donations below €100 cumulative earn no slot.
- Donor images are repeated, never stretched.
- A donor with €200 → 2 consecutive slots; €300 → 3; etc.
- Slot order = oldest **qualifying** donor first (a donor "qualifies" when cumulative total first reaches ≥ €100).
- Fill top-left → left-to-right, top-to-bottom. Exactly 200 slots; overflow truncated, underflow padded with empty.

**Algorithm:**

```ts
// 1. Chronological order (oldest first)
const chrono = [...donations].sort((a, b) => a.createdAt - b.createdAt);

// 2. Per-donor accumulation + qualification timestamp
const total = new Map<Id, number>();
const qualifiedAt = new Map<Id, number>();
const firstDonationAt = new Map<Id, number>();
for (const d of chrono) {
  if (!d.donor) continue;                 // orphan donation (shouldn't happen; deleteDonor cascades)
  total.set(d.donorId, (total.get(d.donorId) ?? 0) + d.amount);
  if (!firstDonationAt.has(d.donorId)) firstDonationAt.set(d.donorId, d.createdAt);
  if ((total.get(d.donorId) ?? 0) >= 100 && !qualifiedAt.has(d.donorId)) {
    qualifiedAt.set(d.donorId, d.createdAt);
  }
}

// 3. Qualifying donors, sorted oldest-qualifier-first (tie-break: first donation)
const qualifiers = [...qualifiedAt.entries()]
  .map(([donorId, qAt]) => ({
    donorId,
    donor: donations.find(d => d.donorId === donorId)!.donor!,
    totalDonated: total.get(donorId)!,
    qAt,
    firstAt: firstDonationAt.get(donorId)!,
  }))
  .sort((a, b) => a.qAt - b.qAt || a.firstAt - b.firstAt);

// 4. Build occupied slots (each donor's slots are consecutive)
const occupied: Slot[] = [];
for (const q of qualifiers) {
  const count = Math.floor(q.totalDonated / 100);
  for (let i = 0; i < count; i++) {
    occupied.push({ kind: "occupied", donorId: q.donorId, donor: q.donor, totalDonated: q.totalDonated });
  }
}

// 5. Fixed 200-cell board
const TOTAL_SLOTS = 200;
const board: Slot[] = [];
for (let i = 0; i < TOTAL_SLOTS; i++) board.push(occupied[i] ?? { kind: "empty" });

// 6. Latest non-empty note per donor (for the dialog)
const donorLatestNote = new Map<Id, string | undefined>();
for (const d of donations) {                       // already newest-first
  if (d.donorId && d.note?.trim() && !donorLatestNote.has(d.donorId)) {
    donorLatestNote.set(d.donorId, d.note.trim());
  }
}
```

**Decisions / assumptions to confirm with the user (documented in code comments):**
- "Oldest qualifying donor first" is interpreted as **ordered by when cumulative total first reached ≥ €100** (tie-break: first-ever donation). Alternative interpretation: ordered by the donor's first donation. State this assumption; the algorithm is isolated in `lib/challenge.ts` so it can be flipped in one place.
- Slots are **grouped per donor** (a donor's slots are consecutive), matching "A donor with €200 occupies two consecutive horizontal slots." This is *not* an interleaved/by-donation slot assignment.
- If the board is overfunded (>200 occupied slots), only the first 200 render; the rest are truncated. Log/warn in dev.
- "Donation message" in the dialog = the donor's newest non-empty donation `note`. If a donor has multiple notes, only the newest is shown (to avoid an oversized dialog). Alternative (concatenate all notes) is rejected as out of scope.

**Why client-side and not a new Convex query?** The instruction forbids new queries (`Do NOT create new Convex queries`). The architecture doc prefers business logic in Convex, so a future enhancement would be a `getChallengeBoard` query; that is **explicitly out of scope** here and is noted as a recommended follow-up, not implemented.

---

## 6. Responsive implementation strategy (mobile-first)

General principles applied at every breakpoint: stack multi-column layouts vertically on mobile; full-width forms/inputs/buttons; comfortable touch targets (≥ 40px); no horizontal scrolling; preserve the desktop experience at `lg+`.

| Section | `< sm` (mobile) | `sm` | `md` | `lg` / `xl` |
|---|---|---|---|---|
| TopNav | hamburger `Sheet` + logo + `Support Now` (icon-ish) | same | full link list, no hamburger | same, wider container |
| Hero | 1 col: text then image; headline 40px; image `h-[300px]` | headline 56px; image `h-[400px]` | same | 2 cols; headline 72px; image `h-[600px]` |
| Progress | stats stack vertically (raised block above donor/days row) | stats row | row, full card | same, max-w-7xl |
| Recent Donors | single-column cards; card internals wrap (avatar top, amount below) | same | same | same, max-w-3xl |
| Challenge | `auto-fill minmax(40px,1fr)` → ~8 cols on a 360px screen, more rows; container `p-3` | same | `repeat(20,1fr)` fixed 20-col grid; `p-6` | same, bus watermark larger |
| Contribution | 1 col, cards stack | same | 3 cols | same |
| Impact | 1 col | same | 3 cols | same |
| Footer | 1 col | same | 3 cols | same |

Specifics:
- **Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-grid-margin` (map `grid-margin` 32px → `px-8`).
- **Section gaps:** `py-16 sm:py-20 lg:py-20` (80px = `py-20`; mobile reduces to `py-16`).
- **Touch targets:** all buttons `min-h-[44px]`; challenge cells `min-w-[40px] aspect-square`.
- **Type:** headline tokens step down one notch per breakpoint below `lg` (§4.5).
- **No horizontal scroll:** the challenge grid uses `auto-fill` on mobile so it wraps within the viewport; the bus watermark is `overflow-hidden` inside the card.
- **RTL-aware:** fl/grid layouts use logical flow under `dir="rtl"`; the progress bar and slot grid are explicitly `dir="ltr"` so fill/slot order matches the design.

---

## 7. Step-by-step implementation checklist

Ordered so each step is independently verifiable.

1. **Assets** — Copy `images/car.jpeg` → `public/images/car.jpeg`. (No code change.)
2. **Fonts & icons** — Edit `app/layout.tsx`: add `Anton` + `Be_Vietnam_Pro` via `next/font/google` with `--font-anton` / `--font-be-vietnam` variables on `<html>`; add the Material Symbols Outlined `<link>`. Update `metadata` title/description to the ASD club title.
3. **globals.css** — Add the `.slot-grid` rules, RTL material-symbols flip rules, and (optional) brand `@theme` tokens / body font base layer.
4. **Constants** — Add `CAMPAIGN_DEADLINE_ISO` (and, if useful, `TOTAL_CHALLENGE_SLOTS = 200`) to `lib/constants.ts`. Confirm `FUNDRAISING_GOAL_EUR` is reused.
5. **Slot helper** — Implement `lib/challenge.ts` (`buildChallengeBoard(donations)` + `donorLatestNote` map). Add a small unit test (vitest) with the project-overview examples (John 250 → 2, Mike 100 → 1, Ali 40 → 0).
6. **Home data hook** — Implement `app/(home)/_components/use-home-data.ts`: `useQuery(api.donations.getDonationsWithDonors)` + derive `totalRaised`, `donorCount`, `latestDonations`, `board`, `donorLatestNote`. Return `undefined`-while-loading so sections can render `Skeleton`s.
7. **Static sections** — Build `HeroSection`, `ContributionSection`, `ImpactSection`, `SiteFooter` as server components with verbatim Arabic text and the brand classes.
8. **TopNav** — Client component; desktop links + `Support Now`; mobile `Sheet` menu. `dir="ltr"`.
9. **ProgressSection** — Client; consumes hook; renders raised/goal/count/days + pill bar with gold glow. `Skeleton` while loading.
10. **RecentDonorsSection** — Client; consumes hook; renders latest 10 donor cards with `Avatar` + amount pill. `Skeleton` list while loading.
11. **DonorDialog** — Client; `Dialog` with larger image, name, `formatEur(totalDonated)`, message (omitted if absent), close button. Accessible + responsive.
12. **ChallengeBoard** — Client; consumes hook; renders the 200-cell grid from `board`; occupied cells open `DonorDialog`. Bus watermark. `Skeleton` grid while loading.
13. **Page composition** — Replace `app/page.tsx` with a server component that wraps content in `<div dir="rtl" lang="ar">` and composes the sections in order with `id` anchors.
14. **Verify** — `npm run dev`, exercise at `sm`/`md`/`lg` widths, click a donor slot, confirm dialog content + close, confirm realtime update by adding a donation in the admin dashboard and watching the public page update without refresh.
15. **GitNexus** — Before committing, run `detect_changes()` (per `CLAUDE.md`) to confirm only expected symbols/flows are affected. (No Convex symbols are touched, so risk should be LOW.)
16. **Lint/build** — `npm run lint` and `npm run build` clean.

> If any step requires editing an existing function/class/method, run `impact({target, direction: "upstream"})` first and report blast radius before editing (per `CLAUDE.md`). Steps 2, 3, 4 touch existing files (`layout.tsx`, `globals.css`, `lib/constants.ts`) — run impact on `RootLayout` and the constants module before editing.

---

## 8. Acceptance criteria

The implementation is complete when **all** of the following are true.

### 8.1 Functional
- [ ] The home page renders at `/` with `dir="rtl" lang="ar"` and all Arabic text verbatim from `landingpage.html` (no translation, no rewording).
- [ ] Total raised, donor count, recent donors, and the 200 Challenge all populate from Convex via **existing** queries only — no new queries/mutations were added.
- [ ] The page updates in realtime when the admin creates/edits/deletes a donation or donor (no manual refresh).
- [ ] The 200 Challenge always renders exactly 200 cells; donor with €200 → 2 consecutive slots, €300 → 3; donor with <€100 cumulative → no slot; slots ordered oldest-qualifying-donor-first; overflow truncated, empty slots blank.
- [ ] Clicking/tapping an occupied slot opens a shadcn `Dialog` (not a browser alert) showing larger picture, name, total donated, and (if present) the donation message; if no message, the message section is omitted (no empty placeholder); a close button works.
- [ ] The dialog is responsive, keyboard-accessible (focus trap, Esc to close), and labelled.
- [ ] No authentication is required to view the public page; no auth code was added.

### 8.2 Visual / responsive
- [ ] Desktop layout (`lg`/`xl`) matches `landingpage.html` pixel-faithfully: same colors (Pitch Power palette), same Anton/Be Vietnam Pro typography, same brutalist borders/shadows, same RTL flow.
- [ ] At `sm` and `md`, layouts reflow (multi-column → stacked, full-width controls, larger touch targets, smaller headline steps) without horizontal scrolling.
- [ ] The bus image displays from `public/images/car.jpeg` via `next/image` with `priority`.
- [ ] Material Symbols render correctly and are flipped appropriately under RTL (icons marked `no-rtl` stay un-flipped).
- [ ] Loading states use `Skeleton`s; empty states (e.g. no donations yet) render gracefully without crashing.

### 8.3 Code quality / conventions
- [ ] Components follow the existing conventions: hardcoded brand hex via arbitrary Tailwind values, `font-[family-name:var(--font-anton)]` headlines, shadcn from `@/components/ui`, `cn()` from `@/lib/utils`, `sonner` for any toasts, `formatEur`/`formatDate` from `@/lib/format`.
- [ ] Business logic is isolated in `lib/challenge.ts` (pure, testable); React components stay presentational.
- [ ] No new dependencies added beyond optional shadcn components listed in §3.
- [ ] `npm run lint` and `npm run build` pass.
- [ ] `detect_changes()` confirms the change set is limited to the public home page + shared font/layout wiring; no Convex/Clerk/schema changes.

### 8.4 Explicitly out of scope (must NOT have been done)
- [ ] No new Convex query or mutation.
- [ ] No Convex schema change.
- [ ] No Clerk/auth change; no authentication on the public page.
- [ ] No online payments / Stripe / checkout.
- [ ] No new all-donors route (the "عرض كل الداعمين" button is an in-page anchor).
- [ ] No redesign of the interface (colors, typography, layout philosophy preserved).

---

## 9. Notes handed off to the implementer

- **Next.js 16:** read `node_modules/next/dist/docs/` for any App Router / `next/font` / `next/image` deltas before step 2 and 13.
- **Convex:** re-read `convex/_generated/ai/guidelines.md` before touching any Convex code (we only *consume* `api.donations.getDonationsWithDonors` here, but the guidelines cover client hook usage too).
- **`next/image` remote patterns:** donor images live on Vercel Blob. If `next/image` is used for donor slot/dialog images (instead of plain `<img>` via `Avatar`), add the blob host to `next.config.ts` `images.remotePatterns`. The existing admin uses plain `<img>` through `AvatarImage` and does **not** configure remote patterns — recommend the same approach for the challenge grid to stay consistent and avoid a config change.
- **Currency:** use `formatEur` from `@/lib/format` (renders `€`). The mock shows `$` in donor cards — treat that as a mock artefact; the project currency is euros.
- **Deadline field gap:** confirm with the user whether to use a `CAMPAIGN_DEADLINE_ISO` constant or omit the "days remaining" element (§5.3).

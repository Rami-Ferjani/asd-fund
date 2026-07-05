# Donor Image Upload (Vercel Blob) — Implementation Plan

> **Scope:** This is a **planning document only**. It does not modify source code.
> It specifies exactly how to replace the manual "Profile Picture URL" text field
> with a file‑picker upload flow backed by Vercel Blob, while leaving the Convex
> backend, Clerk auth, and all existing business logic untouched.

---

## 1. Overall Architecture

The application already stores donor images as URLs in the `donors.imageUrl` field
(see `convex/schema.ts:9` and `convex/donors.ts:4-17`). The only thing that changes
is **how the URL enters the system**: instead of the admin pasting a URL into a text
field, the admin picks a file, the file is uploaded to Vercel Blob through a new
Next.js API route, Vercel Blob returns the public URL, and that URL is then passed
to the **existing** `createDonor` / `updateDonor` Convex mutations.

```
Admin browser
   │  1. user clicks "Upload Image" → native file picker (input[type=file])
   │  2. file selected → preview shown → POST /api/upload (multipart/form-data)
   ▼
Next.js API Route  (app/api/upload/route.ts)
   │  3. validate file type/size
   │  4. put(file, { access: 'public' })  ← @vercel/blob (server-side, token stays secret)
   ▼
Vercel Blob Storage
   │  5. returns { url, pathname, ... }
   ▼
Next.js API Route → response { url } (JSON)
   │
   ▼
Admin browser
   │  6. stores returned URL in local `imageUrl` state
   │  7. on "Save", calls existing Convex mutation with that URL
   ▼
Convex  (createDonor / updateDonor — UNCHANGED)
   │  8. stores imageUrl in donors table
   ▼
Realtime UI update (existing)
```

**Why an API route (not client-side `@vercel/blob` upload):** the instruction
explicitly requires the upload to go **through a Next.js API route**, and this keeps
the `BLOB_READ_AND_WRITE_TOKEN` server-side. The browser never sees the Blob token.

**Why `XMLHttpRequest` for the request (not `fetch`):** `fetch` has no standard
upload‑progress event; `XMLHttpRequest` exposes `progress` events on `upload`, which
lets us drive the existing shadcn `Progress` bar during the upload.

**No backend changes outside the upload route.** Convex schema, queries, mutations,
Clerk, and auth are all untouched. The route itself does **not** add authentication
(per the instruction: "Do not add authentication"). It relies on the admin dashboard
being the only place that calls it; this is consistent with the instruction's
constraints. (A note in §8 flags hardening as a future consideration.)

---

## 2. Upload Flow

### Create‑donor flow (`AddDonorDialog`)

1. Admin opens the "Add New Donor" dialog.
2. Fills name + phone as today.
3. Clicks **"Upload Image"** button → native file picker opens
   (`<input type="file" accept="image/*" />`).
4. On file selection:
   - Validate MIME type + size client-side (early rejection).
   - Generate a local object URL (`URL.createObjectURL`) for instant preview.
   - Start `POST /api/upload` via `XMLHttpRequest`.
   - Show the shadcn `Progress` bar, updating on `xhr.upload.onprogress`.
5. On `200`: parse `{ url }`, store it in `imageUrl` state, hide the progress bar,
   keep the preview. The "Save" button becomes enabled.
6. On error: show a toast, keep preview disabled, allow retry.
7. Admin clicks **Save** → existing `createDonor({ name, imageUrl, phone })` runs.
   The Blob URL is what gets stored in Convex. **The image itself never enters Convex.**

### Edit‑donor flow (`EditDonorDialog`)

1. Dialog opens with `imageUrl` pre‑seeded from `donor.imageUrl` (existing behavior).
2. Preview shows the current image immediately (it is already a Blob URL or any URL).
3. Admin clicks **"Replace Image"** → same file‑picker + upload flow as above.
4. On success, `imageUrl` state is replaced with the new Blob URL; preview updates.
5. Admin clicks **Save** → existing `updateDonor({ donorId, name, imageUrl, phone })`
   runs with the new URL.
6. If the admin does not replace the image, the existing URL is preserved unchanged.

### Donations page flow (shared `AddDonorDialog`)

The donations page (`app/admin/donations/page.tsx`) does not contain donor fields
itself; it delegates donor creation to the shared component
`app/admin/donations/_components/AddDonorDialog.tsx`. That component receives the
**same** upload UI as the donors‑page `AddDonorDialog`. No change is needed to
`app/admin/donations/page.tsx` itself; the change is in its `_components/AddDonorDialog.tsx`.

---

## 3. Required Next.js API Route

**File to create:** `app/api/upload/route.ts`

**Responsibility:** accept a single image upload, validate it, store it in Vercel
Blob with `access: 'public'`, and return the public URL as JSON.

**Environment variable required:** `BLOB_READ_AND_WRITE_TOKEN` (Vercel Blob token
from the Vercel project's Blob store). Must be present in `.env.local` for local dev
and in the Vercel project environment for production. `@vercel/blob` reads this
automatically; the route does not pass it manually.

**Route contract:**

- **Method:** `POST`
- **Request:** `multipart/form-data` with field name `file` (a single `File`).
- **Response 200:** `{ "url": string, "pathname": string }`
- **Response 400:** `{ "error": string }` — missing/invalid file, wrong type, too big.
- **Response 500:** `{ "error": string }` — Blob upload failure.

**Validation rules (enforced server-side, defense in depth):**
- Field `file` must be present and a `File` (not a plain string).
- MIME type must start with `image/`. Allowed: `image/png`, `image/jpeg`, `image/webp`,
  `image/gif`.
- Size ≤ 4 MB (matches the kind of small profile pictures this feature is for and
  keeps route memory bounded).

**Implementation (`app/api/upload/route.ts`):**

```ts
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

export async function POST(request: Request): Promise<Response> {
  // 1. Parse multipart form data.
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = form.get("file");

  // 2. Basic presence + type checks.
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No file uploaded. Expected a file under the 'file' field." },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || "unknown"}. Use PNG, JPEG, WebP, or GIF.` },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max 4 MB.` },
      { status: 400 },
    );
  }

  // 3. Upload to Vercel Blob. Token comes from BLOB_READ_AND_WRITE_TOKEN env var.
  try {
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true, // prevents filename collisions overriding existing images
    });
    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    console.error("Blob upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload image. Please try again." },
      { status: 500 },
    );
  }
}
```

**Notes:**
- `addRandomSuffix: true` (the default) ensures each upload gets a unique URL so
  replacing a donor image never overwrites another donor's image at the same path.
- The route does **not** import or call Convex, Clerk, or any business logic. It is
  a pure upload‑and‑return‑URL endpoint, exactly as the instruction allows.
- No client‑side Blob token is ever exposed.

---

## 4. Required Frontend Changes

There are **three** components to modify. Each replaces its `imageUrl` text `<Input>`
with a small `ImageUpload` widget (defined in §5) and wires the returned Blob URL
into the same state field the text input used to drive.

### 4.1 `app/admin/donors/page.tsx` — inline `AddDonorDialog`

**Current (lines 155-168):** a `Profile Picture URL` text `<Input>` bound to `imageUrl`,
plus a helper paragraph "Paste an image URL. File upload is coming soon."

**Change:**
- Remove the `<Input id="add-image" ... />` and its helper paragraph.
- Replace with `<ImageUpload value={imageUrl} onChange={setImageUrl} />`.
- `handleSubmit` (lines 96-115) stays **unchanged** — it still requires `imageUrl.trim()`
  and calls `createDonor({ name, imageUrl, phone })`. The `imageUrl` now comes from the
  upload instead of the text field.
- The `handleOpenChange` reset (line 93, `setImageUrl("")`) stays — it now clears any
  uploaded preview when the dialog reopens.

### 4.2 `app/admin/donors/page.tsx` — inline `EditDonorDialog`

**Current (lines 261-272):** a `Profile Picture URL` text `<Input>` bound to `imageUrl`
(initialised from `donor.imageUrl`).

**Change:**
- Remove the `<Input id="edit-image" ... />` and helper paragraph.
- Replace with `<ImageUpload value={imageUrl} onChange={setImageUrl} />`.
- Because `imageUrl` is initialised to `donor.imageUrl` in `handleOpenChange`
  (line 199), the widget shows the **existing** image preview immediately, and the
  "Replace Image" action uploads a new one and overwrites `imageUrl` state.
- `handleSave` (lines 203-223) stays **unchanged** — it still calls
  `updateDonor({ donorId, name, imageUrl, phone })`. If the admin never replaces the
  image, the original URL is submitted unchanged.

### 4.3 `app/admin/donations/_components/AddDonorDialog.tsx` — shared `AddDonorDialog`

**Current (lines 94-98):** a `Profile Picture URL` text `<Input>` bound to `imageUrl`,
plus the "File upload is coming soon" helper.

**Change:**
- Remove the `<Input id="add-image" ... />` and helper paragraph.
- Replace with `<ImageUpload value={imageUrl} onChange={setImageUrl} />`.
- `handleSubmit` (lines 46-63) stays **unchanged** — still requires `imageUrl.trim()`
  and calls `createDonor({ name, imageUrl, phone })`, then fires `onDonorCreated(id)`.
- The `useEffect` reset (lines 38-44, `setImageUrl("")`) stays — it clears the preview
  when the dialog reopens.

### 4.4 What does NOT change

- `app/admin/donations/page.tsx` — no edit required. It only composes
  `<AddDonationForm />`, which already embeds the shared `AddDonorDialog`. The upload
  capability reaches the donations page through that shared component.
- `convex/schema.ts`, `convex/donors.ts`, `convex/donations.ts` — untouched.
- Clerk auth and `app/admin/layout.tsx` — untouched.
- The `Avatar` rendering in `DonorRow` and the mobile card list (donors page) —
  untouched; they already read `donor.imageUrl`.

---

## 5. Required shadcn/ui Components

**Already installed in `components/ui/` (verified):** `button`, `input`, `label`,
`progress`, `avatar`, `dialog`, `alert-dialog`, `skeleton`, `sonner`.

**New component to create (project‑local, not an npm install):**
`components/image-upload.tsx` — a small, reusable `<ImageUpload>` widget built from
the existing shadcn primitives. It owns: the hidden file input, the "Upload Image" /
"Replace Image" button, the live preview, and the progress bar.

**Why a separate component:** the same upload UI is used in three dialogs. A single
component keeps the XHR upload logic, validation, and preview in one place (DRY) and
matches the project convention of focused, reusable components (see
`architecture-context.md` "Frontend Architecture" and `project-overview.md`
"Development Philosophy": "Keep components reusable and readable").

**No new shadcn registry components are strictly required** — `button`, `progress`,
and `avatar` (for the preview ring) cover everything. If a richer dropzone experience
were wanted later, `npx shadcn@latest add https://sdn.sridharjanij.com/registry/file-upload`
-style third‑party components exist, but drag‑and‑drop is explicitly **out of scope**
per the instruction, so none are recommended.

**`<ImageUpload>` interface:**

```ts
type ImageUploadProps = {
  value: string;                // current imageUrl (Blob URL from prior upload, or existing donor URL)
  onChange: (url: string) => void;
  className?: string;
};
```

**Behavior:**
- Renders a circular preview of `value` (using the existing `Avatar` + `AvatarImage` /
  `AvatarFallback` pair, fallback shows an `ImagePlus` icon).
- Renders a button: "Upload Image" when `value` is empty, "Replace Image" when set.
- Hidden `<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" />`
  triggered by the button click.
- On selection: client‑side type/size check (same rules as the route, 4 MB), then XHR
  POST to `/api/upload`, then `onChange(returnedUrl)`.
- Shows `Progress` (0–100) during upload; hides it on completion.
- Shows error toast via `sonner` on failure and leaves `value` unchanged.
- `disabled` while an upload is in flight (prevents double‑submit).

**Reference implementation (`components/image-upload.tsx`):**

```tsx
"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB — must match app/api/upload/route.ts

export type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  className?: string;
};

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null); // null = not uploading

  function openPicker() {
    inputRef.current?.click();
  }

  async function handleFile(file: File) {
    // Client-side pre-validation (mirrors the route's checks for early feedback).
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Unsupported file type. Use PNG, JPEG, WebP, or GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(`File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max 4 MB.`);
      return;
    }

    const form = new FormData();
    form.append("file", file);

    setProgress(0);

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const { url } = JSON.parse(xhr.responseText) as { url: string };
            onChange(url);
            toast.success("Image uploaded");
            resolve();
          } catch {
            toast.error("Unexpected response from upload.");
            reject(new Error("bad response"));
          }
        } else {
          let msg = "Upload failed.";
          try {
            const body = JSON.parse(xhr.responseText) as { error?: string };
            if (body.error) msg = body.error;
          } catch {
            /* keep default */
          }
          toast.error(msg);
          reject(new Error(msg));
        }
      };

      xhr.onerror = () => {
        toast.error("Network error during upload.");
        reject(new Error("network"));
      };

      xhr.send(form);
    }).catch(() => {
      // errors already surfaced via toast; nothing else to do
    }).finally(() => {
      setProgress(null);
    });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    // allow re-selecting the same file later
    e.target.value = "";
  }

  const uploading = progress !== null;

  return (
    <div className={`flex flex-col gap-3 ${className ?? ""}`}>
      <div className="flex items-center gap-4">
        <Avatar className="size-16 rounded-full border-2 border-[#e5e2e1]">
          <AvatarImage src={value} alt="Selected donor image" />
          <AvatarFallback className="bg-[#eae7e7] text-[#006b3f]">
            <ImagePlus className="size-6" />
          </AvatarFallback>
        </Avatar>

        <Button
          type="button"
          variant="outline"
          onClick={openPicker}
          disabled={uploading}
          className="border-2 border-[#008751] text-[#006b3f] hover:bg-[#008751] hover:text-[#fdfff9] rounded-none uppercase font-bold tracking-[0.05em] text-xs"
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {value ? "Replace Image" : "Upload Image"}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {uploading && (
        <div className="flex flex-col gap-1">
          <Progress value={progress ?? 0} className="h-2" />
          <p className="text-xs text-[#3e4a41]">Uploading… {progress ?? 0}%</p>
        </div>
      )}

      {!uploading && value && (
        <p className="text-xs text-[#3e4a41]">Image ready. Click "Replace Image" to change it.</p>
      )}
    </div>
  );
}
```

**Styling rationale (matches `context/DESIGN.md`):** 2px green borders, `rounded-none`
(the project's button shape — see donors page "Add New Donor" button at line 120),
uppercase Be Vietnam Pro label‑bold tracking, neutral/green palette, no soft shadows.
The preview uses the same `Avatar` already used in `DonorRow` (donors page line 345).

---

## 6. Required npm Packages

**None to install.**

- `@vercel/blob` ^2.5.0 — already present in `package.json` (line 12). Provides `put()`
  used by the API route.
- `react`, `next`, `convex`, `sonner`, `lucide-react` — already present.
- `lucide-react` provides `ImagePlus` and `Loader2` (used in the widget). `lucide-react`
  is already a dependency and these icons are part of the standard set.

> If, during implementation, you decide a third‑party dropzone component would help,
> the instruction requires **asking for approval before installing**. Per the
> instruction, drag‑and‑drop is **not** required, so no such package is recommended here.

---

## 7. Step‑by‑Step Implementation Checklist

Each step is small and independently verifiable. Steps are grouped by file.

### A. Environment setup

- [ ] **A1.** Create or confirm a Vercel Blob store in the project's Vercel dashboard
  and copy the `BLOB_READ_AND_WRITE_TOKEN`.
- [ ] **A2.** Add `BLOB_READ_AND_WRITE_TOKEN` to `.env.local` (local dev) and to the
  Vercel project environment (Production + Preview). Do **not** commit `.env.local`.
- [ ] **A3.** Restart the dev server so the route can read the new variable.

### B. API route

- [ ] **B1.** Create `app/api/upload/route.ts` with the code in §3.
- [ ] **B2.** Manually verify the route in isolation: run
  `curl -i -F "file=@/path/to/photo.png" http://localhost:3000/api/upload`
  and confirm a `200` with `{"url":"https://...public.blob...","pathname":"..."}`.
- [ ] **B3.** Verify rejection paths:
  - no file → `400` with the "No file uploaded" message.
  - wrong type (e.g. a `.txt`) → `400` "Unsupported file type".
  - file > 4 MB → `400` "File too large".
- [ ] **B4.** Confirm the uploaded image is publicly reachable at the returned URL
  in a browser tab.

### C. Shared upload widget

- [ ] **C1.** Create `components/image-upload.tsx` with the code in §5.
- [ ] **C2.** Run `npm run lint` — expect no new errors.
- [ ] **C3.** Temporarily import `<ImageUpload value="" onChange={(u)=>console.log(u)} />`
  into a throwaway spot, upload an image, and confirm the preview + `Progress` + returned
  URL all work. Remove the throwaway usage after.

### D. Donors page — Add dialog

- [ ] **D1.** In `app/admin/donors/page.tsx`, `AddDonorDialog`: remove the
  `Profile Picture URL` `<Input>` block (lines ~155-168) and its helper paragraph.
- [ ] **D2.** Add `import { ImageUpload } from "@/components/image-upload";` at the top.
- [ ] **D3.** Render `<ImageUpload value={imageUrl} onChange={setImageUrl} />` where the
  text input was.
- [ ] **D4.** Leave `handleSubmit`, `handleOpenChange`, and the `createDonor` mutation
  call **untouched**.
- [ ] **D5.** Manually verify: open Add dialog → upload image → preview shows → Save →
  donor appears in the table with the uploaded avatar, and the Convex `donors` row holds
  the Blob URL (check via the existing realtime list, no DB inspection needed).

### E. Donors page — Edit dialog

- [ ] **E1.** In `app/admin/donors/page.tsx`, `EditDonorDialog`: remove the
  `Profile Picture URL` `<Input>` block (lines ~261-272) and helper paragraph.
- [ ] **E2.** Render `<ImageUpload value={imageUrl} onChange={setImageUrl} />`.
- [ ] **E3.** Leave `handleSave`, `handleOpenChange`, and the `updateDonor` call untouched.
- [ ] **E4.** Manually verify: open Edit dialog → existing image previews → click
  "Replace Image" → upload new → Save → table avatar updates in realtime.

### F. Donations page — shared AddDonorDialog

- [ ] **F1.** In `app/admin/donations/_components/AddDonorDialog.tsx`: remove the
  `Profile Picture URL` `<Input>` block (lines ~94-98) and helper paragraph.
- [ ] **F2.** Add `import { ImageUpload } from "@/components/image-upload";`.
- [ ] **F3.** Render `<ImageUpload value={imageUrl} onChange={setImageUrl} />`.
- [ ] **F4.** Leave `handleSubmit`, the `useEffect` reset, and the `createDonor` call
  untouched.
- [ ] **F5.** Manually verify: on the donations page, click "Add New Donor" inside the
  donation form → upload image → Save → the new donor is auto‑selected for the donation.

### G. Cross‑cutting verification

- [ ] **G1.** `npm run lint` — clean.
- [ ] **G2.** `npm run build` — succeeds (route and client component type‑check).
- [ ] **G3.** Run `detect_changes()` (per project GitNexus rules) before committing to
  confirm the only affected symbols/flows are the three dialogs and the new route —
  no Convex symbols touched.
- [ ] **G4.** Commit in logical chunks: (1) `feat: add /api/upload route (Vercel Blob)`,
  (2) `feat: add reusable ImageUpload component`, (3)
  `feat: replace donor image URL field with upload flow`.

---

## 8. Error Handling Strategy

| Failure | Where caught | User‑facing behavior |
|---|---|---|
| No file selected | n/a — file picker cancelled | Nothing happens; no state change. |
| Wrong MIME / extension | Client (`ImageUpload`) **and** route | Toast: "Unsupported file type. Use PNG, JPEG, WebP, or GIF." No upload attempted. |
| File > 4 MB | Client (`ImageUpload`) **and** route | Toast: "File too large (… MB). Max 4 MB." No upload attempted. |
| Network error / route unreachable | Client (`xhr.onerror`) | Toast: "Network error during upload." Preview cleared, `value` unchanged, retry allowed. |
| Route returns 4xx | Client (`xhr.onload`, non‑2xx) | Toast with the route's `error` message. `value` unchanged. |
| Route returns 5xx (Blob `put` failed) | Route → client | Route logs to server console; client shows "Failed to upload image. Please try again." |
| Upload succeeds but `createDonor`/`updateDonor` fails | Existing dialog handlers (lines 110, 218, 60) | Existing toasts: "Failed to add donor" / "Failed to update donor". The Blob URL is already in state, so the admin can retry Save without re‑uploading. |
| Admin clicks Save before upload finishes | `ImageUpload` button is `disabled` during upload; Save is still clickable but `imageUrl` is unchanged → existing "Name and image URL are required." toast fires. (Optional polish: also disable Save while `uploading` — see note below.) |

**Orphaned blobs:** if an upload succeeds but the donor is never saved (admin cancels
the dialog), the Blob asset is orphaned. This is acceptable for this low‑volume,
single‑admin app (matches `project-overview.md` "Development Philosophy": simplicity
over unnecessary complexity). A periodic Blob‑lifecycle cleanup is **out of scope** and
not recommended now.

**Replacing images on edit:** when the admin replaces an image during edit, the
**previous** Blob URL is simply abandoned (orphaned) and the new one stored. This is
intentional — deleting the old blob would require a delete API route and tracking
which URLs are still referenced, which is outside the instruction's scope and adds
complexity the project explicitly avoids.

**Optional hardening note (not part of this plan):** the `/api/upload` route has no
auth per the instruction. If a future task requires it, protect it with Clerk's
`auth().protect()` or a Clerk‑ middleware‑level admin check. Do **not** add this now —
the instruction says "Do not add authentication."

---

## 9. Acceptance Criteria

The implementation is complete when **all** of the following are true:

1. **No manual URL field.** None of the three donor dialogs
   (`app/admin/donors/page.tsx` inline `AddDonorDialog` & `EditDonorDialog`,
   `app/admin/donations/_components/AddDonorDialog.tsx`) contain a "Profile Picture URL"
   text `<Input>`. The "File upload is coming soon" helper paragraphs are gone.
2. **Upload button + native picker.** Each dialog has an "Upload Image" (or "Replace
   Image" when editing) button that opens the OS/browser file picker.
3. **Live preview.** Selecting a file shows a preview before Save; in edit mode, the
   existing donor image is previewed immediately on open.
4. **Progress feedback.** An upload progress indicator (shadcn `Progress`) is shown
   during upload and updates toward 100%.
5. **Blob round‑trip.** On success, the returned public Blob URL is stored in the
   dialog's `imageUrl` state, and the image is reachable at that URL in a browser.
6. **Convex mutation unchanged.** Saving calls the **existing** `createDonor` /
   `updateDonor` with the Blob URL; no Convex file was modified (verified by
   `detect_changes()` showing zero Convex symbols touched).
7. **Image not in Convex.** Only the URL is stored in `donors.imageUrl`; the binary
   never passes through Convex.
8. **Edit‑replace works.** Editing a donor and replacing the image stores the new URL;
   the table avatar updates in realtime via the existing Convex query.
9. **Donations page covered.** Creating a donor from inside the donation form offers
   the same upload flow as the donors page.
10. **Graceful failures.** Wrong type, oversized file, network failure, and Blob 5xx
    each produce a clear `sonner` toast and leave the dialog in a retryable state.
11. **Responsive & on‑brand.** The upload widget is mobile‑first (stacks vertically,
    full‑width‑friendly, comfortable touch target) and matches the design language in
    `context/DESIGN.md` (green/gold, 2px borders, `rounded-none`, uppercase Be Vietnam
    Pro labels, Anton only for headings).
12. **No scope creep.** Convex schema/queries/mutations, Clerk, auth, and existing
    business logic are untouched. The only new backend surface is `app/api/upload/route.ts`.
13. **Lint + build green.** `npm run lint` and `npm run build` pass.

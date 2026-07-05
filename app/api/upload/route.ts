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

  // 3. Upload to Vercel Blob. Token comes from BLOB_READ_WRITE_TOKEN env var.
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
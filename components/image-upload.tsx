"use client";

import { useRef, useState, useEffect } from "react";
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
  onUploadingChange?: (uploading: boolean) => void;
  className?: string;
};

export function ImageUpload({ value, onChange, onUploadingChange, className }: ImageUploadProps) {
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

  useEffect(() => {
    onUploadingChange?.(progress !== null);
  }, [progress, onUploadingChange]);

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
        <p className="text-xs text-[#3e4a41]">Image ready. Click &ldquo;Replace Image&rdquo; to change it.</p>
      )}
    </div>
  );
}
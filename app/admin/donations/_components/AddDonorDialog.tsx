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
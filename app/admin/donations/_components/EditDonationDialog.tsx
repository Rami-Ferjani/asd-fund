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
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { DonationWithDonor } from "./DonationRow";

export function EditDonationDialog({
  donation,
}: {
  donation: DonationWithDonor;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(donation.amount));
  const [note, setNote] = useState(donation.note ?? "");
  const [isSaving, setIsSaving] = useState(false);
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
    setIsSaving(true);
    try {
      await updateDonation({
        donationId: donation._id,
        amount: parsed,
        note: note.trim() ? note.trim() : undefined,
      });
      toast.success("Donation updated");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update donation");
    } finally {
      setIsSaving(false);
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
          <DialogDescription>
            Donor: {donation.donor?.name ?? "Unknown"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-amount">Amount (€)</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-note">Note</Label>
            <Textarea
              id="edit-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

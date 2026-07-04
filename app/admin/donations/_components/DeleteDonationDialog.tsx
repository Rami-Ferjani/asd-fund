"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import type { DonationWithDonor } from "./DonationRow";
import { useState } from "react";

export function DeleteDonationDialog({
  donation,
}: {
  donation: DonationWithDonor;
}) {
  const deleteDonation = useMutation(api.donations.deleteDonation);
  const [isDeleting, setIsDeleting] = useState(false);
  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteDonation({ donationId: donation._id });
      toast.success("Donation deleted");
    } catch {
      toast.error("Failed to delete donation");
    } finally {
      setIsDeleting(true);
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
            This will permanently delete the donation of{" "}
            {donation.donor?.name ?? "this donor"}. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-[family-name:var(--font-anton)] text-[#006b3f] text-xl">€</span>
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
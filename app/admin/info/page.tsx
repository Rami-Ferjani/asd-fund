"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  HandCoins,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { FUNDRAISING_GOAL_EUR } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEur(n: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDate(ms: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(ms));
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function Sidebar() {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/admin/info", icon: LayoutDashboard },
    { label: "Donor Management", href: "/admin/donors", icon: Users },
    { label: "Add Donations", href: "/admin/donations", icon: HandCoins },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col h-screen sticky top-0 bg-white border-r-2 border-[#008751]">
      <div className="p-8 border-b-2 border-[#e5e2e1]">
        <h1 className="font-[family-name:var(--font-anton)] text-[32px] leading-[40px] text-[#006b3f] uppercase tracking-tighter">
          ASD ADMIN
        </h1>
      </div>
      <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "flex items-center gap-3 px-4 py-3 bg-[#008751] text-[#fdfff9] text-sm font-bold uppercase tracking-[0.05em] rounded"
                  : "flex items-center gap-3 px-4 py-3 text-[#3e4a41] hover:text-[#006b3f] transition-colors text-sm font-bold uppercase tracking-[0.05em] rounded"
              }
            >
              <link.icon
                className="size-5"
                fill={active ? "currentColor" : "none"}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function StatCard({
  label,
  value,
  valueClass,
  loading,
}: {
  label: string;
  value: string;
  valueClass: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white p-8 border-2 border-[#008751] transition-[border-width] hover:border-[3px]">
      <div className="text-[#3e4a41] text-sm font-bold uppercase tracking-[0.05em] mb-2">
        {label}
      </div>
      {loading ? (
        <Skeleton className="h-[80px] w-full" />
      ) : (
        <div
          className={`font-[family-name:var(--font-anton)] text-[72px] leading-[80px] ${valueClass}`}
        >
          {value}
        </div>
      )}
    </div>
  );
}

type LatestDonation = NonNullable<
  ReturnType<typeof useQuery<typeof api.donations.getLatestDonations>>
>[number];

function ManageDonationDialog({ donation }: { donation: LatestDonation }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(donation.amount));
  const [note, setNote] = useState(donation.note ?? "");

  const updateDonation = useMutation(api.donations.updateDonation);
  const deleteDonation = useMutation(api.donations.deleteDonation);

  // Reset form whenever dialog opens
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
        donationId: donation._id,
        amount: parsed,
        note: note.trim() ? note.trim() : undefined,
      });
      toast.success("Donation updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update donation");
    }
  }

  async function handleDelete() {
    try {
      await deleteDonation({ donationId: donation._id });
      toast.success("Donation deleted");
      setOpen(false);
    } catch {
      toast.error("Failed to delete donation");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-[#006b3f] hover:text-[#fdfff9] border border-[#008751] px-3 py-1 hover:bg-[#008751] transition-all text-sm font-bold uppercase tracking-[0.05em]"
        >
          Manage
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Donation</DialogTitle>
          <DialogDescription>
            Donor: {donation.donor?.name ?? "Unknown"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount (&euro;)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this donation?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </DialogClose>

          <Button size="sm" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminInfoPage() {
  const total = useQuery(api.donations.getTotalRaised);
  const donors = useQuery(api.donors.getDonors);
  const latest = useQuery(api.donations.getLatestDonations);

  const remaining = Math.max(0, FUNDRAISING_GOAL_EUR - (total ?? 0));
  const donorsCount = donors?.length ?? 0;

  return (
    <div className="flex w-full">
      <Sidebar />

      <main className="flex-1 max-w-7xl mx-auto px-8 py-20 w-full">
        {/* Header */}
        <header className="mb-20 flex justify-between items-end">
          <div>
            <h2 className="font-[family-name:var(--font-anton)] text-[48px] leading-[56px] text-[#006b3f] uppercase">
              Fund Overview
            </h2>
            <p className="text-[18px] leading-[28px] text-[#3e4a41] mt-2 font-[family-name:var(--font-be-vietnam)]">
              Manage donations for the new club bus.
            </p>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <StatCard
            label="Total Donations"
            value={formatEur(total ?? 0)}
            valueClass="text-[#006b3f]"
            loading={total === undefined}
          />
          <StatCard
            label="Remaining Goal"
            value={formatEur(remaining)}
            valueClass="text-[#fed17b]"
            loading={total === undefined}
          />
          <StatCard
            label="Total Donors"
            value={String(donorsCount)}
            valueClass="text-[#1c1b1b]"
            loading={donors === undefined}
          />
        </section>

        {/* Recent Activity */}
        <section>
          <h3 className="font-[family-name:var(--font-anton)] text-[32px] leading-[40px] text-[#1c1b1b] mb-6 uppercase">
            Recent Activity
          </h3>

          <div className="bg-white border-2 border-[#008751] overflow-x-auto">
            <Table className="w-full text-left border-collapse">
              <TableHeader>
                <TableRow className="bg-[#eae7e7] border-b-2 border-[#008751] hover:bg-[#eae7e7]">
                  <TableHead className="p-4 text-sm font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">
                    Donor Name
                  </TableHead>
                  <TableHead className="p-4 text-sm font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">
                    Amount
                  </TableHead>
                  <TableHead className="p-4 text-sm font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">
                    Date
                  </TableHead>
                  <TableHead className="p-4 text-sm font-bold uppercase tracking-[0.05em] text-[#1c1b1b] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-base divide-y divide-[#e5e2e1]">
                {/* Loading */}
                {latest === undefined &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell className="p-4">
                        <Skeleton className="h-5 w-32" />
                      </TableCell>
                      <TableCell className="p-4">
                        <Skeleton className="h-5 w-16" />
                      </TableCell>
                      <TableCell className="p-4">
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell className="p-4 text-right">
                        <Skeleton className="h-8 w-20 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}

                {/* Empty */}
                {latest !== undefined && latest.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="p-8 text-center text-[#3e4a41]"
                    >
                      No donations yet.
                    </TableCell>
                  </TableRow>
                )}

                {/* Rows */}
                {latest?.map((d, i) => (
                  <TableRow
                    key={d._id}
                    className={`hover:bg-[#f0eded] ${
                      i % 2 === 1 ? "bg-[#f6f3f2]" : ""
                    }`}
                  >
                    <TableCell className="p-4 font-bold">
                      {d.donor?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell className="p-4 text-[#006b3f] font-bold">
                      {formatEur(d.amount)}
                    </TableCell>
                    <TableCell className="p-4 text-[#3e4a41]">
                      {formatDate(d.createdAt)}
                    </TableCell>
                    <TableCell className="p-4 text-right">
                      <ManageDonationDialog donation={d} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <Toaster />
      </main>
    </div>
  );
}
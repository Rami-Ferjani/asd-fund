"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { UserPlus, Search, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEur(n: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DonorWithTotal = NonNullable<
  ReturnType<typeof useQuery<typeof api.donors.getDonorsWithTotals>>
>[number];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AddDonorDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createDonor = useMutation(api.donors.createDonor);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setName("");
      setPhone("");
      setImageUrl("");
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !imageUrl.trim()) {
      toast.error("Name and image URL are required.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createDonor({
        name: name.trim(),
        imageUrl: imageUrl.trim(),
        phone: phone.trim() || undefined,
      });
      toast.success("Donor added");
      setOpen(false);
    } catch {
      toast.error("Failed to add donor");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#7a590c] text-[#fdfff9] hover:bg-[#78580b] border-2 border-transparent shadow-[4px_4px_0px_#006b3f] flex items-center gap-2 uppercase font-bold tracking-[0.05em] text-sm px-6 py-2 rounded-none w-full sm:w-auto justify-center">
          <UserPlus className="size-4" />
          Add New Donor
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Donor</DialogTitle>
          <DialogDescription>
            Fill in the donor details below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="add-name">Donor Name</Label>
            <Input
              id="add-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="add-phone">Phone Number</Label>
            <Input
              id="add-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+353 87 123 4567"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="add-image">Profile Picture URL</Label>
            <Input
              id="add-image"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
            <p className="text-xs text-[#3e4a41]">
              Paste an image URL. File upload is coming soon.
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button size="sm" onClick={handleSubmit}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditDonorDialog({ donor }: { donor: DonorWithTotal }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(donor.name);
  const [phone, setPhone] = useState(donor.phone ?? "");
  const [imageUrl, setImageUrl] = useState(donor.imageUrl);
  const [isSaving, setIsSaving] = useState(false);

  const updateDonor = useMutation(api.donors.updateDonor);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setName(donor.name);
      setPhone(donor.phone ?? "");
      setImageUrl(donor.imageUrl);
    }
  }

  async function handleSave() {
    if (!name.trim() || !imageUrl.trim()) {
      toast.error("Name and image URL are required.");
      return;
    }
    setIsSaving(true);
    try {
      await updateDonor({
        donorId: donor._id,
        name: name.trim(),
        imageUrl: imageUrl.trim(),
        phone: phone.trim() || undefined,
      });
      toast.success("Donor updated");
      setOpen(false);
    } catch {
      toast.error("Failed to update donor");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          className="p-2 size-9 sm:size-auto bg-white border border-[#008751] text-[#006b3f] hover:bg-[#008751] hover:text-[#fdfff9] rounded-none"
        >
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Donor</DialogTitle>
          <DialogDescription>Update the donor details.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-name">Donor Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-phone">Phone Number</Label>
            <Input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-image">Profile Picture URL</Label>
            <Input
              id="edit-image"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <p className="text-xs text-[#3e4a41]">
              Paste an image URL. File upload is coming soon.
            </p>
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

function DeleteDonorDialog({ donor }: { donor: DonorWithTotal }) {
  const deleteDonor = useMutation(api.donors.deleteDonor);
  const [isDeleting, setIsDeleting] = useState(false);
  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteDonor({ donorId: donor._id });
      toast.success("Donor deleted");
    } catch {
      toast.error("Failed to delete donor");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          className="p-2 size-9 sm:size-auto bg-white border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white rounded-none"
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete donor?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {donor.name} and all of their
            donations. This action cannot be undone.
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

function DonorRow({ donor, index }: { donor: DonorWithTotal; index: number }) {
  return (
    <TableRow
      className={`hover:bg-[#f0eded] ${index % 2 === 1 ? "bg-[#f6f3f2]" : ""}`}
    >
      <TableCell className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 rounded-full">
            <AvatarImage src={donor.imageUrl} alt={donor.name} />
            <AvatarFallback className="bg-[#eae7e7] text-[#006b3f] font-bold">
              {initials(donor.name)}
            </AvatarFallback>
          </Avatar>
          <span className="font-bold text-[#1c1b1b]">{donor.name}</span>
        </div>
      </TableCell>
      <TableCell className="p-4 text-[#3e4a41]">{donor.phone ?? "—"}</TableCell>
      <TableCell className="p-4 font-[family-name:var(--font-anton)] text-[#006b3f] text-[20px]">
        {formatEur(donor.totalDonated)}
      </TableCell>
      <TableCell className="p-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <EditDonorDialog donor={donor} />
          <DeleteDonorDialog donor={donor} />
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DonorsPage() {
  const donors = useQuery(api.donors.getDonorsWithTotals);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  // Derived data
  const filtered = useMemo(() => {
    if (!donors) return undefined;
    if (!search.trim()) return donors;
    const q = search.toLowerCase();
    return donors.filter((d) => d.name.toLowerCase().includes(q));
  }, [donors, search]);

  const paged = useMemo(() => {
    if (!filtered) return undefined;
    return filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }, [filtered, page]);

  const total = filtered?.length ?? 0;
  const showingFrom = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const showingTo = Math.min((page + 1) * PAGE_SIZE, total);
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Reset page when search changes
  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 flex flex-col gap-4 sm:gap-6">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-[family-name:var(--font-anton)] text-[24px] leading-[32px] sm:text-[28px] sm:leading-[34px] md:text-[32px] md:leading-[40px] text-[#006b3f] uppercase tracking-wide">
          Donor Management
        </h1>
        <AddDonorDialog />
      </div>

      {/* Card container */}
      <div className="bg-white border-2 border-[#e5e2e1] p-4 sm:p-6 shadow-[8px_8px_0px_#f0eded]">
        {/* Toolbar */}
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

        {/* Mobile donor card list */}
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
                  <span className="font-bold text-[#1c1b1b] truncate">
                    {donor.name}
                  </span>
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

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <Table className="w-full text-left border-collapse">
            <TableHeader>
              <TableRow className="bg-[#eae7e7] border-b-2 border-[#008751] hover:bg-[#eae7e7]">
                <TableHead className="p-4 text-sm font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">
                  Donor Name
                </TableHead>
                <TableHead className="p-4 text-sm font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">
                  Phone Number
                </TableHead>
                <TableHead className="p-4 text-sm font-bold uppercase tracking-[0.05em] text-[#1c1b1b]">
                  Total Donation
                </TableHead>
                <TableHead className="p-4 text-sm font-bold uppercase tracking-[0.05em] text-[#1c1b1b] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-base">
              {/* Loading */}
              {donors === undefined &&
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {/* Empty */}
              {donors !== undefined && donors.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="p-8 text-center text-[#3e4a41]"
                  >
                    No donors yet.
                  </TableCell>
                </TableRow>
              )}

              {/* Search with no matches */}
              {filtered !== undefined &&
                filtered.length === 0 &&
                donors !== undefined &&
                donors.length > 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="p-8 text-center text-[#3e4a41]"
                    >
                      No donors match &ldquo;{search}&rdquo;.
                    </TableCell>
                  </TableRow>
                )}

              {/* Rows */}
              {paged?.map((donor, i) => (
                <DonorRow key={donor._id} donor={donor} index={i} />
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
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
      </div>

      <Toaster />
    </main>
  );
}

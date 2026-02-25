"use client";

import { motion, AnimatePresence } from "framer-motion";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  MoreHorizontal,
  Search,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { syncMembers, exportMembersToCSV, getAusaExportHistory } from "./actions";
import { toAustralianDateTime } from "@/app/utils/dateFormatter";
import { useMembersStore } from "@/app/store/membersStore";
import { toast } from "sonner";

export type Member = {
  id: number;
  fullname: string;
  email: string;
  phonenumber: string | null;
  membershipId: string | null;
  membershipType: string | null;
  pricePaid: string | null;
  paymentMethod: string | null;
  isValid: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type ExportRecord = {
  id: number;
  exportedAt: Date | null;
  memberCount: number;
  exportedByUserName: string | null;
};

function MemberCard({ member, onViewDetails }: { member: Member; onViewDetails: () => void }) {
  const statusLabel = member.isValid === null ? "Unknown" : member.isValid ? "Valid" : "Invalid";
  const statusClass =
    member.isValid === null
      ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
      : member.isValid
        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
        : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300";

  return (
    <motion.button
      type="button"
      onClick={onViewDetails}
      className="flex w-full items-center gap-3 rounded-lg border border-slate-200/80 bg-white p-3.5 text-left transition-colors active:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:active:bg-slate-900"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{member.fullname}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{member.email}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {member.membershipType && (
            <Badge variant="outline" className="text-[10px] font-medium capitalize">
              {member.membershipType}
            </Badge>
          )}
          <span
            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${statusClass}`}
          >
            {statusLabel}
          </span>
          {member.pricePaid && (
            <span className="text-[11px] text-muted-foreground">
              {new Intl.NumberFormat("en-GB", { style: "currency", currency: "AUD" }).format(
                parseFloat(member.pricePaid),
              )}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </motion.button>
  );
}

function MemberDetailsDialog({
  member,
  open,
  onOpenChange,
}: {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!member) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Member Details</AlertDialogTitle>
          <AlertDialogDescription>Full information for {member.fullname}</AlertDialogDescription>
        </AlertDialogHeader>
        <motion.div
          className="grid gap-4 py-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p className="text-sm font-semibold">{member.fullname}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm font-semibold break-all">{member.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
              <p className="text-sm font-semibold">{member.phonenumber || "N/A"}</p>
            </div>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Membership ID</p>
              <p className="text-sm font-semibold font-mono">{member.membershipId || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Membership Type</p>
              <p className="text-sm font-semibold capitalize">{member.membershipType || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p
                className={`text-sm font-semibold capitalize ${member.isValid ? "text-green-600" : "text-red-600"}`}
              >
                {member.isValid === null ? "Unknown" : member.isValid ? "Valid" : "Invalid"}
              </p>
            </div>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Price Paid</p>
              <p className="text-sm font-semibold">
                {member.pricePaid
                  ? new Intl.NumberFormat("en-GB", {
                      style: "currency",
                      currency: "AUD",
                    }).format(parseFloat(member.pricePaid))
                  : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
              <p className="text-sm font-semibold capitalize">{member.paymentMethod || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Member ID</p>
              <p className="text-sm font-semibold">#{member.id}</p>
            </div>
          </motion.div>
          <motion.div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="text-sm font-semibold">
                {member.createdAt ? toAustralianDateTime(member.createdAt) : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Updated At</p>
              <p className="text-sm font-semibold">
                {member.updatedAt ? toAustralianDateTime(member.updatedAt) : "N/A"}
              </p>
            </div>
          </motion.div>
        </motion.div>
        <AlertDialogFooter>
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function MemberRowActions({ member }: { member: Member }) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              member.membershipId && navigator.clipboard.writeText(member.membershipId)
            }
          >
            Copy membership ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDetails(true)}>View details</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <MemberDetailsDialog member={member} open={showDetails} onOpenChange={setShowDetails} />
    </>
  );
}

export const columns: ColumnDef<Member>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "fullname",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("fullname")}</div>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="lowercase max-w-50 truncate" title={row.getValue("email")}>
        {row.getValue("email")}
      </div>
    ),
  },
  {
    accessorKey: "phonenumber",
    header: "Phone Number",
    cell: ({ row }) => <div>{row.getValue("phonenumber") || "N/A"}</div>,
  },
  {
    accessorKey: "membershipType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Membership Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const type = row.getValue("membershipType") as string | null;
      return <div className="capitalize font-medium">{type || "N/A"}</div>;
    },
  },
  {
    accessorKey: "pricePaid",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price Paid
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const pricePaid = row.getValue("pricePaid") as string | null;
      if (!pricePaid) return <div className="text-muted-foreground">N/A</div>;
      const amount = parseFloat(pricePaid);
      const formatted = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "AUD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },

  {
    accessorKey: "isValid",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isValid = row.getValue("isValid") as boolean | null;
      if (isValid === null) return <div className="text-muted-foreground">Unknown</div>;
      return (
        <div className={`capitalize font-medium ${isValid ? "text-green-600" : "text-red-600"}`}>
          {isValid ? "Valid" : "Invalid"}
        </div>
      );
    },
  },

  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <MemberRowActions member={row.original} />,
  },
];

interface DataTableProps {
  data: Member[];
}

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [filterField, setFilterField] = React.useState<
    "fullname" | "email" | "phonenumber" | "all"
  >("all");
  const [filterValue, setFilterValue] = React.useState("");
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [showExportConfirm, setShowExportConfirm] = React.useState(false);
  const [exportHistory, setExportHistory] = React.useState<ExportRecord[]>([]);
  const [mobileDetailsMember, setMobileDetailsMember] = React.useState<Member | null>(null);

  const fetchMembers = useMembersStore((state) => state.fetchMembers);

  React.useEffect(() => {
    getAusaExportHistory()
      .then(setExportHistory)
      .catch(() => {
        // Silently degrade — history is informational and should not block the page
      });
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue).toLowerCase();
      const fullname = String(row.getValue("fullname") || "").toLowerCase();
      const email = String(row.getValue("email") || "").toLowerCase();
      const phonenumber = String(row.getValue("phonenumber") || "").toLowerCase();

      return (
        fullname.includes(searchValue) ||
        email.includes(searchValue) ||
        phonenumber.includes(searchValue)
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  const handleFilterChange = (value: string) => {
    setFilterValue(value);

    if (filterField === "all") {
      // Use global filter for searching across all fields
      setGlobalFilter(value);
      // Clear column filters
      table.getColumn("fullname")?.setFilterValue("");
      table.getColumn("email")?.setFilterValue("");
      table.getColumn("phonenumber")?.setFilterValue("");
    } else {
      // Clear global filter
      setGlobalFilter("");
      // Clear all column filters first
      table.getColumn("fullname")?.setFilterValue("");
      table.getColumn("email")?.setFilterValue("");
      table.getColumn("phonenumber")?.setFilterValue("");
      // Apply filter to specific field
      table.getColumn(filterField)?.setFilterValue(value);
    }
  };

  const getFieldLabel = () => {
    switch (filterField) {
      case "fullname":
        return "Name";
      case "email":
        return "Email";
      case "phonenumber":
        return "Phone";
      case "all":
        return "All";
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await syncMembers();
      if (result.success) {
        await fetchMembers();
        toast.success("Members synced successfully");
      } else {
        toast.error(result.error || "Failed to sync members");
      }
    } catch (error) {
      toast.error("Failed to sync members");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportMembersToCSV();
      if (!result.success) {
        toast.error(result.error || "Failed to export members");
        return;
      }

      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `ausa-members-${date}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${result.memberCount} members`);
      setShowExportConfirm(false);

      // Refresh history so the new export appears next time the dialog is opened
      getAusaExportHistory()
        .then(setExportHistory)
        .catch(() => {});
    } catch (error) {
      toast.error("Failed to export members");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full">
      <motion.div
        className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${getFieldLabel().toLowerCase()}...`}
            value={filterValue}
            onChange={(event) => handleFilterChange(event.target.value)}
            className="h-10 pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 shrink-0">
                {getFieldLabel()} <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterField("all")}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterField("fullname")}>Name</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterField("email")}>Email</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterField("phonenumber")}>
                Phone
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            variant="outline"
            size="sm"
            className="h-9 shrink-0"
          >
            {isSyncing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync
              </>
            )}
          </Button>
          <Button
            onClick={() => setShowExportConfirm(true)}
            disabled={isExporting}
            variant="outline"
            size="sm"
            className="h-9 shrink-0"
          >
            <Download className="mr-2 h-4 w-4" />
            Export for AUSA
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto hidden h-9 md:inline-flex">
                Columns <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
      {/* Mobile: card list */}
      <div className="space-y-2 md:hidden">
        <AnimatePresence mode="popLayout">
          {table.getRowModel().rows?.length ? (
            table
              .getRowModel()
              .rows.map((row) => (
                <MemberCard
                  key={row.id}
                  member={row.original}
                  onViewDetails={() => setMobileDetailsMember(row.original)}
                />
              ))
          ) : (
            <motion.p
              className="py-12 text-center text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No results.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        duration: 0.2,
                        delay: index * 0.02,
                        ease: "easeOut",
                      }}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        No results.
                      </motion.div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <motion.div
        className="flex items-center justify-between gap-2 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <p className="text-xs text-muted-foreground">
          {table.getFilteredRowModel().rows.length} member
          {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </motion.div>

      {/* AUSA export confirmation dialog */}
      <AlertDialog
        open={showExportConfirm}
        onOpenChange={(open) => {
          if (!isExporting) setShowExportConfirm(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Export for AUSA?</AlertDialogTitle>
            <AlertDialogDescription>
              This will download a CSV of all {data.length} member
              {data.length !== 1 ? "s" : ""} formatted for AUSA. This export will be logged.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {data.length === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              There are no members to export.
            </p>
          )}

          {exportHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Recent exports
              </p>
              <div className="divide-y divide-border rounded-md border">
                {exportHistory.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">
                      {record.exportedAt ? toAustralianDateTime(record.exportedAt) : "Unknown date"}
                    </span>
                    <span className="font-medium">{record.memberCount} members</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {record.exportedByUserName ?? "Unknown"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isExporting}>Cancel</AlertDialogCancel>
            <Button onClick={handleExport} disabled={isExporting || data.length === 0}>
              {isExporting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mobile details dialog */}
      <MemberDetailsDialog
        member={mobileDetailsMember}
        open={!!mobileDetailsMember}
        onOpenChange={(open) => {
          if (!open) setMobileDetailsMember(null);
        }}
      />
    </div>
  );
}

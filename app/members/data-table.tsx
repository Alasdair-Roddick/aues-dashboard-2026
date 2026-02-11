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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { syncMembers } from "./actions";
import { toAustralianDateTime } from "@/app/utils/dateFormatter";
import { useMembersStore } from "@/app/store/membersStore";
import { Loader2 } from "lucide-react";

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

      <AlertDialog open={showDetails} onOpenChange={setShowDetails}>
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
              className="grid grid-cols-3 gap-4"
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
              className="grid grid-cols-3 gap-4"
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
              className="grid grid-cols-3 gap-4"
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
              className="grid grid-cols-2 gap-4"
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

  const fetchMembers = useMembersStore((state) => state.fetchMembers);
  const membersLoading = useMembersStore((state) => state.membersLoading);

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
        // Refresh members from the store
        await fetchMembers();
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full relative">
      {(isSyncing || membersLoading) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              {isSyncing ? "Syncing members..." : "Loading..."}
            </p>
          </div>
        </motion.div>
      )}
      <motion.div
        className="flex items-center py-4 gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                {getFieldLabel()} <ChevronDown className="ml-2 h-4 w-4" />
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
          <Input
            placeholder={`Search ${getFieldLabel().toLowerCase()}...`}
            value={filterValue}
            onChange={(event) => handleFilterChange(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <Button onClick={handleSync} disabled={isSyncing || membersLoading} className="relative">
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              "Sync"
            )}
          </Button>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
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
      </motion.div>
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
      <motion.div
        className="flex items-center justify-end space-x-2 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <motion.div
          className="flex-1 text-sm text-muted-foreground"
          key={`${table.getFilteredSelectedRowModel().rows.length}-${table.getFilteredRowModel().rows.length}`}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </motion.div>
        <div className="space-x-2">
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
    </div>
  );
}

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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Key, Check, X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { updateUserAction, deleteUserAction } from "./actions";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserStore } from "@/app/store/userStore";

export type User = {
  id: string;
  name: string;
  image: string | null;
  role: "Admin" | "General" | "Temporary" | "Treasurer";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function UserRowActions({ user }: { user: User }) {
  const updateUser = useUserStore((state) => state.updateUser);
  const deleteUser = useUserStore((state) => state.deleteUser);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Form state
  const [username, setUsername] = React.useState(user.name);
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState(user.role);
  const [isActive, setIsActive] = React.useState(user.isActive);

  const handleUpdate = async () => {
    // Validate password if provided
    if (password && password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateUserAction(user.id, {
        name: username,
        password: password || undefined,
        role,
        isActive,
      });

      if (result.success) {
        toast.success("User updated", {
          description: `${username} has been updated successfully`,
        });

        // Update user in Zustand store immediately
        updateUser(user.id, {
          name: username,
          role,
          isActive,
        });

        setShowEditModal(false);
      } else {
        toast.error("Failed to update user", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Failed to update user", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUserAction(user.id);

      if (result.success) {
        toast.success("User deleted", {
          description: `${user.name} has been removed`,
        });

        // Remove user from Zustand store immediately
        deleteUser(user.id);

        setShowDeleteDialog(false);
      } else {
        toast.error("Failed to delete user", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Failed to delete user", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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
          <DropdownMenuItem onClick={() => setShowEditModal(true)}>Edit user</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
            Copy user ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Modal */}
      <AlertDialog open={showEditModal} onOpenChange={setShowEditModal}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit User</AlertDialogTitle>
            <AlertDialogDescription>Update user information for {user.name}</AlertDialogDescription>
          </AlertDialogHeader>

          <motion.div
            className="space-y-4 py-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password</Label>
              <Input
                id="edit-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
              <p className="text-xs text-muted-foreground">
                Must be at least 8 characters. Leave blank to keep current password.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as typeof role)}>
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Temporary">Temporary</SelectItem>
                  <SelectItem value="Treasurer">Treasurer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="edit-active">Active Status</Label>
                <p className="text-xs text-muted-foreground">Inactive users cannot log in</p>
              </div>
              <Switch id="edit-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="rounded-lg bg-muted p-3 space-y-1">
              <p className="text-xs font-medium">User ID</p>
              <p className="text-xs font-mono text-muted-foreground">{user.id}</p>
            </div>
          </motion.div>

          <AlertDialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating || !username.trim()}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the user{" "}
              <span className="font-semibold">{user.name}</span>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export const columns: ColumnDef<User>[] = [
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
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const image = row.original.image;
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={image ?? undefined} alt={name} className="object-cover" />
            <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <span className="font-medium">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleColors = {
        Admin: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
        General: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
        Treasurer: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
        Temporary: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
      };
      return (
        <div
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${roleColors[role as keyof typeof roleColors]}`}
        >
          {role}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
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
      const isActive = row.getValue("isActive") as boolean;
      return (
        <div
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-600" : "bg-red-600"}`}
          />
          {isActive ? "Active" : "Inactive"}
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <UserRowActions user={row.original} />,
  },
];

interface DataTableProps {
  data: User[];
}

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [filterField, setFilterField] = React.useState<"name" | "email" | "role" | "all">("all");
  const [filterValue, setFilterValue] = React.useState("");
  const [globalFilter, setGlobalFilter] = React.useState("");

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
      const name = String(row.getValue("name") || "").toLowerCase();
      const email = String(row.getValue("email") || "").toLowerCase();
      const role = String(row.getValue("role") || "").toLowerCase();

      return (
        name.includes(searchValue) || email.includes(searchValue) || role.includes(searchValue)
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
      setGlobalFilter(value);
      table.getColumn("name")?.setFilterValue("");
      table.getColumn("email")?.setFilterValue("");
      table.getColumn("role")?.setFilterValue("");
    } else {
      setGlobalFilter("");
      table.getColumn("name")?.setFilterValue("");
      table.getColumn("email")?.setFilterValue("");
      table.getColumn("role")?.setFilterValue("");
      table.getColumn(filterField)?.setFilterValue(value);
    }
  };

  const getFieldLabel = () => {
    switch (filterField) {
      case "name":
        return "Username";
      case "email":
        return "Email";
      case "role":
        return "Role";
      case "all":
        return "All";
    }
  };

  return (
    <div className="w-full">
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
              <DropdownMenuItem onClick={() => setFilterField("name")}>Username</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterField("email")}>Email</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterField("role")}>Role</DropdownMenuItem>
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

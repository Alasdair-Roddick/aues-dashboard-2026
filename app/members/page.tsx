"use client";

import { useEffect, useRef } from "react";
import { DataTable } from "./data-table";
import { useMembersStore } from "@/app/store/membersStore";
import { Skeleton } from "@/components/ui/skeleton";

export default function MembersPage() {
  const members = useMembersStore((state) => state.members);
  const membersLoading = useMembersStore((state) => state.membersLoading);
  const fetchMembers = useMembersStore((state) => state.fetchMembers);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      if (members.length === 0 && !membersLoading) {
        fetchMembers();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-4 md:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Members</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            View and manage all club members and their memberships.
          </p>
        </div>
      </div>
      {membersLoading && members.length === 0 ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <DataTable data={members} />
      )}
    </div>
  );
}

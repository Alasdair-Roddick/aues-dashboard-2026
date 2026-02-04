"use client";

import { useEffect } from "react";
import { AddUserForm } from "./addUser";
import { DataTable } from "../data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/app/store/userStore";
import { SettingsModal } from "./SettingsModal";

interface AdminContentProps {
  userRole: string;
}

export function AdminContent({ userRole }: AdminContentProps) {
  const { users, usersLoading, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const adminCount = users.filter(u => u.role === 'Admin').length;
  const generalCount = users.filter(u => u.role === 'General').length;
  const temporaryCount = users.filter(u => u.role === 'Temporary').length;

  return (
    <>
      {/* Settings Button - Only visible for Admins */}
      {userRole === "Admin" && (
        <div className="flex justify-end mb-4">
          <SettingsModal />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Users Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              {usersLoading ? (
                <Skeleton className="h-9 w-12 mt-2" />
              ) : (
                <p className="text-3xl font-bold mt-2">{users.length}</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Admin Count Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admins</p>
              {usersLoading ? (
                <Skeleton className="h-9 w-12 mt-2" />
              ) : (
                <p className="text-3xl font-bold mt-2 text-purple-600">{adminCount}</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>

        {/* General Count Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">General</p>
              {usersLoading ? (
                <Skeleton className="h-9 w-12 mt-2" />
              ) : (
                <p className="text-3xl font-bold mt-2 text-blue-600">{generalCount}</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Temporary Count Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Temporary</p>
              {usersLoading ? (
                <Skeleton className="h-9 w-12 mt-2" />
              ) : (
                <p className="text-3xl font-bold mt-2 text-amber-600">{temporaryCount}</p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Add User Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AddUserForm />
          </div>
        </div>

        {/* Right Column - Users Table */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">All Users</h2>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all user accounts
              </p>
            </div>
            {usersLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <DataTable data={users} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

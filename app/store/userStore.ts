import { create } from "zustand";
import { getAllUsersAction } from "@/app/admin/actions";
import { getCurrentUser, type CurrentUser } from "@/lib/getUser";

export type User = {
  id: string;
  name: string;
  image: string | null;
  role: "Admin" | "General" | "Temporary" | "Treasurer";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * * Type definition for the user store, managing both all users and the current user.
 *
 */

type UserStore = {
  // All users (for admin panel)
  users: User[];
  usersLoading: boolean;

  // Current user (for navbar and profile)
  currentUser: CurrentUser;
  currentUserLoading: boolean;

  // Actions
  fetchUsers: () => Promise<void>;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  deleteUser: (userId: string) => void;

  fetchCurrentUser: () => Promise<void>;
  updateCurrentUser: (updates: Partial<NonNullable<CurrentUser>>) => void;
};

/**
 * * Zustand store for managing user data, including fetching, adding, updating, and deleting users.
 * @returns A Zustand store with user management functionalities.
 *
 */

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  usersLoading: true,
  currentUser: null,
  currentUserLoading: true,

  fetchUsers: async () => {
    set({ usersLoading: true });
    const users = await getAllUsersAction();
    set({ users, usersLoading: false });
  },

  addUser: (user: User) => {
    set((state) => ({
      users: [...state.users, user],
    }));
  },

  updateUser: (userId: string, updates: Partial<User>) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, ...updates, updatedAt: new Date() } : user,
      ),
    }));
  },

  deleteUser: (userId: string) => {
    set((state) => ({
      users: state.users.filter((user) => user.id !== userId),
    }));
  },

  fetchCurrentUser: async () => {
    set({ currentUserLoading: true });
    const user = await getCurrentUser();
    set({ currentUser: user, currentUserLoading: false });
  },

  updateCurrentUser: (updates: Partial<NonNullable<CurrentUser>>) => {
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
    }));
  },
}));

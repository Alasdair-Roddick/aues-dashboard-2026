"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getCurrentUser, type CurrentUser } from "@/lib/getUser";

interface UserContextType {
  user: CurrentUser;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/**
 *
 * @param children ReactNode - The child components that will have access to the UserContext
 * @returns JSX.Element - The UserProvider component that wraps its children with UserContext.Provider
 */

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const data = await getCurrentUser();
    setUser(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadUser = async () => {
      const data = await getCurrentUser();
      if (!isActive) return;
      setUser(data);
      setLoading(false);
    };

    void loadUser();
    return () => {
      isActive = false;
    };
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

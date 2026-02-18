import { create } from "zustand";
import { getDashboardFeed, type DashboardFeedItem } from "@/app/actions/activity";

type ActivityStore = {
  activities: DashboardFeedItem[];
  loading: boolean;
  pollingInterval: NodeJS.Timeout | null;

  fetchActivity: (options?: { silent?: boolean }) => Promise<void>;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
};

export const useActivityStore = create<ActivityStore>((set, get) => ({
  activities: [],
  loading: true,
  pollingInterval: null,

  fetchActivity: async (options) => {
    const silent = options?.silent ?? false;

    if (!silent) {
      set({ loading: true });
    }

    try {
      const activities = await getDashboardFeed(5);
      set({ activities, loading: false });
    } catch (error) {
      console.error("Failed to fetch activity:", error);
      set({ loading: false });
    }
  },

  startPolling: (intervalMs = 30000) => {
    const currentInterval = get().pollingInterval;
    if (currentInterval) {
      clearInterval(currentInterval);
    }

    const interval = setInterval(async () => {
      await get().fetchActivity({ silent: true });
    }, intervalMs);

    set({ pollingInterval: interval });
  },

  stopPolling: () => {
    const interval = get().pollingInterval;
    if (interval) {
      clearInterval(interval);
      set({ pollingInterval: null });
    }
  },
}));

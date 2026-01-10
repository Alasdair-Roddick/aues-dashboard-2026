import { create } from "zustand";
import { getAllMembersAction } from "@/app/admin/actions";
import { parseDate } from "@/app/utils/dateFormatter";

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

export type MonthlyData = {
    month: string;
    count: number;
};

/**
 * * Type definition for the members store, managing all members.
 * 
 */

type MembersStore = {
    members: Member[];
    membersLoading: boolean;

    // Actions
    fetchMembers: () => Promise<void>;
    monthlyNewMembers: () => number;
    growthRate: () => number;
    getMembersByMonth: (months?: number) => MonthlyData[];
};

/**
 * * Zustand store for managing member data, including fetching members.
 * @returns A Zustand store with member management functionalities.
 * 
 */

export const useMembersStore = create<MembersStore>((set, get) => ({
    members: [],
    membersLoading: false,

    fetchMembers: async () => {
        set({ membersLoading: true });
        const members = await getAllMembersAction();
        set({ members, membersLoading: false });
    },

    monthlyNewMembers: () => {
        const members = get().members;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return members.filter((member: Member) => {
            const createdAt = parseDate(member.createdAt);
            if (!createdAt) return false;
            return createdAt >= startOfMonth;
        }).length;
    },

    growthRate: () => {
        const members = get().members;
        const now = new Date();

        // Start of current month
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Start of last month
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const thisMonthCount = members.filter((member: Member) => {
            const createdAt = parseDate(member.createdAt);
            if (!createdAt) return false;
            return createdAt >= startOfThisMonth;
        }).length;

        const lastMonthCount = members.filter((member: Member) => {
            const createdAt = parseDate(member.createdAt);
            if (!createdAt) return false;
            return createdAt >= startOfLastMonth && createdAt < startOfThisMonth;
        }).length;

        // If both months have no members, return 0%
        if (lastMonthCount === 0 && thisMonthCount === 0) {
            return 0;
        }

        // If last month was 0 but this month has members, show positive growth
        if (lastMonthCount === 0 && thisMonthCount > 0) {
            return 100;
        }

        // Calculate normal growth rate
        const growthRate = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);

        // Return the growth rate (can be positive or negative)
        return growthRate;
    },

    getMembersByMonth: (months = 6) => {
        const members = get().members;
        const now = new Date();
        const result: MonthlyData[] = [];

        console.log("getMembersByMonth - Total members:", members.length);
        if (members.length > 0) {
            console.log("First member createdAt:", members[0].createdAt, "Type:", typeof members[0].createdAt);
        }

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleDateString("en-AU", { month: "short", year: "2-digit" });

            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

            const count = members.filter((member: Member) => {
                const createdAt = parseDate(member.createdAt);
                if (!createdAt) return false;
                return createdAt >= startOfMonth && createdAt < endOfMonth;
            }).length;

            console.log(`Month: ${monthName}, Count: ${count}`);
            result.push({ month: monthName, count });
        }

        console.log("Final monthly data:", result);
        return result;
    },
}));
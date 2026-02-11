"use client";

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Shield, LogOut, DollarSign, Palette, Receipt } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ProfileSection } from "./components/profile"
import { SecuritySection } from "./components/security"
import { FinancialSection } from "./components/financial"
import { AppearanceSection } from "./components/appearance"
import { ReceiptsSection } from "./components/receipts"

type Tab = "profile" | "security" | "financial" | "receipts" | "appearance"

export default function ProfilePage() {

    const { data: session } = useSession();
    const user = session?.user;
    const [activeTab, setActiveTab] = useState<Tab>("profile")
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    const logoutCallbackUrl = `${baseUrl}/login`;

    const tabContent = {
        profile: (
            <ProfileSection />
        ),
        security: (
            <SecuritySection />
        ),
        financial: (
            <FinancialSection />
        ),
        receipts: (
            <ReceiptsSection />
        ),
        appearance: (
            <AppearanceSection />
        ),
    }

    return (
        <div className="flex flex-col min-h-full p-4 md:p-8 lg:m-20">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-0">Welcome Back, {user?.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4 md:gap-6 mt-4 md:mt-6">
                {/* Navigation Sidebar - Horizontal scroll on mobile, sidebar on desktop */}
                <Card className="h-fit">
                    <CardHeader className="pb-3 hidden md:block">
                        <CardTitle className="text-lg">Navigation</CardTitle>
                    </CardHeader>
                    <CardContent className="p-2 md:p-3">
                        <div className="flex md:flex-col overflow-x-auto md:overflow-x-visible space-x-1 md:space-x-0 md:space-y-1 pb-2 md:pb-0">
                        <Button
                            variant={activeTab === "profile" ? "secondary" : "ghost"}
                            className="flex-shrink-0 md:w-full justify-start whitespace-nowrap"
                            onClick={() => setActiveTab("profile")}
                        >
                            <User className="h-4 w-4 mr-2" />
                            <span className="hidden md:inline">My Profile</span>
                            <span className="md:hidden">Profile</span>
                        </Button>
                        <Button
                            variant={activeTab === "security" ? "secondary" : "ghost"}
                            className="flex-shrink-0 md:w-full justify-start whitespace-nowrap"
                            onClick={() => setActiveTab("security")}
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Security
                        </Button>
                        <Button
                            variant={activeTab === "financial" ? "secondary" : "ghost"}
                            className="flex-shrink-0 md:w-full justify-start whitespace-nowrap"
                            onClick={() => setActiveTab("financial")}
                        >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Financial
                        </Button>
                        <Button
                            variant={activeTab === "receipts" ? "secondary" : "ghost"}
                            className="flex-shrink-0 md:w-full justify-start whitespace-nowrap"
                            onClick={() => setActiveTab("receipts")}
                        >
                            <Receipt className="h-4 w-4 mr-2" />
                            Receipts
                        </Button>
                        <Button
                            variant={activeTab === "appearance" ? "secondary" : "ghost"}
                            className="flex-shrink-0 md:w-full justify-start whitespace-nowrap"
                            onClick={() => setActiveTab("appearance")}
                        >
                            <Palette className="h-4 w-4 mr-2" />
                            Appearance
                        </Button>
                        <Button
                            variant="ghost"
                            className="flex-shrink-0 md:w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
                            onClick={() => signOut({ callbackUrl: logoutCallbackUrl })}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {tabContent[activeTab]}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

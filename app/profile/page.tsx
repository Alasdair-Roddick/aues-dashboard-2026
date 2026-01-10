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
import { User, Shield, LogOut, DollarSign, Palette } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ProfileSection } from "./components/profile"
import { SecuritySection } from "./components/security"
import { FinancialSection } from "./components/financial"
import { AppearanceSection } from "./components/appearance"

type Tab = "profile" | "security" | "financial" | "appearance"

export default function ProfilePage() {

    const { data: session } = useSession();
    const user = session?.user;
    const [activeTab, setActiveTab] = useState<Tab>("profile")

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
        appearance: (
            <AppearanceSection />
        ),
    }

    return (
        <div className="flex flex-col min-h-full m-20">
            <h1 className="text-3xl font-bold">Welcome Back, {user?.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 mt-6">
                {/* Navigation Sidebar */}
                <Card className="h-fit">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Navigation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 p-3">
                        <Button 
                            variant={activeTab === "profile" ? "secondary" : "ghost"} 
                            className="w-full justify-start"
                            onClick={() => setActiveTab("profile")}
                        >
                            <User className="h-4 w-4 mr-2" />
                            My Profile
                        </Button>
                        <Button 
                            variant={activeTab === "security" ? "secondary" : "ghost"} 
                            className="w-full justify-start"
                            onClick={() => setActiveTab("security")}
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Security
                        </Button>
                        <Button
                            variant={activeTab === "financial" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveTab("financial")}
                        >
                            <DollarSign className="h-4 w-4 mr-2" />
                            Financial
                        </Button>
                        <Button
                            variant={activeTab === "appearance" ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveTab("appearance")}
                        >
                            <Palette className="h-4 w-4 mr-2" />
                            Appearance
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </Button>
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
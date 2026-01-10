"use client"

import Link from "next/link"
import { User, LogOut, Receipt, ChevronDown, Shield, Wallet, Menu, X } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserStore } from "@/app/store/userStore"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userRole = session?.user ? (session.user as any).role : null;
  const isAdmin = userRole === "Admin";
  const isTreasurer = userRole === "Treasurer";
  const hasAdminAccess = isAdmin || isTreasurer;
  const currentUser = useUserStore((state) => state.currentUser);
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);

  // Fetch current user on mount and when session status changes to authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      fetchCurrentUser();
    }
  }, [status, fetchCurrentUser, session?.user]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shirts", label: "Shirts" },
    { href: "/members", label: "Members" },
    { href: "/receipts", label: "Receipts" },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand - Hidden on mobile, shown on desktop */}
          <div className="hidden md:block font-bold text-lg">AUES</div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
              >
                {link.label}
              </Link>
            ))}

            {hasAdminAccess && (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-10 items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none">
                  Management
                  <ChevronDown className="ml-1 h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => router.push('/admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/treasurer/receipts')}>
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Treasurer</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="h-10 w-10 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center">
              <Avatar className="h-8 w-8">
                <AvatarImage className="object-cover" src={currentUser?.image ?? undefined} alt={currentUser?.name ?? "User Avatar"} />
                <AvatarFallback>
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className="block px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {hasAdminAccess && (
              <>
                <div className="px-4 py-2 text-sm font-medium text-muted-foreground">Management</div>
                <Link
                  href="/admin"
                  onClick={closeMobileMenu}
                  className="block px-8 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Shield className="inline-block mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
                <Link
                  href="/treasurer/receipts"
                  onClick={closeMobileMenu}
                  className="block px-8 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Wallet className="inline-block mr-2 h-4 w-4" />
                  Treasurer
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

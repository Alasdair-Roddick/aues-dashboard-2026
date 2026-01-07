import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = nextUrl.pathname === "/login";
  const isOnAdminPage = nextUrl.pathname.startsWith("/admin");
  const userRole = req.auth?.user ? (req.auth.user as any).role : null;

  // If not logged in and not on login page, redirect to login
  if (!isLoggedIn && !isOnLoginPage) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // If logged in and on login page, redirect to home
  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // If on admin page and not an admin, redirect to home
  if (isOnAdminPage && userRole !== "Admin") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/app/db";
import { users, accounts, sessions, verificationTokens, authenticators } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { signInSchema } from "@/app/lib/zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
    authenticatorsTable: authenticators,
  }),
  session: {
    strategy: "database",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("[Auth] Starting authentication process");

          if (!credentials?.username || !credentials?.password) {
            console.log("[Auth] Missing credentials - username or password not provided");
            return null;
          }

          const parsed = signInSchema.safeParse({
            username: credentials.username,
            password: credentials.password,
          });

          if (!parsed.success) {
            console.log("[Auth] Validation failed:", parsed.error.issues.map((i) => i.message).join(", "));
            return null;
          }

          const { username, password } = parsed.data;
          console.log("[Auth] Credentials validated, looking up user:", username);

          // Find user by username
          let user;
          try {
            [user] = await db.select().from(users).where(eq(users.name, username)).limit(1);
          } catch (error) {
            console.error("[Auth] Database error during user lookup:", error instanceof Error ? error.message : "Unknown error");
            return null;
          }

          if (!user) {
            console.log("[Auth] User not found:", username);
            return null;
          }

          if (!user.password) {
            console.log("[Auth] User has no password set:", username);
            return null;
          }

          console.log("[Auth] User found, verifying password for:", username);

          // Verify password using bcrypt
          let isValid = false;
          try {
            const { verifyPassword } = await import("@/app/utils/password");
            isValid = await verifyPassword(password, user.password);
          } catch (error) {
            console.error("[Auth] Error during password verification:", error instanceof Error ? error.message : "Unknown error");
            return null;
          }

          if (!isValid) {
            console.log("[Auth] Invalid password for user:", username);
            return null;
          }

          console.log("[Auth] Authentication successful for user:", username, "with role:", user.role);

          // Return user object (without password)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("[Auth] Unexpected error in authorize:", error instanceof Error ? error.message : "Unknown error");
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const mutableToken = token as Record<string, unknown>;
        const role = (user as { role?: string }).role;
        mutableToken.id = user.id;
        mutableToken.role = role ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const mutableUser = session.user as {
          id?: string;
          role?: string | null;
        };
        const tokenData = token as Record<string, unknown>;
        mutableUser.id = typeof tokenData.id === "string" ? tokenData.id : undefined;
        mutableUser.role = typeof tokenData.role === "string" ? tokenData.role : null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

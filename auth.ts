import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/app/db";
import { users, accounts, sessions, verificationTokens, authenticators } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { signInSchema } from "@/app/lib/zod";
import { ActivityLogger } from "@/app/lib/activity";

const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

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
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
  },
  jwt: {
    async encode({ token }) {
      if (!token) return "";

      // Existing session — return the stored session token
      if (token.sessionToken) {
        return token.sessionToken as string;
      }

      // New sign-in — create a database session and return the token
      if (token.id) {
        const sessionToken = crypto.randomUUID();
        await db.insert(sessions).values({
          sessionToken,
          userId: token.id as string,
          expires: new Date(Date.now() + SESSION_MAX_AGE * 1000),
        });
        return sessionToken;
      }

      return "";
    },
    async decode({ token }) {
      if (!token) return null;

      // Look up the session in the database
      const [session] = await db
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, token))
        .limit(1);

      if (!session || session.expires < new Date()) {
        return null;
      }

      // Fetch the user to get role and other fields
      const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

      if (!user) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sessionToken: token,
        exp: Math.floor(session.expires.getTime() / 1000),
      };
    },
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          const parsed = signInSchema.safeParse({
            username: credentials.username,
            password: credentials.password,
          });

          if (!parsed.success) {
            return null;
          }

          const { username, password } = parsed.data;

          // Find user by username
          let user;
          try {
            [user] = await db.select().from(users).where(eq(users.name, username)).limit(1);
          } catch (error) {
            console.error("[Auth] Database error during user lookup");
            return null;
          }

          if (!user || !user.password) {
            return null;
          }

          // Verify password using bcrypt
          let isValid = false;
          try {
            const { verifyPassword } = await import("@/app/utils/password");
            isValid = await verifyPassword(password, user.password);
          } catch (error) {
            console.error("[Auth] Error during password verification");
            return null;
          }

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          };
        } catch (error) {
          console.error("[Auth] Unexpected error in authorize");
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const mutableUser = session.user as {
          id?: string;
          role?: string | null;
        };
        mutableUser.id = typeof token.id === "string" ? token.id : undefined;
        mutableUser.role = typeof token.role === "string" ? token.role : null;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user?.id && user?.name) {
        await ActivityLogger.login({ id: user.id, name: user.name });
      }
    },
    async signOut(message) {
      // Log logout before deleting session
      if ("token" in message && message.token?.id && message.token?.name) {
        await ActivityLogger.logout({
          id: message.token.id as string,
          name: message.token.name as string,
        });
      }
      // Delete the session from the database on sign-out
      if ("token" in message && message.token?.sessionToken) {
        await db
          .delete(sessions)
          .where(eq(sessions.sessionToken, message.token.sessionToken as string));
      }
    },
  },
  pages: {
    signIn: "/login",
  },
});

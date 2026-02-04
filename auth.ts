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
        strategy: "jwt",
    },
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const { username, password } = await signInSchema.parseAsync({
                    username: credentials.username,
                    password: credentials.password,
                });

                // Find user by username
                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.name, username))
                    .limit(1);

                if (!user || !user.password) {
                    return null;
                }

                // Verify password using argon2 (dynamic import to avoid bundling in edge runtime)
                const { verifyPassword } = await import("@/app/utils/password");
                const isValid = await verifyPassword(password, user.password);

                if (!isValid) {
                    return null;
                }

                // Return user object (without password)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    image: user.image,
                };
            }
        })
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

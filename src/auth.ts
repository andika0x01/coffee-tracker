import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { D1Adapter } from "@auth/d1-adapter";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const { handlers, auth, signIn, signOut } = NextAuth(async (req) => {
  let db: D1Database;

  try {
    const ctx = await getCloudflareContext();
    db = ctx.env.DB;
  } catch (e) {
    db = (process.env as any).DB;
  }

  return {
    adapter: D1Adapter(db),
    providers: [
      Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
      }),
    ],
    callbacks: {
      session: ({ session, user }) => ({
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      }),
    },
    trustHost: true,
    pages: {
      signIn: "/login",
    },
  };
});

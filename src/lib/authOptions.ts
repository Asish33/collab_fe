import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        const idToken = (account as unknown as { id_token?: string } | null)
          ?.id_token;
        if (!idToken) return false;

        await fetch(`${process.env.BACKEND_URL}/users/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email: user?.email ?? undefined,
            name: user?.name ?? undefined,
            picture: user?.image ?? undefined,
            googleId: (profile as Record<string, unknown> | undefined)?.[
              "sub"
            ] as string | undefined,
          }),
        });

        return true;
      } catch (err) {
        console.error("Error syncing user:", err);
        return false;
      }
    },

    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = (account as Record<string, unknown>)[
          "access_token"
        ] as string | undefined;
        (token as Record<string, unknown>)["idToken"] = (
          account as Record<string, unknown>
        )["id_token"] as string | undefined;
      }
      if (profile) {
        (token as Record<string, unknown>)["user"] = {
          name: (profile as Record<string, unknown>)["name"] as
            | string
            | undefined,
          email: (profile as Record<string, unknown>)["email"] as
            | string
            | undefined,
          image: (profile as Record<string, unknown>)["picture"] as
            | string
            | undefined,
        };
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && (token as Record<string, unknown>)["user"]) {
        session.user = {
          ...session.user,
          ...((token as Record<string, unknown>)["user"] as object),
        } as typeof session.user;
      }

      const accessToken = (token as Record<string, unknown>)["accessToken"] as
        | string
        | undefined;
      const idToken = (token as Record<string, unknown>)["idToken"] as
        | string
        | undefined;
      if (accessToken) {
        (session as unknown as { accessToken?: string }).accessToken =
          accessToken;
      }
      if (idToken) {
        (session as unknown as { idToken?: string }).idToken = idToken;
      }
      return session;
    },
  },
};

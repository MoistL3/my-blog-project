import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { configuredAdminGithubId, normalizeGithubId } from "./src/lib/github-id";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  pages: { signIn: "/admin/login" },
  providers: [GitHub({ clientId: process.env.AUTH_GITHUB_ID ?? "", clientSecret: process.env.AUTH_GITHUB_SECRET ?? "" })],
  callbacks: {
    signIn({ profile, account }) {
      if (account?.provider !== "github") return false;
      const adminId = configuredAdminGithubId();
      const githubId = normalizeGithubId(account.providerAccountId ?? profile?.id);
      return Boolean(adminId && githubId && githubId === adminId);
    },
    jwt({ token, account, profile }) {
      if (account?.provider === "github") {
        const githubId = normalizeGithubId(account.providerAccountId ?? profile?.id);
        if (githubId) token.sub = githubId;
      }
      return token;
    },
    session({ session, token }) {
      const githubId = normalizeGithubId(token.sub);
      if (session.user && githubId) session.user.id = githubId;
      return session;
    },
  },
});
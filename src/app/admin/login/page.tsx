import { signIn } from "../../../../auth";
import Link from "next/link";
import { isGitHubAuthConfigured } from "@/lib/github-id";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const configured = isGitHubAuthConfigured();
  return <div className="login-wrap"><div className="login-card"><p className="eyebrow">private area</p><div className="login-logo">&lt;/&gt;</div><h1>Owner access</h1><p>Sign in with the GitHub account linked to this site.</p>{params.error === "admin_required" && <div className="config-alert">You are signed in, but this GitHub account does not match the configured owner ID. Check ADMIN_GITHUB_ID against your numeric GitHub user ID.</div>}{configured ? <form action={async () => { "use server"; await signIn("github", { redirectTo: "/admin" }); }}><button className="admin-button primary" type="submit">Continue with GitHub <span>↗</span></button></form> : <div className="config-alert">GitHub sign-in is not configured correctly. Set AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, AUTH_SECRET, and a numeric ADMIN_GITHUB_ID in .env.local.</div>}<Link href="/">← return to the public site</Link></div></div>;
}
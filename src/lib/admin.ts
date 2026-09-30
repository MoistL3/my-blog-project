import "server-only";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { configuredAdminGithubId, isGitHubAuthConfigured, normalizeGithubId } from "@/lib/github-id";

export async function requireAdmin() {
  if (!isGitHubAuthConfigured()) redirect("/admin/login");
  const session = await auth();
  if (!session) redirect("/admin/login");
  const adminId = configuredAdminGithubId();
  const sessionId = normalizeGithubId(session.user?.id);
  if (!adminId || !sessionId || sessionId !== adminId) redirect("/admin/login?error=admin_required");
  return session;
}
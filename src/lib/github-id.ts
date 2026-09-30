export function normalizeGithubId(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim().replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2").trim();
  return /^\d+$/.test(normalized) ? normalized : null;
}

export function configuredAdminGithubId(): string | null {
  return normalizeGithubId(process.env.ADMIN_GITHUB_ID);
}

export function isGitHubAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_SECRET?.trim()
    && process.env.AUTH_GITHUB_ID?.trim()
    && process.env.AUTH_GITHUB_SECRET?.trim()
    && configuredAdminGithubId(),
  );
}
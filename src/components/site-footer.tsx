import type { Settings } from "@/lib/mock-data";

export function SiteFooter({ settings }: { settings: Settings }) {
  return <footer className="site-footer"><span>© {new Date().getFullYear()} · {settings.ownerName} · built with intention</span><div><span className="status-dot" /> <span>all systems nominal</span></div></footer>;
}
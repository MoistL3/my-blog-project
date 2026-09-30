import Link from "next/link";
import Image from "next/image";
import type { Settings } from "@/lib/mock-data";

const links = [{ href: "/articles", label: "articles" }, { href: "/qa", label: "q&a" }];

export function SiteHeader({ settings }: { settings: Settings }) {
  const brandName = settings.ownerName.trim().split(/\s+/)[0]?.toLowerCase() || "portfolio";
  return <header className="site-header"><Link className="brand" href="/" aria-label={`${settings.ownerName} home`}>{settings.avatarUrl ? <Image className="brand-avatar" src={settings.avatarUrl} alt="" width={32} height={32} sizes="32px" quality={80} /> : <span className="brand-mark">&lt;/&gt;</span>}<span>{brandName}<span className="accent">.dev</span></span></Link><nav aria-label="Main navigation">{links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</nav>{settings.email && <Link className="header-contact" href={`mailto:${settings.email}`}>let&apos;s talk <span>↗</span></Link>}</header>;
}
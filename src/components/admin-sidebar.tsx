import Link from "next/link";
import { signOut } from "../../auth";

const items = [{ href: "/admin", label: "Overview", icon: "⌂" }, { href: "/admin/settings", label: "Site settings", icon: "⚙" }, { href: "/admin/articles", label: "Articles", icon: "✎" }, { href: "/admin/categories", label: "Categories", icon: "#" }, { href: "/admin/questions", label: "Q&A inbox", icon: "?" }];

export function AdminSidebar() {
  return <aside className="admin-sidebar"><Link href="/admin" className="admin-brand"><span className="brand-mark">&lt;/&gt;</span> studio<span className="admin-badge">OWNER</span></Link><p className="admin-nav-label">WORKSPACE</p><nav>{items.map((item) => <Link key={item.href} href={item.href}><span>{item.icon}</span>{item.label}</Link>)}</nav><div className="admin-sidebar-bottom"><Link href="/" target="_blank">↗ view live site</Link><form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button type="submit">⇥ sign out</button></form></div></aside>;
}
import { AdminSidebar } from "@/components/admin-sidebar";
import "./admin.css";
import "./theme.css";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="admin-layout"><AdminSidebar /><main className="admin-main">{children}</main></div>;
}
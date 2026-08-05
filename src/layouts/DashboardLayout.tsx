import { useState, type ReactNode } from "react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Header } from "../components/dashboard/Header";

export interface PageMeta {
  title: string;
  breadcrumb: { label: string; to?: string }[];
}

export function DashboardLayout({ meta, children }: { meta: PageMeta; children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-800"
      style={{ fontFamily: "'Be Vietnam Pro', Inter, system-ui, sans-serif" }}>
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          title={meta.title}
          breadcrumb={meta.breadcrumb}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 px-4 sm:px-6 py-5 space-y-5 overflow-x-hidden">{children}</main>
        <footer className="px-4 sm:px-6 py-4 border-t border-slate-200 text-[12px] text-slate-400 flex flex-col sm:flex-row gap-1 sm:justify-between">
          <span>© 2026 UBND phường Xuân Hoà - Dashboard điều hành Xuân Hoà Số</span>
          <span>Phiên bản 1.0.0</span>
        </footer>
      </div>
    </div>
  );
}

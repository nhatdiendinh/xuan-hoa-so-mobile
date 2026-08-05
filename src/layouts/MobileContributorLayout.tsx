import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";
import { Bell, ClipboardList, FileText, Home, Plus, User } from "lucide-react";
import { useAuth } from "../services/auth";

const NAV = [
  { to: "/mobile/tasks", label: "Công việc", Icon: Home },
  { to: "/mobile/content", label: "Bài viết", Icon: FileText },
  { to: "/mobile/feedback", label: "Phản ánh", Icon: ClipboardList },
  { to: "/mobile/notifications", label: "Thông báo", Icon: Bell },
  { to: "/mobile/profile", label: "Cá nhân", Icon: User },
];

export function MobileContributorLayout({ title, children, showCompose = true }: {
  title: string; children: ReactNode; showCompose?: boolean;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col"
      style={{ fontFamily: "'Be Vietnam Pro', Inter, system-ui, sans-serif" }}>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
        <p className="text-[16px] font-semibold text-slate-900 leading-tight">{title}</p>
        <p className="text-[12px] text-slate-500">
          {user?.fullName} · {user?.hoodId ? `Khu phố ${user.hoodId}` : "Toàn phường"}
        </p>
      </header>

      <main className="flex-1 px-4 py-4 pb-[150px] space-y-4 overflow-x-hidden">{children}</main>

      {showCompose && (
        <button onClick={() => navigate("/mobile/content/create")}
          className="fixed left-1/2 -translate-x-1/2 bottom-[76px] z-40 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-blue-600 text-white text-[14px] font-semibold shadow-lg active:bg-blue-700">
          <Plus size={18} /> Đăng bài
        </button>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 grid grid-cols-5">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 min-h-[56px] text-[10.5px] ${isActive ? "text-blue-600" : "text-slate-500"}`
            }>
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

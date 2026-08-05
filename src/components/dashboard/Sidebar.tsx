import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import {
  LayoutDashboard, MessageSquareWarning, ListTodo, Newspaper, Megaphone,
  CalendarDays, GraduationCap, Images, Building2, Trash2, MapPinned,
  ClipboardList, Grid3x3, Eye, BarChart3, Users, Settings, X, Smartphone, MonitorPlay,
  ChevronDown, Newspaper as NewspaperGroup,
} from "lucide-react";
import logoXuanHoa from "../../assets/logo-dashboard.png";
import type { Module } from "../../types";
import { useAuth } from "../../services/auth";

interface Item { to: string; label: string; icon: typeof LayoutDashboard; module: Module; end?: boolean }
interface Group { title: string; icon: typeof LayoutDashboard; items: Item[] }

/** Mục lớn độc lập, không có danh mục con - đặt trên đầu sidebar */
export const TOP_ITEM: Item = {
  to: "/dashboard/led", label: "Màn hình LED điều hành", icon: MonitorPlay, module: "overview",
};

export const MENU: Group[] = [
  {
    title: "Điều hành",
    icon: LayoutDashboard,
    items: [
      { to: "/dashboard/overview", label: "Tổng quan", icon: LayoutDashboard, module: "overview" },
      { to: "/dashboard/feedback", label: "Phản ánh kiến nghị", icon: MessageSquareWarning, module: "feedback" },
      { to: "/dashboard/tasks", label: "Công việc cần xử lý", icon: ListTodo, module: "tasks" },
    ],
  },
  {
    title: "Nội dung",
    icon: NewspaperGroup,
    items: [
      { to: "/dashboard/content/news", label: "Tin tức", icon: Newspaper, module: "content" },
      { to: "/dashboard/content/announcements", label: "Thông báo", icon: Megaphone, module: "content" },
      { to: "/dashboard/content/events", label: "Lịch hoạt động", icon: CalendarDays, module: "content" },
      { to: "/dashboard/digital-literacy", label: "Bình dân học vụ số", icon: GraduationCap, module: "literacy" },
      { to: "/dashboard/media", label: "Thư viện ảnh - video", icon: Images, module: "media" },
    ],
  },
  {
    title: "Địa bàn",
    icon: MapPinned,
    items: [
      { to: "/dashboard/neighborhoods", label: "Khu phố", icon: Building2, module: "neighborhoods" },
      { to: "/dashboard/waste-schedule", label: "Lịch thu gom rác", icon: Trash2, module: "waste" },
      { to: "/dashboard/utilities", label: "Bản đồ tiện ích", icon: MapPinned, module: "utilities" },
    ],
  },
  {
    title: "Hệ thống",
    icon: Settings,
    items: [
      { to: "/dashboard/surveys", label: "Khảo sát - đăng ký", icon: ClipboardList, module: "surveys" },
      { to: "/dashboard/content/banners", label: "Banner trang chủ", icon: Grid3x3, module: "content" },
      { to: "/dashboard/preview", label: "Xem trước trang", icon: Eye, module: "preview" },
      { to: "/dashboard/reports", label: "Thống kê - báo cáo", icon: BarChart3, module: "reports" },
      { to: "/dashboard/users", label: "Người dùng", icon: Users, module: "users" },
      { to: "/dashboard/settings", label: "Cấu hình", icon: Settings, module: "settings" },
    ],
  },
];

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: {
  collapsed: boolean; mobileOpen: boolean; onCloseMobile: () => void;
}) {
  const { can } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState<string[]>(() => {
    const g = MENU.find((x) => x.items.some((i) => pathname.startsWith(i.to)));
    return g ? [g.title] : [MENU[0].title];
  });

  // Tự mở nhóm chứa trang đang xem
  useEffect(() => {
    const g = MENU.find((x) => x.items.some((i) => pathname.startsWith(i.to)));
    if (g) setOpen((cur) => (cur.includes(g.title) ? cur : [...cur, g.title]));
  }, [pathname]);

  const toggle = (title: string) =>
    setOpen((cur) => (cur.includes(title) ? cur.filter((t) => t !== title) : [...cur, title]));

  const body = (
    <>
      <div className={`flex items-center gap-2.5 px-4 h-16 border-b border-slate-100 ${collapsed ? "justify-center px-0" : ""}`}>
        <img src={logoXuanHoa} alt="Logo phường Xuân Hoà" className="w-10 h-10 object-contain shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-slate-900 leading-tight truncate">Xuân Hoà Số</p>
            <p className="text-[11.5px] text-slate-500 leading-tight">Dashboard điều hành</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "thin" }}>
        {can(TOP_ITEM.module) && (
          <div className="mb-2 pb-2 border-b border-slate-100">
            <NavLink to={TOP_ITEM.to} onClick={onCloseMobile} title={collapsed ? TOP_ITEM.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-2.5 mx-2 px-3 h-10 rounded-lg text-[13.5px] font-medium transition-colors ${
                  collapsed ? "justify-center px-0" : ""
                } ${isActive ? "bg-blue-600 text-white hover:bg-blue-600" : "text-slate-700 hover:bg-slate-100"}`
              }>
              <TOP_ITEM.icon size={17} className="shrink-0" />
              {!collapsed && <span className="truncate">{TOP_ITEM.label}</span>}
            </NavLink>
          </div>
        )}

        {MENU.map((g) => {
          const items = g.items.filter((i) => can(i.module));
          if (!items.length) return null;
          const GroupIcon = g.icon;
          const isOpen = open.includes(g.title);
          const hasActive = items.some((i) => pathname.startsWith(i.to));

          // Sidebar thu gọn: hiện icon từng mục, không dùng menu sổ
          if (collapsed) {
            return (
              <div key={g.title} className="mb-2 pb-2 border-b border-slate-100 last:border-0">
                {items.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} onClick={onCloseMobile} title={label}
                    className={({ isActive }) =>
                      `flex items-center justify-center mx-2 h-9 rounded-lg transition-colors ${
                        isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                      }`
                    }>
                    <Icon size={17} />
                  </NavLink>
                ))}
              </div>
            );
          }

          return (
            <div key={g.title} className="mb-1">
              <button onClick={() => toggle(g.title)}
                className={`w-full flex items-center gap-2.5 mx-2 px-3 h-10 rounded-lg text-[13.5px] font-medium transition-colors ${
                  hasActive ? "text-blue-700 bg-blue-50/60" : "text-slate-700 hover:bg-slate-100"
                }`}
                style={{ width: "calc(100% - 16px)" }}>
                <GroupIcon size={17} className="shrink-0" />
                <span className="flex-1 text-left truncate">{g.title}</span>
                <ChevronDown size={15}
                  className={`shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="ml-[26px] mr-2 my-1 border-l border-slate-200 pl-2 space-y-0.5">
                  {items.map(({ to, label, icon: Icon }) => (
                    <NavLink key={to} to={to} onClick={onCloseMobile}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 h-9 rounded-lg text-[13px] transition-colors ${
                          isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-100"
                        }`
                      }>
                      <Icon size={16} className="shrink-0" />
                      <span className="truncate">{label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-2">
        <NavLink to="/" onClick={onCloseMobile}
          className={`flex items-center gap-2.5 px-3 h-9 rounded-lg text-[13px] text-slate-600 hover:bg-slate-100 ${collapsed ? "justify-center px-0" : ""}`}
          title={collapsed ? "Về giao diện mobile" : undefined}>
          <Smartphone size={17} className="shrink-0" />
          {!collapsed && <span className="truncate">Về giao diện mobile</span>}
        </NavLink>
      </div>
      <div className={`border-t border-slate-100 px-4 py-3 text-[11.5px] text-slate-400 ${collapsed ? "text-center px-0" : ""}`}>
        {collapsed ? "v1.0" : "Phiên bản 1.0.0"}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-200 shrink-0 transition-all ${collapsed ? "w-[68px]" : "w-[248px]"}`}>
        {body}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[80] bg-slate-900/40" onClick={onCloseMobile}>
          <aside onClick={(e) => e.stopPropagation()} className="w-[268px] h-full bg-white flex flex-col">
            <button onClick={onCloseMobile}
              className="absolute top-4 right-[-44px] w-9 h-9 rounded-lg bg-white/90 flex items-center justify-center text-slate-600">
              <X size={17} />
            </button>
            {body}
          </aside>
        </div>
      )}
    </>
  );
}

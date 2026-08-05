import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell, ChevronDown, Eye, LogOut, Menu, PanelLeftClose, PanelLeft, Plus, Check, Smartphone,
} from "lucide-react";
import { useAuth } from "../../services/auth";
import { ROLE_LABEL } from "../../services/permissions";
import { useTable } from "../../services/store";
import { Allow } from "../common/Guards";

const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export function formatDateTime(d: Date) {
  return `${WEEKDAYS[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

export function Header({
  title, breadcrumb, collapsed, onToggleCollapse, onOpenMobile,
}: {
  title: string;
  breadcrumb: { label: string; to?: string }[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useTable("notifications");
  const [openNotif, setOpenNotif] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);

  const unread = notifs.filter((n) => !n.read).length;

  const markAll = () => setNotifs(notifs.map((n) => ({ ...n, read: true })));

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        <button onClick={onOpenMobile} className="lg:hidden w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600">
          <Menu size={18} />
        </button>
        <button onClick={onToggleCollapse} className="hidden lg:flex w-9 h-9 rounded-lg hover:bg-slate-100 items-center justify-center text-slate-500">
          {collapsed ? <PanelLeft size={17} /> : <PanelLeftClose size={17} />}
        </button>

        <h1 className="flex-1 min-w-0 text-[18px] sm:text-[22px] font-semibold text-slate-900 truncate">{title}</h1>

        <span className="hidden xl:block text-[12.5px] text-slate-500">{formatDateTime(new Date())}</span>

        <button onClick={() => navigate("/")}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-600 hover:bg-slate-50">
          <Smartphone size={15} /> <span className="hidden sm:inline">Giao diện mobile</span>
        </button>

        <Allow module="preview">
          <button onClick={() => navigate("/dashboard/preview")}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 text-[13px] text-slate-600 hover:bg-slate-50">
            <Eye size={15} /> Xem trước trang
          </button>
        </Allow>

        {/* Tạo nhanh */}
        <Allow module="content" action="create">
          <div className="relative">
            <button onClick={() => { setOpenCreate((v) => !v); setOpenNotif(false); setOpenUser(false); }}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700">
              <Plus size={15} /> <span className="hidden sm:inline">Tạo nhanh</span>
            </button>
            {openCreate && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                {[
                  { label: "Đăng tin tức", to: "/dashboard/content/create?type=news" },
                  { label: "Tạo thông báo", to: "/dashboard/content/create?type=announcement" },
                  { label: "Tạo lịch hoạt động", to: "/dashboard/content/create?type=event" },
                  { label: "Tiếp nhận phản ánh", to: "/dashboard/feedback?tab=new" },
                ].map((i) => (
                  <button key={i.to} onClick={() => { setOpenCreate(false); navigate(i.to); }}
                    className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50">
                    {i.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Allow>

        {/* Thông báo */}
        <div className="relative">
          <button onClick={() => { setOpenNotif((v) => !v); setOpenCreate(false); setOpenUser(false); }}
            className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-red-500 text-white text-[9.5px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          {openNotif && (
            <div className="absolute right-0 mt-2 w-[320px] max-w-[calc(100vw-32px)] bg-white border border-slate-200 rounded-xl shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-[13.5px] font-semibold text-slate-900">Thông báo</p>
                <button onClick={markAll} className="text-[12px] text-blue-600 hover:underline inline-flex items-center gap-1">
                  <Check size={12} /> Đánh dấu đã đọc
                </button>
              </div>
              <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
                {notifs.slice(0, 8).map((n) => (
                  <button key={n.id} onClick={() => { setOpenNotif(false); navigate(n.link); }}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${n.read ? "" : "bg-blue-50/40"}`}>
                    <p className="text-[13px] font-medium text-slate-800">{n.title}</p>
                    <p className="text-[12px] text-slate-500 mt-0.5">{n.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tài khoản */}
        <div className="relative">
          <button onClick={() => { setOpenUser((v) => !v); setOpenCreate(false); setOpenNotif(false); }}
            className="flex items-center gap-2 h-9 pl-1.5 pr-2 rounded-lg hover:bg-slate-100">
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-[12px] font-semibold flex items-center justify-center">
              {user?.fullName.split(" ").pop()?.[0] ?? "?"}
            </span>
            <span className="hidden md:block text-left">
              <span className="block text-[13px] font-medium text-slate-800 leading-tight">{user?.fullName}</span>
              <span className="block text-[11px] text-slate-500 leading-tight">{user ? ROLE_LABEL[user.role] : ""}</span>
            </span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {openUser && (
            <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[13px] font-medium text-slate-800">{user?.fullName}</p>
                <p className="text-[11.5px] text-slate-500">{user?.unit}</p>
              </div>
              <button onClick={() => { setOpenUser(false); navigate("/"); }}
                className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50">
                Trang người dân (mobile)
              </button>
              <button onClick={() => { setOpenUser(false); navigate("/mobile/tasks"); }}
                className="w-full text-left px-4 py-2 text-[13px] text-slate-700 hover:bg-slate-50">
                Giao diện khu phố trên điện thoại
              </button>
              <button onClick={() => { logout(); navigate("/login"); }}
                className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 inline-flex items-center gap-2">
                <LogOut size={14} /> Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 pb-3 flex items-center gap-1.5 text-[12.5px] text-slate-500 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
            {i > 0 && <span className="text-slate-300">/</span>}
            {b.to ? (
              <button onClick={() => navigate(b.to!)} className="hover:text-blue-600">{b.label}</button>
            ) : (
              <span className="text-slate-800 font-medium">{b.label}</span>
            )}
          </span>
        ))}
      </div>
    </header>
  );
}

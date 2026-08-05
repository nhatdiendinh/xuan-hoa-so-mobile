import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../services/auth";
import type { Action, Module } from "../../types";
import { ShieldAlert } from "lucide-react";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function PermissionGuard({ module, action = "view", children }: {
  module: Module; action?: Action; children: ReactNode;
}) {
  const { user, can } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!can(module, action)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
          <ShieldAlert size={22} className="text-red-500" />
        </div>
        <p className="text-[15px] font-semibold text-slate-800">Không có quyền truy cập</p>
        <p className="text-[13px] text-slate-500 max-w-md">
          Tài khoản của bạn không được phân quyền sử dụng chức năng này. Vui lòng liên hệ quản trị hệ thống.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

/** Ẩn phần tử nếu không đủ quyền (dùng cho nút thao tác) */
export function Allow({ module, action = "view", children }: {
  module: Module; action?: Action; children: ReactNode;
}) {
  const { can } = useAuth();
  if (!can(module, action)) return null;
  return <>{children}</>;
}

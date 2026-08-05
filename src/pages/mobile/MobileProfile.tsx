import { useNavigate } from "react-router";
import { LogOut, Monitor } from "lucide-react";
import { MobileContributorLayout } from "../../layouts/MobileContributorLayout";
import { Card, Button, Badge } from "../../components/common/ui";
import { useAuth } from "../../services/auth";
import { ROLE_LABEL } from "../../services/permissions";
import { fmtDateTime } from "../../utils/format";

export default function MobileProfile() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();

  return (
    <MobileContributorLayout title="Cá nhân" showCompose={false}>
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-blue-600 text-white text-[16px] font-semibold flex items-center justify-center">
            {user?.fullName.split(" ").pop()?.[0]}
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-slate-900">{user?.fullName}</p>
            <p className="text-[12.5px] text-slate-500">{user?.unit}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="violet">{user ? ROLE_LABEL[user.role] : ""}</Badge>
          {user?.hoodId && <Badge tone="blue">Khu phố {user.hoodId}</Badge>}
          {user?.canPublishDirectly && <Badge tone="green">Được đăng trực tiếp</Badge>}
        </div>
        <dl className="mt-4 space-y-2 text-[13px]">
          {[["Tài khoản", user?.username], ["Điện thoại", user?.phone], ["Email", user?.email],
            ["Đăng nhập gần nhất", user ? fmtDateTime(user.lastLogin) : "-"]].map(([k, v]) => (
            <div key={k as string} className="flex justify-between gap-3">
              <dt className="text-slate-500">{k}</dt><dd className="text-slate-800 font-medium text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="p-4 space-y-2">
        {can("overview") && (
          <Button variant="secondary" icon={<Monitor size={15} />} className="w-full min-h-[44px]"
            onClick={() => navigate("/dashboard/overview")}>
            Mở dashboard trên máy tính
          </Button>
        )}
        <Button variant="danger" icon={<LogOut size={15} />} className="w-full min-h-[44px]"
          onClick={() => { logout(); navigate("/login"); }}>
          Đăng xuất
        </Button>
      </Card>
    </MobileContributorLayout>
  );
}

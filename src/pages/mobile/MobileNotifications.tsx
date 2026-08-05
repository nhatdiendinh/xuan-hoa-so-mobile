import { useNavigate } from "react-router";
import { MobileContributorLayout } from "../../layouts/MobileContributorLayout";
import { Card, EmptyState } from "../../components/common/ui";
import { useTable } from "../../services/store";
import { fromNow } from "../../utils/format";

export default function MobileNotifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useTable("notifications");

  return (
    <MobileContributorLayout title="Thông báo" showCompose={false}>
      <Card>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <p className="text-[14px] font-semibold text-slate-900">Thông báo nội bộ</p>
          <button onClick={() => setNotifs(notifs.map((n) => ({ ...n, read: true })))} className="text-[12px] text-blue-600">
            Đánh dấu đã đọc
          </button>
        </div>
        {notifs.length === 0 ? <EmptyState title="Chưa có thông báo" /> : (
          <div className="divide-y divide-slate-100">
            {notifs.map((n) => (
              <button key={n.id} onClick={() => navigate(n.link)}
                className={`w-full text-left px-4 py-3 ${n.read ? "" : "bg-blue-50/50"}`}>
                <p className="text-[13px] font-medium text-slate-800">{n.title}</p>
                <p className="text-[12px] text-slate-500 mt-0.5">{n.description}</p>
                <p className="text-[11px] text-slate-400 mt-1">{fromNow(n.at)}</p>
              </button>
            ))}
          </div>
        )}
      </Card>
    </MobileContributorLayout>
  );
}

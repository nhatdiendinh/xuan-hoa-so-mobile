import { useNavigate } from "react-router";
import { AlertCircle, CalendarDays, CheckCircle2, FileClock, FileText, Send } from "lucide-react";
import { MobileContributorLayout } from "../../layouts/MobileContributorLayout";
import { Card, StatusBadge, Badge, EmptyState } from "../../components/common/ui";
import { useScopedContents, useScopedFeedbacks } from "../../hooks/useScoped";
import { daysLeft, fmtDate } from "../../utils/format";

export default function MobileTasks() {
  const navigate = useNavigate();
  const feedbacks = useScopedFeedbacks();
  const contents = useScopedContents();

  const newFb = feedbacks.filter((f) => f.status === "new");
  const drafts = contents.filter((c) => c.status === "draft");
  const pending = contents.filter((c) => c.status === "pending");
  const revision = contents.filter((c) => c.status === "needs_revision");
  const published = contents.filter((c) => c.status === "published");
  const events = contents.filter((c) => c.type === "event" && c.startAt && daysLeft(c.startAt) >= 0);

  const groups = [
    { key: "fb", label: "Phản ánh mới", Icon: AlertCircle, tone: "text-blue-600", count: newFb.length, to: "/mobile/feedback" },
    { key: "revision", label: "Cần chỉnh sửa", Icon: AlertCircle, tone: "text-amber-600", count: revision.length, to: "/mobile/content" },
    { key: "draft", label: "Tin đang soạn", Icon: FileText, tone: "text-slate-500", count: drafts.length, to: "/mobile/content" },
    { key: "pending", label: "Tin chờ duyệt", Icon: FileClock, tone: "text-violet-600", count: pending.length, to: "/mobile/content" },
    { key: "published", label: "Tin đã đăng", Icon: CheckCircle2, tone: "text-emerald-600", count: published.length, to: "/mobile/content" },
    { key: "event", label: "Lịch hoạt động sắp tới", Icon: CalendarDays, tone: "text-teal-600", count: events.length, to: "/mobile/content" },
  ];

  return (
    <MobileContributorLayout title="Công việc khu phố">
      <div className="grid grid-cols-2 gap-3">
        {groups.map(({ key, label, Icon, tone, count, to }) => (
          <button key={key} onClick={() => navigate(to)} className="text-left">
            <Card className="p-3.5 h-full">
              <Icon size={18} className={tone} />
              <p className="text-[22px] font-semibold text-slate-900 mt-2 leading-none">{count}</p>
              <p className="text-[12px] text-slate-500 mt-1.5 leading-snug">{label}</p>
            </Card>
          </button>
        ))}
      </div>

      <Card>
        <p className="px-4 py-3 text-[14px] font-semibold text-slate-900 border-b border-slate-100">Việc cần xử lý</p>
        {newFb.length === 0 && revision.length === 0 ? (
          <EmptyState title="Không có việc cần xử lý" description="Bạn đã hoàn thành các việc được giao." />
        ) : (
          <div className="divide-y divide-slate-100">
            {newFb.slice(0, 5).map((f) => (
              <button key={f.id} onClick={() => navigate(`/mobile/feedback`)} className="w-full text-left px-4 py-3">
                <p className="text-[13px] font-medium text-slate-800 line-clamp-2">{f.code} - {f.summary}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge status={f.status} kind="feedback" />
                  <span className="text-[11.5px] text-slate-400">Hạn {fmtDate(f.dueAt)}</span>
                </div>
              </button>
            ))}
            {revision.map((c) => (
              <button key={c.id} onClick={() => navigate(`/mobile/content/create?id=${c.id}`)} className="w-full text-left px-4 py-3">
                <p className="text-[13px] font-medium text-slate-800 line-clamp-2">{c.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <StatusBadge status={c.status} />
                  <Badge tone="slate">Cần sửa và gửi lại</Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="px-4 py-3 text-[14px] font-semibold text-slate-900 border-b border-slate-100">Lịch hoạt động sắp tới</p>
        {events.length === 0 ? <EmptyState title="Chưa có hoạt động sắp diễn ra" /> : (
          <div className="divide-y divide-slate-100">
            {events.slice(0, 5).map((c) => (
              <div key={c.id} className="px-4 py-3">
                <p className="text-[13px] font-medium text-slate-800 line-clamp-2">{c.title}</p>
                <p className="text-[11.5px] text-slate-500 mt-1">{fmtDate(c.startAt)} · {c.place}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </MobileContributorLayout>
  );
}

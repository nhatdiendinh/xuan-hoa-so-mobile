import { useNavigate } from "react-router";
import { MobileContributorLayout } from "../../layouts/MobileContributorLayout";
import { Card, StatusBadge, EmptyState, Badge } from "../../components/common/ui";
import { useScopedFeedbacks } from "../../hooks/useScoped";
import { fmtDate, slaState } from "../../utils/format";

export default function MobileFeedback() {
  const navigate = useNavigate();
  const feedbacks = useScopedFeedbacks();

  return (
    <MobileContributorLayout title="Phản ánh khu phố" showCompose={false}>
      <Card>
        {feedbacks.length === 0 ? (
          <EmptyState title="Chưa có phản ánh" description="Khu phố của bạn chưa có phản ánh nào." />
        ) : (
          <div className="divide-y divide-slate-100">
            {feedbacks.map((f) => {
              const sla = slaState(f.dueAt, f.status);
              return (
                <button key={f.id} onClick={() => navigate(`/dashboard/feedback/${f.id}`)}
                  className="w-full text-left px-4 py-3 active:bg-slate-50">
                  <p className="text-[13px] font-medium text-slate-800 line-clamp-2">{f.code} - {f.summary}</p>
                  <p className="text-[11.5px] text-slate-500 mt-1">{f.field} · Hạn {fmtDate(f.dueAt)}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <StatusBadge status={f.status} kind="feedback" />
                    {sla === "overdue" && <Badge tone="red">Quá hạn</Badge>}
                    {sla === "due_soon" && <Badge tone="amber">Sắp quá hạn</Badge>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </MobileContributorLayout>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContributorLayout } from "../../layouts/MobileContributorLayout";
import { Card, StatusBadge, EmptyState } from "../../components/common/ui";
import { Tabs } from "../../components/common/Filters";
import { useScopedContents } from "../../hooks/useScoped";
import { fmtDate } from "../../utils/format";
import { CONTENT_TYPE_LABEL } from "../../data/mock";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "draft", label: "Nháp" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "needs_revision", label: "Cần sửa" },
  { key: "published", label: "Đã đăng" },
];

export default function MobileContent() {
  const navigate = useNavigate();
  const contents = useScopedContents();
  const [tab, setTab] = useState("all");
  const rows = contents.filter((c) => (tab === "all" ? true : c.status === tab));

  return (
    <MobileContributorLayout title="Bài viết của khu phố">
      <Card>
        <Tabs tabs={TABS.map((t) => ({ ...t, count: contents.filter((c) => (t.key === "all" ? true : c.status === t.key)).length }))}
          active={tab} onChange={setTab} />
        {rows.length === 0 ? (
          <EmptyState title="Chưa có bài viết" description="Bấm Đăng bài để tạo nội dung mới." />
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((c) => (
              <button key={c.id} onClick={() => navigate(`/mobile/content/create?id=${c.id}`)}
                className="w-full flex gap-3 px-4 py-3 text-left active:bg-slate-50">
                {c.image
                  ? <img src={c.image} alt="" className="w-[88px] h-16 rounded-xl object-cover shrink-0" />
                  : <div className="w-[88px] h-16 rounded-xl bg-slate-100 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-slate-800 line-clamp-2">{c.title}</p>
                  <p className="text-[11.5px] text-slate-500 mt-1">{CONTENT_TYPE_LABEL[c.type]} · {fmtDate(c.createdAt)}</p>
                  <div className="mt-1.5"><StatusBadge status={c.status} /></div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </MobileContributorLayout>
  );
}

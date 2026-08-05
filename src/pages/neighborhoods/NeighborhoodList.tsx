import { useState } from "react";
import { useNavigate } from "react-router";
import { Building2 } from "lucide-react";
import { Card, CardHeader, Badge, Button } from "../../components/common/ui";
import { DataTable, type Column } from "../../components/common/DataTable";
import { FilterBar, SearchInput, Select } from "../../components/common/Filters";
import { useTable } from "../../services/store";
import { useScopedNeighborhoods } from "../../hooks/useScoped";
import { fmtDateTime, daysLeft } from "../../utils/format";
import type { Neighborhood } from "../../types";

export default function NeighborhoodList() {
  const navigate = useNavigate();
  const hoods = useScopedNeighborhoods();
  const [feedbacks] = useTable("feedbacks");
  const [contents] = useTable("contents");
  const [waste] = useTable("waste");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const rows = hoods.filter((h) =>
    (!q || `${h.name} ${h.leaderName}`.toLowerCase().includes(q.toLowerCase())) &&
    (!status || (status === "active" ? h.active : !h.active))
  );

  const columns: Column<Neighborhood>[] = [
    { key: "name", header: "Khu phố", mobile: "title", render: (r) => <span className="font-medium text-slate-800">{r.name}</span> },
    { key: "leader", header: "Ban điều hành", mobile: "meta", render: (r) => r.leaderName },
    { key: "phone", header: "Liên hệ", mobile: "meta", render: (r) => r.phone },
    {
      key: "news", header: "Tin đang hiển thị", mobile: "meta",
      render: (r) => contents.filter((c) => c.hoodId === r.id && c.status === "published").length,
    },
    {
      key: "open", header: "Phản ánh đang mở", mobile: "meta",
      render: (r) => feedbacks.filter((f) => f.hoodId === r.id && f.status !== "completed").length,
    },
    {
      key: "events", header: "Lịch sắp tới", mobile: "meta",
      render: (r) => contents.filter((c) => c.hoodId === r.id && c.type === "event" && c.startAt && daysLeft(c.startAt) >= 0).length,
    },
    { key: "waste", header: "Lịch rác", mobile: "meta", render: (r) => waste.filter((w) => w.hoodId === r.id).length },
    { key: "last", header: "Cập nhật gần nhất", mobile: "meta", render: (r) => fmtDateTime(r.lastUpdate) },
    { key: "status", header: "Trạng thái", mobile: "badge", render: (r) => <Badge tone={r.active ? "green" : "slate"}>{r.active ? "Đang hoạt động" : "Tạm ngưng"}</Badge> },
    { key: "act", header: "Thao tác", render: (r) => <Button size="sm" variant="secondary" onClick={() => navigate(`/dashboard/neighborhoods/${r.id}`)}>Chi tiết</Button> },
  ];

  return (
    <Card>
      <CardHeader title="Danh sách khu phố" icon={<Building2 size={16} className="text-emerald-600" />} />
      <FilterBar>
        <SearchInput value={q} onChange={setQ} placeholder="Tìm khu phố hoặc trưởng khu phố..." />
        <Select value={status} onChange={setStatus} placeholder="Tất cả trạng thái"
          options={[{ value: "active", label: "Đang hoạt động" }, { value: "paused", label: "Tạm ngưng" }]} />
      </FilterBar>
      <DataTable columns={columns} rows={rows} rowKey={(r) => String(r.id)}
        onRowClick={(r) => navigate(`/dashboard/neighborhoods/${r.id}`)} emptyTitle="Không tìm thấy khu phố"
        pageSizeOptions={[10, 20, 50]} />
    </Card>
  );
}

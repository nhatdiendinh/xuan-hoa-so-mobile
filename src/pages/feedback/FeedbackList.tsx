import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Download, MessageSquareWarning } from "lucide-react";
import { Card, CardHeader, StatusBadge, PriorityBadge, Button, Badge } from "../../components/common/ui";
import { DataTable, type Column } from "../../components/common/DataTable";
import { FilterBar, SearchInput, Select, DateRange, Tabs } from "../../components/common/Filters";
import { Allow } from "../../components/common/Guards";
import { useAuth } from "../../services/auth";
import { useTable } from "../../services/store";
import { useScopedFeedbacks } from "../../hooks/useScoped";
import { FEEDBACK_FIELDS } from "../../data/mock";
import { csvDownload, fmtDate, slaState } from "../../utils/format";
import type { Feedback } from "../../types";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "new", label: "Mới tiếp nhận" },
  { key: "unassigned", label: "Chưa phân công" },
  { key: "processing", label: "Đang xử lý" },
  { key: "due", label: "Sắp quá hạn" },
  { key: "overdue", label: "Quá hạn" },
  { key: "completed", label: "Đã hoàn thành" },
  { key: "waiting", label: "Cần bổ sung" },
];

export default function FeedbackList() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const rowsAll = useScopedFeedbacks();
  const [users] = useTable("users");
  const [neighborhoods] = useTable("neighborhoods");
  const [params, setParams] = useSearchParams();

  const tab = params.get("tab") ?? "all";
  const [q, setQ] = useState("");
  const [hood, setHood] = useState("");
  const [field, setField] = useState("");
  const [assignee, setAssignee] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const byTab = (f: Feedback) => {
    const sla = slaState(f.dueAt, f.status);
    switch (tab) {
      case "new": return f.status === "new";
      case "unassigned": return !f.assigneeId;
      case "processing": return ["assigned", "processing"].includes(f.status);
      case "due": return sla === "due_soon" && f.status !== "completed";
      case "overdue": return sla === "overdue" && f.status !== "completed";
      case "completed": return f.status === "completed";
      case "waiting": return f.status === "waiting";
      default: return true;
    }
  };

  const rows = useMemo(() => rowsAll.filter((f) => {
    if (!byTab(f)) return false;
    if (q && !`${f.code} ${f.summary} ${f.content}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (hood && f.hoodId !== Number(hood)) return false;
    if (field && f.field !== field) return false;
    if (assignee && f.assigneeId !== assignee) return false;
    if (from && new Date(f.createdAt) < new Date(from)) return false;
    if (to && new Date(f.createdAt) > new Date(`${to}T23:59:59`)) return false;
    return true;
  }), [rowsAll, tab, q, hood, field, assignee, from, to]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    TABS.forEach((t) => {
      c[t.key] = rowsAll.filter((f) => {
        const sla = slaState(f.dueAt, f.status);
        switch (t.key) {
          case "new": return f.status === "new";
          case "unassigned": return !f.assigneeId;
          case "processing": return ["assigned", "processing"].includes(f.status);
          case "due": return sla === "due_soon" && f.status !== "completed";
          case "overdue": return sla === "overdue" && f.status !== "completed";
          case "completed": return f.status === "completed";
          case "waiting": return f.status === "waiting";
          default: return true;
        }
      }).length;
    });
    return c;
  }, [rowsAll]);

  const columns: Column<Feedback>[] = [
    { key: "code", header: "Mã", mobile: "title", render: (r) => <span className="font-mono text-[12.5px] text-slate-600">{r.code}</span> },
    { key: "summary", header: "Nội dung", render: (r) => <span className="line-clamp-2 max-w-[320px] inline-block">{r.summary}</span> },
    ...(can("feedback", "edit")
      ? [{ key: "sender", header: "Người gửi", mobile: "meta" as const, render: (r: Feedback) => (
          <span>{r.senderName}<br /><span className="text-slate-400 text-[12px]">{r.senderPhone}</span></span>
        ) }]
      : []),
    { key: "hood", header: "Khu phố", mobile: "meta", render: (r) => `Khu phố ${r.hoodId}` },
    { key: "field", header: "Lĩnh vực", mobile: "meta", render: (r) => <Badge tone="slate">{r.field}</Badge> },
    { key: "createdAt", header: "Ngày nhận", mobile: "meta", render: (r) => fmtDate(r.createdAt) },
    {
      key: "due", header: "Hạn xử lý", mobile: "meta",
      render: (r) => {
        const s = slaState(r.dueAt, r.status);
        return <span className={s === "overdue" ? "text-red-600 font-medium" : s === "due_soon" ? "text-orange-600 font-medium" : ""}>{fmtDate(r.dueAt)}</span>;
      },
    },
    { key: "assignee", header: "Phụ trách", mobile: "meta", render: (r) => users.find((u) => u.id === r.assigneeId)?.fullName ?? "Chưa phân công" },
    { key: "priority", header: "Ưu tiên", mobile: "badge", render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: "status", header: "Trạng thái", mobile: "badge", render: (r) => <StatusBadge status={r.status} kind="feedback" /> },
    { key: "act", header: "Thao tác", render: (r) => <Button size="sm" variant="secondary" onClick={() => navigate(`/dashboard/feedback/${r.id}`)}>Xem</Button> },
  ];

  const exportCsv = () => {
    csvDownload("phan-anh-kien-nghi.csv", [
      ["Mã", "Nội dung", "Khu phố", "Lĩnh vực", "Ngày nhận", "Hạn xử lý", "Phụ trách", "Trạng thái"],
      ...rows.map((r) => [
        r.code, r.summary, `Khu phố ${r.hoodId}`, r.field, fmtDate(r.createdAt), fmtDate(r.dueAt),
        users.find((u) => u.id === r.assigneeId)?.fullName ?? "Chưa phân công", r.status,
      ]),
    ]);
  };

  return (
    <Card>
      <CardHeader title="Danh sách phản ánh kiến nghị" icon={<MessageSquareWarning size={16} className="text-blue-600" />}
        action={
          <Allow module="feedback" action="export">
            <Button size="sm" variant="secondary" icon={<Download size={14} />} onClick={exportCsv}>Xuất CSV</Button>
          </Allow>
        } />
      <Tabs tabs={TABS.map((t) => ({ ...t, count: counts[t.key] }))} active={tab}
        onChange={(k) => setParams(k === "all" ? {} : { tab: k })} />
      <FilterBar>
        <SearchInput value={q} onChange={setQ} placeholder="Tìm theo mã hoặc nội dung..." />
        <Select value={hood} onChange={setHood} placeholder="Tất cả khu phố"
          options={neighborhoods.map((n) => ({ value: String(n.id), label: n.name }))} />
        <Select value={field} onChange={setField} placeholder="Tất cả lĩnh vực"
          options={FEEDBACK_FIELDS.map((f) => ({ value: f, label: f }))} />
        <Select value={assignee} onChange={setAssignee} placeholder="Tất cả người xử lý"
          options={users.map((u) => ({ value: u.id, label: u.fullName }))} />
        <DateRange from={from} to={to} onFrom={setFrom} onTo={setTo} />
      </FilterBar>
      <DataTable columns={columns} rows={rows} rowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/dashboard/feedback/${r.id}`)}
        emptyTitle="Không có phản ánh phù hợp"
        emptyDescription="Thay đổi bộ lọc hoặc chọn tab khác để xem thêm dữ liệu." />
    </Card>
  );
}

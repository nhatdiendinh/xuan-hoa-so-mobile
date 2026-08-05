import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ListTodo } from "lucide-react";
import { Card, CardHeader, Badge, StatusBadge, PriorityBadge, Button } from "../../components/common/ui";
import { DataTable, type Column } from "../../components/common/DataTable";
import { FilterBar, SearchInput, Select } from "../../components/common/Filters";
import { useTable } from "../../services/store";
import { useScopedContents, useScopedFeedbacks } from "../../hooks/useScoped";
import { daysLeft, fmtDate } from "../../utils/format";
import { CONTENT_TYPE_LABEL } from "../../data/mock";

interface Task {
  id: string; title: string; kind: string; group: "feedback" | "content";
  hoodId: number | null; assignee: string; due: string; priority: string; status: string; link: string;
}

export default function Tasks() {
  const navigate = useNavigate();
  const feedbacks = useScopedFeedbacks();
  const contents = useScopedContents();
  const [users] = useTable("users");
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");
  const [priority, setPriority] = useState("");

  const tasks: Task[] = useMemo(() => [
    ...feedbacks.filter((f) => f.status !== "completed").map((f) => ({
      id: f.id, title: `${f.code} - ${f.summary}`, kind: "Phản ánh", group: "feedback" as const,
      hoodId: f.hoodId, assignee: users.find((u) => u.id === f.assigneeId)?.fullName ?? "Chưa phân công",
      due: f.dueAt, priority: f.priority, status: f.status, link: `/dashboard/feedback/${f.id}`,
    })),
    ...contents.filter((c) => ["pending", "needs_revision", "approved", "scheduled"].includes(c.status)).map((c) => ({
      id: c.id, title: c.title, kind: CONTENT_TYPE_LABEL[c.type], group: "content" as const,
      hoodId: c.hoodId, assignee: users.find((u) => u.id === c.authorId)?.fullName ?? "-",
      due: c.scheduledAt ?? c.createdAt, priority: "normal", status: c.status, link: `/dashboard/content/${c.id}/edit`,
    })),
  ].sort((a, b) => +new Date(a.due) - +new Date(b.due)), [feedbacks, contents, users]);

  const rows = tasks.filter((t) =>
    (!q || t.title.toLowerCase().includes(q.toLowerCase())) &&
    (!group || t.group === group) &&
    (!priority || t.priority === priority)
  );

  const columns: Column<Task>[] = [
    { key: "title", header: "Công việc", mobile: "title", render: (r) => <span className="font-medium text-slate-800 line-clamp-2">{r.title}</span> },
    { key: "kind", header: "Loại", mobile: "meta", render: (r) => <Badge tone="slate">{r.kind}</Badge> },
    { key: "hood", header: "Khu phố", mobile: "meta", render: (r) => (r.hoodId ? `Khu phố ${r.hoodId}` : "Toàn phường") },
    { key: "assignee", header: "Phụ trách", mobile: "meta", render: (r) => r.assignee },
    {
      key: "due", header: "Thời hạn", mobile: "meta",
      render: (r) => {
        const d = daysLeft(r.due);
        return <span className={d < 0 ? "text-red-600 font-medium" : d <= 2 ? "text-orange-600 font-medium" : ""}>{fmtDate(r.due)}</span>;
      },
    },
    { key: "priority", header: "Ưu tiên", mobile: "badge", render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: "status", header: "Trạng thái", mobile: "badge", render: (r) => <StatusBadge status={r.status} kind={r.group === "feedback" ? "feedback" : "content"} /> },
    { key: "act", header: "Thao tác", render: (r) => <Button size="sm" variant="secondary" onClick={() => navigate(r.link)}>Xử lý</Button> },
  ];

  return (
    <Card>
      <CardHeader title="Công việc cần xử lý" icon={<ListTodo size={16} className="text-orange-500" />} />
      <FilterBar>
        <SearchInput value={q} onChange={setQ} placeholder="Tìm công việc..." />
        <Select value={group} onChange={setGroup} placeholder="Tất cả loại"
          options={[{ value: "feedback", label: "Phản ánh" }, { value: "content", label: "Nội dung" }]} />
        <Select value={priority} onChange={setPriority} placeholder="Tất cả mức ưu tiên"
          options={[{ value: "urgent", label: "Khẩn" }, { value: "high", label: "Ưu tiên" }, { value: "normal", label: "Bình thường" }]} />
      </FilterBar>
      <DataTable columns={columns} rows={rows} rowKey={(r) => `${r.group}-${r.id}`}
        onRowClick={(r) => navigate(r.link)} emptyTitle="Không còn việc cần xử lý" />
    </Card>
  );
}

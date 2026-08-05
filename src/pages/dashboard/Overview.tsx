import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  MessageSquareWarning, AlarmClock, FileClock, CalendarDays, ClipboardList,
  Plus, Megaphone, Newspaper, ArrowUpRight, History, Building2,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, CardHeader, Badge, StatusBadge, PriorityBadge, EmptyState, Button } from "../../components/common/ui";
import { DataTable, type Column } from "../../components/common/DataTable";
import { Select } from "../../components/common/Filters";
import { Allow } from "../../components/common/Guards";
import { useAuth } from "../../services/auth";
import { useTable } from "../../services/store";
import { useScopedContents, useScopedFeedbacks, useScopedNeighborhoods } from "../../hooks/useScoped";
import { fmtDate, fmtDateTime, fromNow, greeting, daysLeft, slaState } from "../../utils/format";
import { CONTENT_TYPE_LABEL } from "../../data/mock";
import type { Feedback } from "../../types";

export default function Overview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const feedbacks = useScopedFeedbacks();
  const contents = useScopedContents();
  const hoods = useScopedNeighborhoods();
  const [users] = useTable("users");
  const [logs] = useTable("logs");
  const [hoodFilter, setHoodFilter] = useState("all");

  const stats = useMemo(() => {
    const open = feedbacks.filter((f) => f.status !== "completed");
    return {
      new: feedbacks.filter((f) => f.status === "new").length,
      processing: feedbacks.filter((f) => ["assigned", "processing", "waiting"].includes(f.status)).length,
      completed: feedbacks.filter((f) => f.status === "completed").length,
      overdue: open.filter((f) => slaState(f.dueAt, f.status) === "overdue").length,
      dueSoon: open.filter((f) => slaState(f.dueAt, f.status) === "due_soon").length,
      pendingContent: contents.filter((c) => c.status === "pending").length,
      upcomingEvents: contents.filter((c) => c.type === "event" && c.startAt && daysLeft(c.startAt) >= 0 && daysLeft(c.startAt) <= 7).length,
    };
  }, [feedbacks, contents]);

  const [surveys] = useTable("surveys");
  const openSurveys = surveys.filter((s) => s.status === "open").length;

  const cards = [
    { key: "new", label: "Phản ánh mới", value: stats.new, desc: "Chưa tiếp nhận xử lý", Icon: MessageSquareWarning, tone: "bg-blue-50 text-blue-600", to: "/dashboard/feedback?tab=new" },
    { key: "due", label: "Sắp quá hạn / quá hạn", value: stats.dueSoon + stats.overdue, desc: `${stats.overdue} hồ sơ đã quá hạn`, Icon: AlarmClock, tone: "bg-orange-50 text-orange-600", to: "/dashboard/feedback?tab=overdue" },
    { key: "pending", label: "Nội dung chờ duyệt", value: stats.pendingContent, desc: "Cần duyệt trước khi xuất bản", Icon: FileClock, tone: "bg-violet-50 text-violet-600", to: "/dashboard/content/news?status=pending" },
    { key: "event", label: "Hoạt động sắp diễn ra", value: stats.upcomingEvents, desc: "Trong 7 ngày tới", Icon: CalendarDays, tone: "bg-emerald-50 text-emerald-600", to: "/dashboard/content/events" },
    { key: "survey", label: "Khảo sát đang mở", value: openSurveys, desc: "Đang nhận phản hồi", Icon: ClipboardList, tone: "bg-teal-50 text-teal-600", to: "/dashboard/surveys" },
  ];

  // ─── Việc cần làm ngay ─────────────────────────────────────────────────────
  type Task = {
    id: string; title: string; kind: string; hoodId: number | null;
    assignee: string; due: string; priority: string; status: string; link: string; statusKind: "content" | "feedback";
  };
  const tasks: Task[] = useMemo(() => {
    const fbTasks: Task[] = feedbacks
      .filter((f) => f.status !== "completed")
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
      .slice(0, 6)
      .map((f) => ({
        id: f.id, title: `${f.code} - ${f.summary}`, kind: "Phản ánh", hoodId: f.hoodId,
        assignee: users.find((u) => u.id === f.assigneeId)?.fullName ?? "Chưa phân công",
        due: f.dueAt, priority: f.priority, status: f.status, link: `/dashboard/feedback/${f.id}`, statusKind: "feedback",
      }));
    const ctTasks: Task[] = contents
      .filter((c) => c.status === "pending")
      .slice(0, 4)
      .map((c) => ({
        id: c.id, title: c.title, kind: CONTENT_TYPE_LABEL[c.type], hoodId: c.hoodId,
        assignee: users.find((u) => u.id === c.authorId)?.fullName ?? "-",
        due: c.scheduledAt ?? c.createdAt, priority: "normal", status: c.status,
        link: `/dashboard/content/${c.id}/edit`, statusKind: "content",
      }));
    return [...fbTasks, ...ctTasks];
  }, [feedbacks, contents, users]);

  const taskColumns: Column<Task>[] = [
    { key: "title", header: "Công việc", mobile: "title", render: (r) => <span className="font-medium text-slate-800 line-clamp-2">{r.title}</span> },
    { key: "kind", header: "Loại", mobile: "meta", render: (r) => <Badge tone="slate">{r.kind}</Badge> },
    { key: "hood", header: "Khu phố", mobile: "meta", render: (r) => (r.hoodId ? `Khu phố ${r.hoodId}` : "Toàn phường") },
    { key: "assignee", header: "Phụ trách", mobile: "meta", render: (r) => r.assignee },
    {
      key: "due", header: "Thời hạn", mobile: "meta",
      render: (r) => {
        const d = daysLeft(r.due);
        return (
          <span className={d < 0 ? "text-red-600 font-medium" : d <= 2 ? "text-orange-600 font-medium" : ""}>
            {fmtDate(r.due)}{d < 0 ? ` (quá ${-d} ngày)` : d <= 2 ? ` (còn ${d} ngày)` : ""}
          </span>
        );
      },
    },
    { key: "priority", header: "Ưu tiên", mobile: "badge", render: (r) => <PriorityBadge priority={r.priority} /> },
    { key: "status", header: "Trạng thái", mobile: "badge", render: (r) => <StatusBadge status={r.status} kind={r.statusKind} /> },
    {
      key: "act", header: "Thao tác",
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => navigate(r.link)}>Xem</Button>
      ),
    },
  ];

  // ─── Phản ánh gần nhất ─────────────────────────────────────────────────────
  const recent = [...feedbacks].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5);
  const fbColumns: Column<Feedback>[] = [
    { key: "code", header: "Mã", mobile: "title", render: (r) => <span className="font-mono text-[12.5px] text-slate-500">{r.code}</span> },
    { key: "summary", header: "Nội dung", render: (r) => <span className="line-clamp-2">{r.summary}</span> },
    { key: "hood", header: "Khu phố", mobile: "meta", render: (r) => `Khu phố ${r.hoodId}` },
    { key: "createdAt", header: "Tiếp nhận", mobile: "meta", render: (r) => fmtDate(r.createdAt) },
    { key: "assignee", header: "Người xử lý", mobile: "meta", render: (r) => users.find((u) => u.id === r.assigneeId)?.fullName ?? "Chưa phân công" },
    { key: "due", header: "Hạn xử lý", mobile: "meta", render: (r) => fmtDate(r.dueAt) },
    { key: "status", header: "Trạng thái", mobile: "badge", render: (r) => <StatusBadge status={r.status} kind="feedback" /> },
  ];

  // ─── Nội dung sắp hiển thị ─────────────────────────────────────────────────
  const upcoming = contents
    .filter((c) => ["pending", "approved", "scheduled", "published"].includes(c.status))
    .filter((c) => c.pinned || c.status !== "published")
    .slice(0, 6);

  // ─── Tình hình 18 khu phố ──────────────────────────────────────────────────
  const hoodRows = useMemo(() => {
    const rows = hoods.map((h) => {
      const open = feedbacks.filter((f) => f.hoodId === h.id && f.status !== "completed");
      const overdue = open.filter((f) => slaState(f.dueAt, f.status) === "overdue").length;
      const monthNews = contents.filter(
        (c) => c.hoodId === h.id && c.type === "news" && daysLeft(c.createdAt) > -31
      ).length;
      const events = contents.filter(
        (c) => c.hoodId === h.id && c.type === "event" && c.startAt && daysLeft(c.startAt) >= 0
      ).length;
      return { hood: h, open: open.length, overdue, monthNews, events };
    });
    if (hoodFilter === "overdue") return rows.filter((r) => r.overdue > 0);
    if (hoodFilter === "stale") return rows.filter((r) => r.monthNews === 0);
    if (hoodFilter === "events") return rows.filter((r) => r.events > 0);
    return rows;
  }, [hoods, feedbacks, contents, hoodFilter]);

  const fieldChart = useMemo(() => {
    const m = new Map<string, number>();
    feedbacks.forEach((f) => m.set(f.field, (m.get(f.field) ?? 0) + 1));
    return Array.from(m, ([name, value]) => ({ name, value }));
  }, [feedbacks]);

  const summary = `Hôm nay có ${stats.new} phản ánh cần tiếp nhận, ${stats.pendingContent} nội dung chờ duyệt và ${stats.upcomingEvents} hoạt động sắp diễn ra.`;

  return (
    <>
      {/* Khối chào mừng */}
      <Card className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div className="min-w-0">
            <h2 className="text-[18px] font-semibold text-slate-900">
              {greeting()}, {user?.fullName}
            </h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              {user?.unit} · {fmtDate(new Date().toISOString())}
            </p>
            <p className="text-[13.5px] text-slate-700 mt-2">{summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Allow module="content" action="create">
              <Button icon={<Megaphone size={15} />} variant="secondary"
                onClick={() => navigate("/dashboard/content/create?type=announcement")}>Tạo thông báo</Button>
            </Allow>
            <Allow module="content" action="create">
              <Button icon={<Newspaper size={15} />} variant="secondary"
                onClick={() => navigate("/dashboard/content/create?type=news")}>Đăng tin</Button>
            </Allow>
            <Allow module="feedback" action="edit">
              <Button icon={<Plus size={15} />} onClick={() => navigate("/dashboard/feedback?tab=new")}>Tiếp nhận phản ánh</Button>
            </Allow>
          </div>
        </div>
      </Card>

      {/* Thẻ công việc */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {cards.map(({ key, label, value, desc, Icon, tone, to }) => (
          <button key={key} onClick={() => navigate(to)} className="text-left">
            <Card className="p-4 h-full hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[12.5px] font-medium text-slate-500">{label}</span>
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
                  <Icon size={17} />
                </span>
              </div>
              <p className="mt-2 text-[26px] font-semibold text-slate-900 leading-none">{value}</p>
              <p className="mt-1.5 text-[11.5px] text-slate-400">{desc}</p>
            </Card>
          </button>
        ))}
      </div>

      {/* Việc cần làm ngay */}
      <Card>
        <CardHeader title="Việc cần làm ngay" icon={<AlarmClock size={16} className="text-orange-500" />}
          action={<Button size="sm" variant="ghost" icon={<ArrowUpRight size={14} />} onClick={() => navigate("/dashboard/tasks")}>Xem tất cả</Button>} />
        <DataTable columns={taskColumns} rows={tasks} rowKey={(r) => r.id}
          emptyTitle="Không có việc cần xử lý" emptyDescription="Toàn bộ phản ánh và nội dung đã được xử lý." />
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Tình hình phản ánh */}
        <Card className="xl:col-span-2">
          <CardHeader title="Tình hình phản ánh kiến nghị" icon={<MessageSquareWarning size={16} className="text-blue-600" />}
            action={<Button size="sm" variant="ghost" onClick={() => navigate("/dashboard/feedback")}>Xem tất cả</Button>} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-4">
            {[
              { label: "Mới", value: stats.new, tone: "text-blue-600" },
              { label: "Đang xử lý", value: stats.processing, tone: "text-amber-600" },
              { label: "Hoàn thành", value: stats.completed, tone: "text-emerald-600" },
              { label: "Quá hạn", value: stats.overdue, tone: "text-red-600" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5">
                <p className={`text-[20px] font-semibold leading-none ${s.tone}`}>{s.value}</p>
                <p className="text-[11.5px] text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="px-3 pb-2 h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fieldChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "#64748B" }} tickLine={false} axisLine={false} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} width={26} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
                <Bar dataKey="value" name="Số phản ánh" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <DataTable columns={fbColumns} rows={recent} rowKey={(r) => r.id}
            onRowClick={(r) => navigate(`/dashboard/feedback/${r.id}`)}
            emptyTitle="Chưa có phản ánh" pageSizeOptions={[5, 10]} />
        </Card>

        {/* Hoạt động gần đây */}
        <Card>
          <CardHeader title="Hoạt động gần đây" icon={<History size={16} className="text-violet-600" />} />
          <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
            {logs.slice(0, 12).map((l) => {
              const actor = users.find((u) => u.id === l.actorId);
              return (
                <div key={l.id} className="px-5 py-3">
                  <p className="text-[13px] text-slate-700">
                    <span className="font-medium text-slate-900">{actor?.fullName ?? "Người dùng"}</span> {l.action}
                  </p>
                  <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">{l.target}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{fromNow(l.at)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Nội dung sắp hiển thị */}
      <Card>
        <CardHeader title="Nội dung sắp hiển thị cho người dân" icon={<Newspaper size={16} className="text-violet-600" />}
          action={<Button size="sm" variant="ghost" onClick={() => navigate("/dashboard/preview")}>Xem trước trang</Button>} />
        {upcoming.length === 0 ? (
          <EmptyState title="Chưa có nội dung chờ hiển thị" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
            {upcoming.map((c) => {
              const warnings: string[] = [];
              if (!c.image) warnings.push("Thiếu ảnh đại diện");
              if (!c.publishedAt && !c.scheduledAt) warnings.push("Chưa đặt ngày đăng");
              if (c.status === "pending") warnings.push("Chưa duyệt");
              return (
                <div key={c.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                  <img src={c.image} alt="" className="w-[84px] h-[62px] rounded-lg object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-slate-800 line-clamp-2">{c.title}</p>
                    <p className="text-[11.5px] text-slate-500 mt-1">
                      {CONTENT_TYPE_LABEL[c.type]} · {users.find((u) => u.id === c.authorId)?.fullName ?? "-"}
                      {c.hoodId ? ` · Khu phố ${c.hoodId}` : " · Toàn phường"}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <StatusBadge status={c.status} />
                      {warnings.map((w) => <Badge key={w} tone="amber">{w}</Badge>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Tình hình khu phố */}
      <Card>
        <CardHeader title="Tình hình khu phố" icon={<Building2 size={16} className="text-emerald-600" />}
          action={
            <Select value={hoodFilter} onChange={setHoodFilter}
              options={[
                { value: "all", label: "Tất cả khu phố" },
                { value: "overdue", label: "Có phản ánh quá hạn" },
                { value: "stale", label: "Chưa cập nhật tin" },
                { value: "events", label: "Có hoạt động sắp diễn ra" },
              ]} />
          } />
        <div className="px-3 pt-4 pb-1 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hoodRows.map((r) => ({
              name: `KP ${r.hood.id}`,
              "Phản ánh đang mở": r.open,
              "Quá hạn": r.overdue,
              "Tin trong tháng": r.monthNews,
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} tickLine={false} axisLine={false} width={26} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Phản ánh đang mở" stackId="a" fill="#2563EB" barSize={16} />
              <Bar dataKey="Quá hạn" stackId="a" fill="#DC2626" radius={[4, 4, 0, 0]} barSize={16} />
              <Bar dataKey="Tin trong tháng" fill="#059669" radius={[4, 4, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <DataTable
          rows={hoodRows}
          rowKey={(r) => String(r.hood.id)}
          onRowClick={(r) => navigate(`/dashboard/neighborhoods/${r.hood.id}`)}
          emptyTitle="Không có khu phố phù hợp bộ lọc"
          columns={[
            { key: "name", header: "Khu phố", mobile: "title", render: (r) => <span className="font-medium text-slate-800">{r.hood.name}</span> },
            { key: "open", header: "Phản ánh đang mở", mobile: "meta", render: (r) => (
              <span className={r.overdue > 0 ? "text-red-600 font-medium" : ""}>
                {r.open}{r.overdue > 0 ? ` (${r.overdue} quá hạn)` : ""}
              </span>
            ) },
            { key: "news", header: "Tin trong tháng", mobile: "meta", render: (r) => r.monthNews },
            { key: "events", header: "Lịch sắp diễn ra", mobile: "meta", render: (r) => r.events },
            { key: "last", header: "Cập nhật gần nhất", mobile: "meta", render: (r) => fmtDateTime(r.hood.lastUpdate) },
            { key: "leader", header: "Người phụ trách", mobile: "meta", render: (r) => r.hood.leaderName },
            { key: "status", header: "Trạng thái", mobile: "badge", render: (r) => (
              <Badge tone={r.hood.active ? "green" : "slate"}>{r.hood.active ? "Đang hoạt động" : "Tạm ngưng"}</Badge>
            ) },
          ]}
        />
      </Card>
    </>
  );
}

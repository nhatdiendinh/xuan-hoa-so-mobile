import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { BarChart3, Download } from "lucide-react";
import { Card, CardHeader, Button, EmptyState } from "../../components/common/ui";
import { FilterBar, Select, DateRange } from "../../components/common/Filters";
import { Allow } from "../../components/common/Guards";
import { useTable } from "../../services/store";
import { useScopedContents, useScopedFeedbacks } from "../../hooks/useScoped";
import { csvDownload, daysLeft, slaState } from "../../utils/format";

const BLUE = "#2563EB";
const VIOLET = "#7C3AED";
const GREEN = "#059669";
const ORANGE = "#EA580C";
const RED = "#DC2626";
const SLATE = "#94A3B8";
const TEAL = "#0D9488";

const axis = { fontSize: 11, fill: "#64748B" };
const tooltipStyle = {
  contentStyle: { borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 12 },
  labelStyle: { fontSize: 12, fontWeight: 600 },
};

function ChartCard({ title, subtitle, height = 260, children }: {
  title: string; subtitle?: string; height?: number; children: React.ReactElement;
}) {
  return (
    <Card>
      <CardHeader title={title} />
      {subtitle && <p className="px-5 pt-3 text-[12px] text-slate-500">{subtitle}</p>}
      <div className="px-3 py-4" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function Reports() {
  const feedbacks = useScopedFeedbacks();
  const contents = useScopedContents();
  const [hoods] = useTable("neighborhoods");
  const [surveys] = useTable("surveys");
  const [users] = useTable("users");
  const [hood, setHood] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fb = feedbacks.filter((f) =>
    (!hood || f.hoodId === Number(hood)) &&
    (!from || new Date(f.createdAt) >= new Date(from)) &&
    (!to || new Date(f.createdAt) <= new Date(`${to}T23:59:59`))
  );
  const ct = contents.filter((c) => !hood || c.hoodId === Number(hood));

  const overdue = fb.filter((f) => slaState(f.dueAt, f.status) === "overdue");
  const done = fb.filter((f) => f.status === "completed");
  const onTimeRate = fb.length ? Math.round(((fb.length - overdue.length) / fb.length) * 100) : 0;

  // ── Phản ánh theo tuần (4 tuần gần nhất) ──────────────────────────────────
  const byWeek = useMemo(() => {
    const buckets = [3, 2, 1, 0].map((w) => ({
      name: w === 0 ? "Tuần này" : `${w} tuần trước`,
      min: -(w + 1) * 7, max: -w * 7,
      "Tiếp nhận": 0, "Hoàn thành": 0,
    }));
    fb.forEach((f) => {
      const d = daysLeft(f.createdAt);
      const b = buckets.find((x) => d > x.min && d <= x.max);
      if (b) b["Tiếp nhận"] += 1;
      if (f.status === "completed") {
        const b2 = buckets.find((x) => d > x.min && d <= x.max);
        if (b2) b2["Hoàn thành"] += 1;
      }
    });
    return buckets;
  }, [fb]);

  // ── Trạng thái xử lý ──────────────────────────────────────────────────────
  const byStatus = useMemo(() => {
    const map: Record<string, { label: string; color: string }> = {
      new: { label: "Mới tiếp nhận", color: BLUE },
      assigned: { label: "Đã phân công", color: VIOLET },
      processing: { label: "Đang xử lý", color: ORANGE },
      waiting: { label: "Chờ bổ sung", color: SLATE },
      completed: { label: "Hoàn thành", color: GREEN },
      reopened: { label: "Mở lại", color: RED },
    };
    return Object.entries(map)
      .map(([k, v]) => ({ name: v.label, value: fb.filter((f) => f.status === k).length, color: v.color }))
      .filter((x) => x.value > 0);
  }, [fb]);

  // ── Theo lĩnh vực ─────────────────────────────────────────────────────────
  const byField = useMemo(() => {
    const m = new Map<string, number>();
    fb.forEach((f) => m.set(f.field, (m.get(f.field) ?? 0) + 1));
    return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [fb]);

  // ── Theo khu phố ──────────────────────────────────────────────────────────
  const byHood = useMemo(() => hoods.map((h) => ({
    name: `KP ${h.id}`,
    "Đang mở": fb.filter((f) => f.hoodId === h.id && f.status !== "completed").length,
    "Quá hạn": fb.filter((f) => f.hoodId === h.id && slaState(f.dueAt, f.status) === "overdue").length,
    "Đã đăng": contents.filter((c) => c.hoodId === h.id && c.status === "published").length,
    "Chờ duyệt": contents.filter((c) => c.hoodId === h.id && c.status === "pending").length,
  })), [hoods, fb, contents]);

  // ── Nội dung ──────────────────────────────────────────────────────────────
  const contentByStatus = useMemo(() => ([
    { name: "Nháp", value: ct.filter((c) => c.status === "draft").length, color: SLATE },
    { name: "Chờ duyệt", value: ct.filter((c) => c.status === "pending").length, color: VIOLET },
    { name: "Đã duyệt", value: ct.filter((c) => c.status === "approved").length, color: BLUE },
    { name: "Đã lên lịch", value: ct.filter((c) => c.status === "scheduled").length, color: TEAL },
    { name: "Đã xuất bản", value: ct.filter((c) => c.status === "published").length, color: GREEN },
    { name: "Đã ẩn", value: ct.filter((c) => c.status === "hidden").length, color: "#CBD5E1" },
  ]), [ct]);

  const topViews = useMemo(() =>
    [...ct].sort((a, b) => b.views - a.views).slice(0, 8)
      .map((c) => ({ name: c.title.length > 26 ? `${c.title.slice(0, 26)}...` : c.title, "Lượt xem": c.views })),
  [ct]);

  const topAuthors = useMemo(() =>
    users.map((u) => ({ name: u.fullName.split(" ").slice(-2).join(" "), "Số bài": ct.filter((c) => c.authorId === u.id).length }))
      .filter((x) => x["Số bài"] > 0).sort((a, b) => b["Số bài"] - a["Số bài"]).slice(0, 8),
  [users, ct]);

  const surveyData = useMemo(() =>
    surveys.map((s) => ({
      name: s.title.length > 22 ? `${s.title.slice(0, 22)}...` : s.title,
      "Lượt tham gia": s.responses,
      "Chỉ tiêu": s.limit ?? 0,
    })), [surveys]);

  const kpis = [
    { label: "Tổng phản ánh", value: fb.length, tone: "text-blue-600" },
    { label: "Tỷ lệ đúng hạn", value: `${onTimeRate}%`, tone: "text-emerald-600" },
    { label: "Quá hạn", value: overdue.length, tone: "text-red-600" },
    { label: "Đã hoàn thành", value: done.length, tone: "text-slate-800" },
    { label: "Nội dung đã đăng", value: ct.filter((c) => c.status === "published").length, tone: "text-violet-600" },
    { label: "Lượt xem nội dung", value: ct.reduce((a, c) => a + c.views, 0).toLocaleString(), tone: "text-teal-600" },
  ];

  const noData = fb.length === 0 && ct.length === 0;

  return (
    <>
      <Card>
        <CardHeader title="Thống kê - báo cáo" icon={<BarChart3 size={16} className="text-blue-600" />}
          action={
            <Allow module="reports" action="export">
              <Button size="sm" variant="secondary" icon={<Download size={14} />}
                onClick={() => csvDownload("bao-cao-tong-hop.csv", [
                  ["Khu phố", "Phản ánh đang mở", "Quá hạn", "Tin đã đăng", "Chờ duyệt"],
                  ...byHood.map((r) => [r.name, r["Đang mở"], r["Quá hạn"], r["Đã đăng"], r["Chờ duyệt"]]),
                ])}>Xuất CSV</Button>
            </Allow>
          } />
        <FilterBar>
          <Select value={hood} onChange={setHood} placeholder="Tất cả khu phố"
            options={hoods.map((h) => ({ value: String(h.id), label: h.name }))} />
          <DateRange from={from} to={to} onFrom={setFrom} onTo={setTo} />
        </FilterBar>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 p-5">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
              <p className={`text-[22px] font-semibold leading-none ${k.tone}`}>{k.value}</p>
              <p className="text-[11.5px] text-slate-500 mt-1.5">{k.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {noData ? (
        <Card><EmptyState title="Chưa có dữ liệu để thống kê" description="Thay đổi bộ lọc khu phố hoặc khoảng thời gian." /></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <ChartCard title="Phản ánh tiếp nhận và hoàn thành theo tuần">
                <AreaChart data={byWeek}>
                  <defs>
                    <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BLUE} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={BLUE} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GREEN} stopOpacity={0.32} />
                      <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} width={28} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="Tiếp nhận" stroke={BLUE} strokeWidth={2} fill="url(#gIn)" />
                  <Area type="monotone" dataKey="Hoàn thành" stroke={GREEN} strokeWidth={2} fill="url(#gDone)" />
                </AreaChart>
              </ChartCard>
            </div>

            <ChartCard title="Cơ cấu trạng thái xử lý">
              <PieChart>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11.5 }} />
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius="52%" outerRadius="78%" paddingAngle={2}>
                  {byStatus.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Pie>
              </PieChart>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <ChartCard title="Phản ánh theo lĩnh vực" height={280}>
              <BarChart data={byField} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={axis} tickLine={false} axisLine={false} width={110} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Số phản ánh" fill={VIOLET} radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Trạng thái nội dung" height={280}>
              <BarChart data={contentByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="name" tick={{ ...axis, fontSize: 10.5 }} tickLine={false} axisLine={false} interval={0} />
                <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} width={28} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Số nội dung" radius={[6, 6, 0, 0]} barSize={34}>
                  {contentByStatus.map((s) => <Cell key={s.name} fill={s.color} />)}
                </Bar>
              </BarChart>
            </ChartCard>
          </div>

          <ChartCard title="Phản ánh đang mở và quá hạn theo khu phố" height={300}>
            <BarChart data={byHood}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} interval={0} />
              <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} width={28} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Đang mở" stackId="a" fill={BLUE} radius={[0, 0, 0, 0]} barSize={18} />
              <Bar dataKey="Quá hạn" stackId="a" fill={RED} radius={[4, 4, 0, 0]} barSize={18} />
            </BarChart>
          </ChartCard>

          <ChartCard title="Nội dung đã đăng và chờ duyệt theo khu phố" height={300}>
            <BarChart data={byHood}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} interval={0} />
              <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} width={28} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Đã đăng" fill={GREEN} radius={[4, 4, 0, 0]} barSize={14} />
              <Bar dataKey="Chờ duyệt" fill={VIOLET} radius={[4, 4, 0, 0]} barSize={14} />
            </BarChart>
          </ChartCard>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <ChartCard title="Nội dung có lượt xem cao nhất" height={300}>
              <BarChart data={topViews} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={axis} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ ...axis, fontSize: 10.5 }} tickLine={false} axisLine={false} width={170} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="Lượt xem" fill={TEAL} radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Số bài đăng theo tài khoản" height={300}>
              <BarChart data={topAuthors} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={axis} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={axis} tickLine={false} axisLine={false} width={130} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="Số bài" fill={ORANGE} radius={[0, 6, 6, 0]} barSize={14} />
              </BarChart>
            </ChartCard>
          </div>

          <ChartCard title="Lượt tham gia khảo sát và đăng ký" height={300}>
            <BarChart data={surveyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="name" tick={{ ...axis, fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={54} />
              <YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} width={32} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Lượt tham gia" fill={BLUE} radius={[4, 4, 0, 0]} barSize={18} />
              <Bar dataKey="Chỉ tiêu" fill="#CBD5E1" radius={[4, 4, 0, 0]} barSize={18} />
            </BarChart>
          </ChartCard>
        </>
      )}
    </>
  );
}

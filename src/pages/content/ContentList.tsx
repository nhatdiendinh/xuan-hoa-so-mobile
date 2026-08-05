import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Copy, Eye, EyeOff, FileCheck2, Pencil, Plus, Send, Trash2, XCircle, Newspaper } from "lucide-react";
import { Card, CardHeader, StatusBadge, Button, Badge } from "../../components/common/ui";
import { DataTable, type Column } from "../../components/common/DataTable";
import { FilterBar, SearchInput, Select, DateRange } from "../../components/common/Filters";
import { ConfirmDialog, useToast } from "../../components/common/Overlays";
import { Allow } from "../../components/common/Guards";
import { useAuth } from "../../services/auth";
import { pushLog, useTable } from "../../services/store";
import { useScopedContents } from "../../hooks/useScoped";
import { CONTENT_TYPE_LABEL } from "../../data/mock";
import { fmtDate } from "../../utils/format";
import type { ContentItem, ContentStatus, ContentType } from "../../types";

const STATUS_OPTIONS: { value: ContentStatus; label: string }[] = [
  { value: "draft", label: "Nháp" },
  { value: "pending", label: "Chờ duyệt" },
  { value: "needs_revision", label: "Cần chỉnh sửa" },
  { value: "approved", label: "Đã duyệt" },
  { value: "scheduled", label: "Đã lên lịch" },
  { value: "published", label: "Đã xuất bản" },
  { value: "hidden", label: "Đã ẩn" },
];

export default function ContentList({ type, title }: { type?: ContentType; title: string }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, can } = useAuth();
  const scoped = useScopedContents();
  const [all, setAll] = useTable("contents");
  const [users] = useTable("users");
  const [neighborhoods] = useTable("neighborhoods");
  const [params] = useSearchParams();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState(params.get("status") ?? "");
  const [hood, setHood] = useState("");
  const [author, setAuthor] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [confirm, setConfirm] = useState<{ id: string; kind: "delete" | "publish" | "approve" | "reject" | "submit" | "hide" } | null>(null);

  const rows = useMemo(() => scoped.filter((c) => {
    if (type && c.type !== type) return false;
    if (!type && c.type === "banner") return false;
    if (q && !c.title.toLowerCase().includes(q.toLowerCase())) return false;
    if (status && c.status !== status) return false;
    if (hood && String(c.hoodId ?? "") !== hood) return false;
    if (author && c.authorId !== author) return false;
    if (from && new Date(c.createdAt) < new Date(from)) return false;
    if (to && new Date(c.createdAt) > new Date(`${to}T23:59:59`)) return false;
    return true;
  }), [scoped, type, q, status, hood, author, from, to]);

  const apply = (id: string, patch: Partial<ContentItem>, action: ContentItem["history"][0]["action"], label: string) => {
    setAll(all.map((c) => c.id === id
      ? { ...c, ...patch, history: [...c.history, { at: new Date().toISOString(), by: user?.fullName ?? "Cán bộ", action }] }
      : c));
    if (user) pushLog(user.id, label, all.find((c) => c.id === id)?.title ?? "", null);
    toast(`${label} thành công`);
  };

  const duplicate = (c: ContentItem) => {
    const copy: ContentItem = {
      ...c, id: `ct-${Date.now()}`, title: `${c.title} (bản sao)`, status: "draft",
      publishedAt: null, scheduledAt: null, views: 0,
      history: [{ at: new Date().toISOString(), by: user?.fullName ?? "Cán bộ", action: "created" }],
    };
    setAll([copy, ...all]);
    toast("Đã nhân bản nội dung");
  };

  const columns: Column<ContentItem>[] = [
    { key: "image", header: "Ảnh", width: "72px", render: (r) => <img src={r.image} alt="" className="w-14 h-10 rounded object-cover" /> },
    { key: "title", header: "Tiêu đề", mobile: "title", render: (r) => <span className="font-medium text-slate-800 line-clamp-2 max-w-[300px] inline-block">{r.title}</span> },
    { key: "type", header: "Loại", mobile: "meta", render: (r) => <Badge tone="slate">{CONTENT_TYPE_LABEL[r.type]}</Badge> },
    { key: "author", header: "Tác giả", mobile: "meta", render: (r) => users.find((u) => u.id === r.authorId)?.fullName ?? "-" },
    { key: "hood", header: "Đơn vị", mobile: "meta", render: (r) => (r.hoodId ? `Khu phố ${r.hoodId}` : "Toàn phường") },
    { key: "created", header: "Ngày tạo", mobile: "meta", render: (r) => fmtDate(r.createdAt) },
    { key: "published", header: "Ngày xuất bản", mobile: "meta", render: (r) => fmtDate(r.publishedAt ?? r.scheduledAt) },
    { key: "views", header: "Lượt xem", mobile: "meta", render: (r) => r.views },
    { key: "status", header: "Trạng thái", mobile: "badge", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "act", header: "Thao tác",
      render: (r) => (
        <div className="flex items-center gap-1">
          <button title="Chỉnh sửa" onClick={() => navigate(`/dashboard/content/${r.id}/edit`)}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><Pencil size={14} /></button>
          {can("content", "create") && (
            <button title="Nhân bản" onClick={() => duplicate(r)}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><Copy size={14} /></button>
          )}
          {["draft", "needs_revision"].includes(r.status) && (
            <button title="Gửi duyệt" onClick={() => setConfirm({ id: r.id, kind: "submit" })}
              className="w-7 h-7 rounded-lg hover:bg-violet-50 flex items-center justify-center text-violet-600"><Send size={14} /></button>
          )}
          {r.status === "pending" && can("content", "approve") && (
            <>
              <button title="Duyệt" onClick={() => setConfirm({ id: r.id, kind: "approve" })}
                className="w-7 h-7 rounded-lg hover:bg-emerald-50 flex items-center justify-center text-emerald-600"><FileCheck2 size={14} /></button>
              <button title="Yêu cầu chỉnh sửa" onClick={() => setConfirm({ id: r.id, kind: "reject" })}
                className="w-7 h-7 rounded-lg hover:bg-amber-50 flex items-center justify-center text-amber-600"><XCircle size={14} /></button>
            </>
          )}
          {r.status === "approved" && can("content", "publish") && (
            <button title="Xuất bản" onClick={() => setConfirm({ id: r.id, kind: "publish" })}
              className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center text-blue-600"><Eye size={14} /></button>
          )}
          {r.status === "published" && can("content", "publish") && (
            <button title="Ẩn" onClick={() => setConfirm({ id: r.id, kind: "hide" })}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><EyeOff size={14} /></button>
          )}
          {can("content", "delete") && (
            <button title="Xoá" onClick={() => setConfirm({ id: r.id, kind: "delete" })}
              className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500"><Trash2 size={14} /></button>
          )}
        </div>
      ),
    },
  ];

  const confirmMeta: Record<string, { title: string; desc: string; label: string; tone?: "danger" }> = {
    delete: { title: "Xoá nội dung", desc: "Nội dung sẽ bị xoá khỏi hệ thống và không hiển thị trên trang người dân.", label: "Xoá", tone: "danger" },
    publish: { title: "Xuất bản nội dung", desc: "Nội dung sẽ hiển thị công khai trên trang Xuân Hoà Số.", label: "Xuất bản" },
    approve: { title: "Duyệt nội dung", desc: "Nội dung sẽ chuyển sang trạng thái Đã duyệt, sẵn sàng xuất bản.", label: "Duyệt" },
    reject: { title: "Yêu cầu chỉnh sửa", desc: "Nội dung sẽ trả về cho người tạo kèm yêu cầu chỉnh sửa.", label: "Gửi yêu cầu" },
    submit: { title: "Gửi duyệt nội dung", desc: "Nội dung sẽ chuyển sang trạng thái Chờ duyệt.", label: "Gửi duyệt" },
    hide: { title: "Ẩn nội dung", desc: "Nội dung sẽ không còn hiển thị trên trang người dân.", label: "Ẩn nội dung" },
  };

  const runConfirm = () => {
    if (!confirm) return;
    const { id, kind } = confirm;
    if (kind === "delete") {
      setAll(all.filter((c) => c.id !== id));
      toast("Đã xoá nội dung");
    } else if (kind === "publish") {
      apply(id, { status: "published", publishedAt: new Date().toISOString() }, "published", "Xuất bản nội dung");
    } else if (kind === "approve") {
      apply(id, { status: "approved" }, "approved", "Duyệt nội dung");
    } else if (kind === "reject") {
      apply(id, { status: "needs_revision" }, "rejected", "Yêu cầu chỉnh sửa");
    } else if (kind === "submit") {
      apply(id, { status: "pending" }, "submitted", "Gửi duyệt nội dung");
    } else if (kind === "hide") {
      apply(id, { status: "hidden" }, "hidden", "Ẩn nội dung");
    }
    setConfirm(null);
  };

  return (
    <>
      <Card>
        <CardHeader title={title} icon={<Newspaper size={16} className="text-violet-600" />}
          action={
            <Allow module="content" action="create">
              <Button size="sm" icon={<Plus size={14} />}
                onClick={() => navigate(`/dashboard/content/create${type ? `?type=${type}` : ""}`)}>
                Tạo nội dung
              </Button>
            </Allow>
          } />
        <FilterBar>
          <SearchInput value={q} onChange={setQ} placeholder="Tìm theo tiêu đề..." />
          <Select value={status} onChange={setStatus} placeholder="Tất cả trạng thái" options={STATUS_OPTIONS} />
          <Select value={hood} onChange={setHood} placeholder="Tất cả đơn vị"
            options={neighborhoods.map((n) => ({ value: String(n.id), label: n.name }))} />
          <Select value={author} onChange={setAuthor} placeholder="Tất cả tác giả"
            options={users.map((u) => ({ value: u.id, label: u.fullName }))} />
          <DateRange from={from} to={to} onFrom={setFrom} onTo={setTo} />
        </FilterBar>
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id}
          emptyTitle="Chưa có nội dung" emptyDescription="Tạo nội dung mới hoặc thay đổi bộ lọc." />
      </Card>

      <ConfirmDialog
        open={!!confirm}
        title={confirm ? confirmMeta[confirm.kind].title : ""}
        description={confirm ? confirmMeta[confirm.kind].desc : ""}
        confirmLabel={confirm ? confirmMeta[confirm.kind].label : ""}
        tone={confirm && confirmMeta[confirm.kind].tone === "danger" ? "danger" : "primary"}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirm}
      />
    </>
  );
}

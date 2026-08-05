import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { ArrowLeft, Eye, Save, Send, History as HistoryIcon } from "lucide-react";
import { Card, CardHeader, Button, StatusBadge, Badge } from "../../components/common/ui";
import { ConfirmDialog, RightDrawer, useToast } from "../../components/common/Overlays";
import { useAuth } from "../../services/auth";
import { pushLog, pushNotification, useTable } from "../../services/store";
import { CONTENT_TYPE_LABEL, img } from "../../data/mock";
import { fmtDateTime, slugify, toInputDate } from "../../utils/format";
import type { ContentItem, ContentType } from "../../types";

const TYPES: ContentType[] = ["news", "announcement", "event", "banner", "literacy"];

export default function ContentEditor() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, can, hoodScope } = useAuth();
  const [all, setAll] = useTable("contents");
  const [neighborhoods] = useTable("neighborhoods");

  const existing = useMemo(() => all.find((c) => c.id === id) ?? null, [all, id]);
  const [form, setForm] = useState<ContentItem>(() =>
    existing ?? {
      id: `ct-${Date.now()}`,
      type: (params.get("type") as ContentType) ?? "news",
      title: "", slug: "", excerpt: "", body: "",
      image: img(2, 800, 450), gallery: [],
      hoodId: hoodScope ?? null, authorId: user?.id ?? "u-editor",
      status: "draft", createdAt: new Date().toISOString(),
      publishedAt: null, scheduledAt: null, startAt: null, endAt: null, place: "",
      pinned: false, featured: false, views: 0,
      history: [{ at: new Date().toISOString(), by: user?.fullName ?? "Cán bộ", action: "created" }],
    }
  );
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = <K extends keyof ContentItem>(key: K, value: ContentItem[K]) => {
    setForm((f) => ({ ...f, [key]: value, ...(key === "title" ? { slug: slugify(String(value)) } : {}) }));
    setDirty(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Vui lòng nhập tiêu đề";
    if (!form.excerpt.trim()) e.excerpt = "Vui lòng nhập mô tả ngắn";
    if (!form.body.trim()) e.body = "Vui lòng nhập nội dung";
    if (form.type === "event" && !form.startAt) e.startAt = "Vui lòng chọn thời gian diễn ra";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const persist = (patch: Partial<ContentItem>, action: ContentItem["history"][0]["action"], message: string) => {
    const next: ContentItem = {
      ...form, ...patch,
      history: [...form.history, { at: new Date().toISOString(), by: user?.fullName ?? "Cán bộ", action, note: reviewNote || undefined }],
    };
    setAll(existing ? all.map((c) => (c.id === next.id ? next : c)) : [next, ...all]);
    setForm(next);
    setDirty(false);
    if (user) pushLog(user.id, message.toLowerCase(), next.title, next.hoodId);
    toast(message);
  };

  const saveDraft = () => { if (validate()) persist({ status: form.status === "published" ? "published" : "draft" }, "updated", "Đã lưu nội dung"); };

  const submitReview = () => {
    persist({ status: "pending" }, "submitted", "Đã gửi duyệt nội dung");
    pushNotification({
      kind: "content", title: "Nội dung mới chờ duyệt",
      description: `${form.title} vừa được gửi duyệt.`, link: "/dashboard/content/news?status=pending", hoodId: form.hoodId,
    });
    setConfirmSubmit(false);
    navigate(-1);
  };

  const publishNow = () => {
    persist({ status: "published", publishedAt: new Date().toISOString() }, "published", "Đã xuất bản nội dung");
  };

  const field = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-blue-500 transition-colors";
  const label = "block text-[12.5px] font-medium text-slate-700 mb-1.5";

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate(-1)}>Quay lại</Button>
        <StatusBadge status={form.status} />
        <Badge tone="slate">{CONTENT_TYPE_LABEL[form.type]}</Badge>
        {dirty && <Badge tone="amber">Chưa lưu</Badge>}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" icon={<HistoryIcon size={14} />} onClick={() => setHistoryOpen(true)}>Lịch sử duyệt</Button>
          <Button variant="secondary" size="sm" icon={<Eye size={14} />} onClick={() => setPreview(true)}>Xem trước</Button>
          <Button variant="secondary" size="sm" icon={<Save size={14} />} onClick={saveDraft}>Lưu nháp</Button>
          {can("content", "publish") ? (
            <Button size="sm" icon={<Send size={14} />} onClick={() => { if (validate()) publishNow(); }}>Xuất bản</Button>
          ) : (
            <Button size="sm" icon={<Send size={14} />} onClick={() => { if (validate()) setConfirmSubmit(true); }}>Gửi duyệt</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2">
          <CardHeader title="Nội dung chính" />
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className={label}>Tiêu đề <span className="text-red-500">*</span></label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} className={field} placeholder="Nhập tiêu đề nội dung" />
              {errors.title && <p className="text-[11.5px] text-red-600 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className={label}>Đường dẫn (slug)</label>
              <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={`${field} text-slate-500`} />
            </div>
            <div>
              <label className={label}>Mô tả ngắn <span className="text-red-500">*</span></label>
              <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} className={`${field} resize-none`} />
              {errors.excerpt && <p className="text-[11.5px] text-red-600 mt-1">{errors.excerpt}</p>}
            </div>
            <div>
              <label className={label}>Nội dung <span className="text-red-500">*</span></label>
              <textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={12} className={`${field} resize-y leading-relaxed`} />
              {errors.body && <p className="text-[11.5px] text-red-600 mt-1">{errors.body}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>SEO title</label>
                <input value={form.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value)} className={field} />
              </div>
              <div>
                <label className={label}>SEO description</label>
                <input value={form.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value)} className={field} />
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Phân loại và hiển thị" />
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className={label}>Loại nội dung</label>
                <select value={form.type} onChange={(e) => set("type", e.target.value as ContentType)} className={field}>
                  {TYPES.map((t) => <option key={t} value={t}>{CONTENT_TYPE_LABEL[t]}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Khu vực hiển thị</label>
                <select value={form.hoodId ?? ""} disabled={!!hoodScope}
                  onChange={(e) => set("hoodId", e.target.value ? Number(e.target.value) : null)}
                  className={`${field} disabled:bg-slate-50`}>
                  <option value="">Toàn phường</option>
                  {neighborhoods.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
                {hoodScope && <p className="text-[11.5px] text-slate-400 mt-1">Tài khoản khu phố chỉ đăng nội dung cho khu phố được phân công.</p>}
              </div>
              {form.type === "event" && (
                <>
                  <div>
                    <label className={label}>Thời gian bắt đầu <span className="text-red-500">*</span></label>
                    <input type="date" value={toInputDate(form.startAt)} onChange={(e) => set("startAt", e.target.value ? new Date(e.target.value).toISOString() : null)} className={field} />
                    {errors.startAt && <p className="text-[11.5px] text-red-600 mt-1">{errors.startAt}</p>}
                  </div>
                  <div>
                    <label className={label}>Thời gian kết thúc</label>
                    <input type="date" value={toInputDate(form.endAt)} onChange={(e) => set("endAt", e.target.value ? new Date(e.target.value).toISOString() : null)} className={field} />
                  </div>
                  <div>
                    <label className={label}>Địa điểm</label>
                    <input value={form.place ?? ""} onChange={(e) => set("place", e.target.value)} className={field} />
                  </div>
                </>
              )}
              {form.type === "literacy" && (
                <>
                  <div>
                    <label className={label}>Chủ đề</label>
                    <input value={form.topic ?? ""} onChange={(e) => set("topic", e.target.value)} className={field} />
                  </div>
                  <div>
                    <label className={label}>Mức độ dễ hiểu</label>
                    <select value={form.level ?? "easy"} onChange={(e) => set("level", e.target.value as "easy" | "medium")} className={field}>
                      <option value="easy">Dễ hiểu</option>
                      <option value="medium">Trung bình</option>
                    </select>
                  </div>
                  <div>
                    <label className={label}>Đối tượng</label>
                    <input value={form.audience ?? ""} onChange={(e) => set("audience", e.target.value)} className={field} />
                  </div>
                </>
              )}
              <div>
                <label className={label}>Hẹn giờ xuất bản</label>
                <input type="date" value={toInputDate(form.scheduledAt)}
                  onChange={(e) => set("scheduledAt", e.target.value ? new Date(e.target.value).toISOString() : null)} className={field} />
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 text-[13px] text-slate-700">
                  <input type="checkbox" checked={form.pinned} onChange={(e) => set("pinned", e.target.checked)} className="w-4 h-4" />
                  Ghim lên trang chủ
                </label>
                <label className="flex items-center gap-2 text-[13px] text-slate-700">
                  <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4" />
                  Đánh dấu nổi bật
                </label>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Hình ảnh" />
            <div className="px-5 py-4 space-y-3">
              <img src={form.image} alt="" className="w-full h-40 rounded-lg object-cover border border-slate-100" />
              <div>
                <label className={label}>Đường dẫn ảnh đại diện</label>
                <input value={form.image} onChange={(e) => set("image", e.target.value)} className={field} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => set("image", img(i, 800, 450))}
                    className="rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400">
                    <img src={img(i, 200, 120)} alt="" className="w-full h-12 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <RightDrawer open={preview} title="Xem trước nội dung" onClose={() => setPreview(false)} width="max-w-xl">
        <article className="space-y-3">
          <img src={form.image} alt="" className="w-full h-48 rounded-xl object-cover" />
          <h1 className="text-[20px] font-semibold text-slate-900 leading-snug">{form.title || "(Chưa có tiêu đề)"}</h1>
          <p className="text-[13px] text-slate-500">{CONTENT_TYPE_LABEL[form.type]} · {form.hoodId ? `Khu phố ${form.hoodId}` : "Toàn phường"}</p>
          <p className="text-[13.5px] text-slate-700 font-medium">{form.excerpt}</p>
          {form.body.split("\n").filter(Boolean).map((p, i) => (
            <p key={i} className="text-[13.5px] text-slate-700 leading-relaxed">{p}</p>
          ))}
        </article>
      </RightDrawer>

      <RightDrawer open={historyOpen} title="Lịch sử duyệt" onClose={() => setHistoryOpen(false)}>
        <ol className="space-y-4">
          {form.history.map((h, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
              <div>
                <p className="text-[13px] font-medium text-slate-800">{h.action}</p>
                {h.note && <p className="text-[12.5px] text-slate-600">{h.note}</p>}
                <p className="text-[11.5px] text-slate-400">{h.by} · {fmtDateTime(h.at)}</p>
              </div>
            </li>
          ))}
        </ol>
        <label className={`${label} mt-5`}>Nhận xét khi gửi duyệt</label>
        <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={3} className={`${field} resize-none`} />
      </RightDrawer>

      <ConfirmDialog open={confirmSubmit} title="Gửi duyệt nội dung"
        description="Nội dung sẽ chuyển sang trạng thái Chờ duyệt và gửi thông báo tới cán bộ phường."
        confirmLabel="Gửi duyệt" onCancel={() => setConfirmSubmit(false)} onConfirm={submitReview} />
    </>
  );
}

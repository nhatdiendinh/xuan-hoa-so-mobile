import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Camera, Eye, Image as ImageIcon, Save, Send, Trash2, X } from "lucide-react";
import { MobileContributorLayout } from "../../layouts/MobileContributorLayout";
import { Card, Button, Badge, StatusBadge } from "../../components/common/ui";
import { ConfirmDialog, useToast } from "../../components/common/Overlays";
import { useAuth } from "../../services/auth";
import { pushLog, pushNotification, useTable } from "../../services/store";
import { img, CONTENT_TYPE_LABEL } from "../../data/mock";
import { slugify, toInputDate } from "../../utils/format";
import type { ContentItem, ContentType } from "../../types";

const TYPES: { value: ContentType; label: string }[] = [
  { value: "news", label: "Tin tức khu phố" },
  { value: "announcement", label: "Thông báo" },
  { value: "event", label: "Hoạt động cộng đồng" },
];

export default function MobileComposer() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, can, hoodScope } = useAuth();
  const [contents, setContents] = useTable("contents");
  const [hoods] = useTable("neighborhoods");

  const editingId = params.get("id");
  const existing = contents.find((c) => c.id === editingId) ?? null;

  const [form, setForm] = useState<ContentItem>(() =>
    existing ?? {
      id: `ct-${Date.now()}`, type: "news", title: "", slug: "", excerpt: "", body: "",
      image: "", gallery: [], hoodId: hoodScope ?? user?.hoodId ?? null,
      authorId: user?.id ?? "", status: "draft", createdAt: new Date().toISOString(),
      publishedAt: null, scheduledAt: null, startAt: null, endAt: null, place: "",
      pinned: false, featured: false, views: 0,
      history: [{ at: new Date().toISOString(), by: user?.fullName ?? "Cán bộ", action: "created" }],
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const [confirm, setConfirm] = useState<"submit" | "publish" | "delete" | null>(null);

  const set = <K extends keyof ContentItem>(k: K, v: ContentItem[K]) =>
    setForm((f) => ({ ...f, [k]: v, ...(k === "title" ? { slug: slugify(String(v)) } : {}) }));

  const addImage = () => {
    if (form.gallery.length >= 6) { toast("Tối đa 6 ảnh mỗi bài", "error"); return; }
    const url = img(form.gallery.length + 1, 600, 400);
    setForm((f) => ({ ...f, gallery: [...f.gallery, url], image: f.image || url }));
  };

  const pickFile = (files: FileList | null) => {
    if (!files?.length) return;
    const remain = 6 - form.gallery.length;
    const urls = Array.from(files).slice(0, remain).map((f) => URL.createObjectURL(f));
    setForm((f) => ({ ...f, gallery: [...f.gallery, ...urls], image: f.image || urls[0] }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Vui lòng nhập tiêu đề";
    if (!form.excerpt.trim()) e.excerpt = "Vui lòng nhập mô tả ngắn";
    if (!form.body.trim()) e.body = "Vui lòng nhập nội dung";
    if (form.type === "event" && !form.startAt) e.startAt = "Vui lòng chọn thời gian diễn ra";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const persist = (patch: Partial<ContentItem>, action: ContentItem["history"][0]["action"], msg: string) => {
    const next: ContentItem = {
      ...form, ...patch,
      history: [...form.history, { at: new Date().toISOString(), by: user?.fullName ?? "Cán bộ", action }],
    };
    setContents(existing ? contents.map((c) => (c.id === next.id ? next : c)) : [next, ...contents]);
    setForm(next);
    if (user) pushLog(user.id, msg.toLowerCase(), next.title, next.hoodId);
    toast(msg);
  };

  const field = "w-full rounded-xl border border-slate-200 px-3.5 py-3 text-[14px] outline-none focus:border-blue-500";
  const label = "block text-[12.5px] font-medium text-slate-700 mb-1.5";

  return (
    <MobileContributorLayout title={existing ? "Chỉnh sửa bài viết" : "Đăng bài mới"} showCompose={false}>
      <Card className="p-4 space-y-4">
        <div>
          <label className={label}>Loại nội dung</label>
          <select value={form.type} onChange={(e) => set("type", e.target.value as ContentType)} className={field}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className={label}>Khu phố</label>
          <select value={form.hoodId ?? ""} disabled={!!hoodScope}
            onChange={(e) => set("hoodId", e.target.value ? Number(e.target.value) : null)}
            className={`${field} disabled:bg-slate-50 disabled:text-slate-500`}>
            <option value="">Toàn phường</option>
            {hoods.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          {hoodScope && <p className="text-[11.5px] text-slate-400 mt-1">Khu phố được khoá theo phân quyền tài khoản.</p>}
        </div>

        <div>
          <label className={label}>Tiêu đề <span className="text-red-500">*</span></label>
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={field} />
          {errors.title && <p className="text-[11.5px] text-red-600 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className={label}>Mô tả ngắn <span className="text-red-500">*</span></label>
          <textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} className={`${field} resize-none`} />
          {errors.excerpt && <p className="text-[11.5px] text-red-600 mt-1">{errors.excerpt}</p>}
        </div>

        <div>
          <label className={label}>Nội dung <span className="text-red-500">*</span></label>
          <textarea value={form.body} onChange={(e) => set("body", e.target.value)} rows={8} className={`${field} resize-y leading-relaxed`} />
          {errors.body && <p className="text-[11.5px] text-red-600 mt-1">{errors.body}</p>}
        </div>

        {form.type === "event" && (
          <>
            <div>
              <label className={label}>Thời gian diễn ra <span className="text-red-500">*</span></label>
              <input type="date" value={toInputDate(form.startAt)}
                onChange={(e) => set("startAt", e.target.value ? new Date(e.target.value).toISOString() : null)} className={field} />
              {errors.startAt && <p className="text-[11.5px] text-red-600 mt-1">{errors.startAt}</p>}
            </div>
            <div>
              <label className={label}>Địa điểm</label>
              <input value={form.place ?? ""} onChange={(e) => set("place", e.target.value)} className={field} />
            </div>
          </>
        )}

        <div>
          <label className={label}>Hình ảnh (tối đa 6)</label>
          <div className="grid grid-cols-2 gap-2">
            {form.gallery.map((g, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden border border-slate-200">
                <img src={g} alt="" className="w-full h-28 object-cover" />
                <button onClick={() => setForm((f) => ({ ...f, gallery: f.gallery.filter((_, j) => j !== i), image: f.image === g ? (f.gallery[0] ?? "") : f.image }))}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/55 text-white flex items-center justify-center">
                  <X size={14} />
                </button>
                <button onClick={() => set("image", g)}
                  className={`absolute bottom-1.5 left-1.5 px-2 py-1 rounded-lg text-[10.5px] font-medium ${
                    form.image === g ? "bg-blue-600 text-white" : "bg-white/90 text-slate-700"
                  }`}>
                  {form.image === g ? "Ảnh đại diện" : "Chọn làm đại diện"}
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <label className="min-h-[48px] rounded-xl border border-dashed border-slate-300 flex items-center justify-center gap-2 text-[13px] text-slate-600">
              <ImageIcon size={16} /> Chọn ảnh
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => pickFile(e.target.files)} />
            </label>
            <label className="min-h-[48px] rounded-xl border border-dashed border-slate-300 flex items-center justify-center gap-2 text-[13px] text-slate-600">
              <Camera size={16} /> Chụp ảnh
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pickFile(e.target.files)} />
            </label>
          </div>
          <button onClick={addImage} className="mt-2 text-[12.5px] text-blue-600">Thêm ảnh mẫu từ thư viện</button>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={form.status} />
          <Badge tone="slate">{CONTENT_TYPE_LABEL[form.type]}</Badge>
        </div>
      </Card>

      {preview && (
        <Card className="p-4 space-y-2">
          <p className="text-[12.5px] font-semibold text-slate-500">Xem trước bài viết</p>
          {form.image && <img src={form.image} alt="" className="w-full h-40 rounded-xl object-cover" />}
          <h2 className="text-[17px] font-semibold text-slate-900 leading-snug">{form.title || "(Chưa có tiêu đề)"}</h2>
          <p className="text-[13px] text-slate-600">{form.excerpt}</p>
          {form.body.split("\n").filter(Boolean).map((p, i) => (
            <p key={i} className="text-[13.5px] text-slate-700 leading-relaxed">{p}</p>
          ))}
        </Card>
      )}

      {/* Thanh hành động cố định, không che nội dung nhờ padding-bottom của layout */}
      <div className="fixed bottom-[56px] inset-x-0 z-30 bg-white border-t border-slate-200 px-4 py-2.5 flex gap-2">
        <Button variant="secondary" size="sm" icon={<Eye size={15} />} onClick={() => setPreview((v) => !v)} className="min-h-[44px] flex-1">
          {preview ? "Ẩn" : "Xem trước"}
        </Button>
        <Button variant="secondary" size="sm" icon={<Save size={15} />} className="min-h-[44px] flex-1"
          onClick={() => { if (validate()) { persist({ status: "draft" }, "updated", "Đã lưu nháp"); } }}>
          Lưu nháp
        </Button>
        {can("content", "publish") ? (
          <Button size="sm" icon={<Send size={15} />} className="min-h-[44px] flex-1" onClick={() => { if (validate()) setConfirm("publish"); }}>
            Đăng ngay
          </Button>
        ) : (
          <Button size="sm" icon={<Send size={15} />} className="min-h-[44px] flex-1" onClick={() => { if (validate()) setConfirm("submit"); }}>
            Gửi duyệt
          </Button>
        )}
        {existing && (
          <Button variant="danger" size="sm" className="min-h-[44px] px-3" onClick={() => setConfirm("delete")}>
            <Trash2 size={15} />
          </Button>
        )}
      </div>

      <ConfirmDialog open={confirm === "submit"} title="Gửi duyệt bài viết"
        description="Bài viết sẽ chuyển sang trạng thái Chờ duyệt và gửi tới cán bộ phường."
        confirmLabel="Gửi duyệt" onCancel={() => setConfirm(null)}
        onConfirm={() => {
          persist({ status: "pending" }, "submitted", "Đã gửi duyệt bài viết");
          pushNotification({ kind: "content", title: "Nội dung mới chờ duyệt", description: `${form.title} vừa được gửi duyệt.`, link: "/dashboard/content/news?status=pending", hoodId: form.hoodId });
          setConfirm(null); navigate("/mobile/content");
        }} />

      <ConfirmDialog open={confirm === "publish"} title="Đăng bài ngay"
        description="Bài viết sẽ hiển thị công khai trên trang Xuân Hoà Số."
        confirmLabel="Đăng ngay" onCancel={() => setConfirm(null)}
        onConfirm={() => {
          persist({ status: "published", publishedAt: new Date().toISOString() }, "published", "Đã đăng bài viết");
          setConfirm(null); navigate("/mobile/content");
        }} />

      <ConfirmDialog open={confirm === "delete"} title="Xoá bài viết" description="Bài viết sẽ bị xoá khỏi hệ thống."
        confirmLabel="Xoá" tone="danger" onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setContents(contents.filter((c) => c.id !== form.id));
          setConfirm(null); toast("Đã xoá bài viết"); navigate("/mobile/content");
        }} />
    </MobileContributorLayout>
  );
}

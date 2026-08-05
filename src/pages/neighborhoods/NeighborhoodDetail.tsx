import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardHeader, Badge, Button, StatusBadge, ErrorState, EmptyState } from "../../components/common/ui";
import { Tabs } from "../../components/common/Filters";
import { useToast } from "../../components/common/Overlays";
import { Allow } from "../../components/common/Guards";
import { useAuth } from "../../services/auth";
import { useTable } from "../../services/store";
import { fmtDate, fmtDateTime, WEEKDAY_LABEL } from "../../utils/format";
import { CONTENT_TYPE_LABEL } from "../../data/mock";

const TABS = [
  { key: "overview", label: "Tổng quan" },
  { key: "info", label: "Thông tin khu phố" },
  { key: "board", label: "Ban điều hành" },
  { key: "news", label: "Tin tức" },
  { key: "announcements", label: "Thông báo" },
  { key: "events", label: "Lịch hoạt động" },
  { key: "feedback", label: "Phản ánh" },
  { key: "waste", label: "Lịch thu gom rác" },
  { key: "media", label: "Thư viện ảnh" },
  { key: "display", label: "Cấu hình hiển thị" },
];

export default function NeighborhoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { hoodScope } = useAuth();
  const [hoods, setHoods] = useTable("neighborhoods");
  const [contents] = useTable("contents");
  const [feedbacks] = useTable("feedbacks");
  const [waste] = useTable("waste");
  const [media] = useTable("media");
  const [users] = useTable("users");
  const [tab, setTab] = useState("overview");

  const hood = hoods.find((h) => h.id === Number(id));
  if (!hood) return <ErrorState message="Không tìm thấy khu phố." />;
  if (hoodScope && hood.id !== hoodScope) return <ErrorState message="Bạn chỉ được xem dữ liệu khu phố mình phụ trách." />;

  const [draft, setDraft] = useState(hood);
  const hoodContents = (type: string) => contents.filter((c) => c.hoodId === hood.id && c.type === type);
  const hoodFeedbacks = feedbacks.filter((f) => f.hoodId === hood.id);

  const saveInfo = () => {
    setHoods(hoods.map((h) => (h.id === hood.id ? { ...draft, lastUpdate: new Date().toISOString() } : h)));
    toast("Đã lưu thông tin khu phố");
  };

  const field = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-blue-500";
  const label = "block text-[12.5px] font-medium text-slate-700 mb-1.5";

  const ContentList = ({ type }: { type: string }) => {
    const rows = hoodContents(type);
    if (!rows.length) return <EmptyState title={`Chưa có ${CONTENT_TYPE_LABEL[type]?.toLowerCase() ?? "nội dung"}`} />;
    return (
      <div className="divide-y divide-slate-100">
        {rows.map((c) => (
          <button key={c.id} onClick={() => navigate(`/dashboard/content/${c.id}/edit`)}
            className="w-full flex gap-3 px-5 py-3 text-left hover:bg-slate-50">
            <img src={c.image} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-slate-800 line-clamp-2">{c.title}</p>
              <p className="text-[11.5px] text-slate-500 mt-1">{fmtDate(c.createdAt)} · {c.views} lượt xem</p>
            </div>
            <StatusBadge status={c.status} />
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate("/dashboard/neighborhoods")}>Quay lại</Button>
        <h2 className="text-[16px] font-semibold text-slate-900">{hood.name}</h2>
        <Badge tone={hood.active ? "green" : "slate"}>{hood.active ? "Đang hoạt động" : "Tạm ngưng"}</Badge>
      </div>

      <Card>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "overview" && (
          <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              ["Dân số", `${hood.population.toLocaleString()} người`],
              ["Hộ gia đình", `${hood.households} hộ`],
              ["Phản ánh đang mở", String(hoodFeedbacks.filter((f) => f.status !== "completed").length)],
              ["Tin đã xuất bản", String(contents.filter((c) => c.hoodId === hood.id && c.status === "published").length)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="text-[20px] font-semibold text-slate-900 leading-none">{v}</p>
                <p className="text-[12px] text-slate-500 mt-1.5">{k}</p>
              </div>
            ))}
            <div className="col-span-2 lg:col-span-4">
              <img src={hood.image} alt="" className="w-full h-48 rounded-xl object-cover" />
              <p className="text-[13.5px] text-slate-700 leading-relaxed mt-3">{hood.intro}</p>
              <p className="text-[12px] text-slate-400 mt-2">Cập nhật gần nhất: {fmtDateTime(hood.lastUpdate)}</p>
            </div>
          </div>
        )}

        {tab === "info" && (
          <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-3xl">
            <div>
              <label className={label}>Tên khu phố</label>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className={field} />
            </div>
            <div>
              <label className={label}>Điện thoại liên hệ công khai</label>
              <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className={field} />
            </div>
            <div className="lg:col-span-2">
              <label className={label}>Ảnh đại diện</label>
              <input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} className={field} />
            </div>
            <div className="lg:col-span-2">
              <label className={label}>Giới thiệu ngắn</label>
              <textarea value={draft.intro} onChange={(e) => setDraft({ ...draft, intro: e.target.value })} rows={4} className={`${field} resize-none`} />
            </div>
            <div className="lg:col-span-2">
              <Allow module="neighborhoods" action="edit">
                <Button icon={<Save size={15} />} onClick={saveInfo}>Lưu thông tin</Button>
              </Allow>
            </div>
          </div>
        )}

        {tab === "board" && (
          <div className="p-5 space-y-2">
            {hood.board.map((m, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
                <span className="w-9 h-9 rounded-full bg-blue-600 text-white text-[13px] font-semibold flex items-center justify-center">
                  {m.name.split(" ").pop()?.[0]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13.5px] font-medium text-slate-800">{m.name}</p>
                  <p className="text-[12px] text-slate-500">{m.role}</p>
                </div>
                <span className="text-[13px] text-blue-600">{m.phone}</span>
              </div>
            ))}
            <p className="text-[12px] text-slate-400 pt-2">
              Tài khoản quản trị khu phố: {users.find((u) => u.hoodId === hood.id)?.username ?? "chưa cấp"}
            </p>
          </div>
        )}

        {tab === "news" && <ContentList type="news" />}
        {tab === "announcements" && <ContentList type="announcement" />}
        {tab === "events" && <ContentList type="event" />}

        {tab === "feedback" && (
          hoodFeedbacks.length === 0 ? <EmptyState title="Chưa có phản ánh" /> : (
            <div className="divide-y divide-slate-100">
              {hoodFeedbacks.map((f) => (
                <button key={f.id} onClick={() => navigate(`/dashboard/feedback/${f.id}`)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-50">
                  <span className="font-mono text-[12px] text-slate-500 w-16 shrink-0">{f.code}</span>
                  <span className="flex-1 min-w-0 text-[13px] text-slate-800 line-clamp-1">{f.summary}</span>
                  <span className="text-[12px] text-slate-400 hidden sm:block">{fmtDate(f.createdAt)}</span>
                  <StatusBadge status={f.status} kind="feedback" />
                </button>
              ))}
            </div>
          )
        )}

        {tab === "waste" && (
          waste.filter((w) => w.hoodId === hood.id).length === 0 ? <EmptyState title="Chưa có lịch thu gom rác" /> : (
            <div className="divide-y divide-slate-100">
              {waste.filter((w) => w.hoodId === hood.id).map((w) => (
                <div key={w.id} className="px-5 py-3">
                  <p className="text-[13.5px] font-medium text-slate-800">{w.route}</p>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">
                    {w.weekdays.map((d) => WEEKDAY_LABEL[d]).join(", ")} · {w.timeRange} · {w.wasteType}
                  </p>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "media" && (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {media.filter((m) => m.hoodId === hood.id).map((m) => (
              <img key={m.id} src={m.url} alt={m.name} className="w-full h-24 rounded-lg object-cover border border-slate-100" />
            ))}
            {media.filter((m) => m.hoodId === hood.id).length === 0 && (
              <div className="col-span-full"><EmptyState title="Chưa có ảnh cho khu phố này" /></div>
            )}
          </div>
        )}

        {tab === "display" && (
          <div className="p-5 space-y-3 max-w-2xl">
            <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3">
              <span className="text-[13px] text-slate-700">Hiển thị khu phố trên trang công khai</span>
              <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} className="w-4 h-4" />
            </label>
            <div>
              <label className={label}>Tin nổi bật của khu phố</label>
              <select className={field} defaultValue="">
                <option value="">-- Chọn tin nổi bật --</option>
                {hoodContents("news").map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <Allow module="neighborhoods" action="edit">
              <Button icon={<Save size={15} />} onClick={saveInfo}>Lưu cấu hình hiển thị</Button>
            </Allow>
          </div>
        )}
      </Card>
    </>
  );
}

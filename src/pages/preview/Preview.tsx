import { useState } from "react";
import { Monitor, RefreshCw, Smartphone, Tablet, Upload, Pencil } from "lucide-react";
import { useNavigate } from "react-router";
import { Card, CardHeader, Button } from "../../components/common/ui";
import { ConfirmDialog, useToast } from "../../components/common/Overlays";
import { PublicPagePreview } from "../../components/preview/PublicPagePreview";
import { useTable } from "../../services/store";
import { Allow } from "../../components/common/Guards";

const DEVICES = [
  { key: "desktop", label: "Máy tính", width: 1440, Icon: Monitor },
  { key: "tablet", label: "Máy tính bảng", width: 768, Icon: Tablet },
  { key: "mobile", label: "Điện thoại", width: 390, Icon: Smartphone },
];

export default function Preview() {
  const toast = useToast();
  const navigate = useNavigate();
  const [config, setConfig] = useTable("homeConfig");
  const [contents] = useTable("contents");
  const [utilities] = useTable("utilities");
  const [hoods] = useTable("neighborhoods");
  const [device, setDevice] = useState("mobile");
  const [nonce, setNonce] = useState(0);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const current = DEVICES.find((d) => d.key === device)!;
  const scale = device === "desktop" ? 0.62 : device === "tablet" ? 0.85 : 1;

  const byType = (t: string) => contents.filter((c) => c.type === t);
  const label = "block text-[12.5px] font-medium text-slate-700 mb-1.5";
  const field = "w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500";

  return (
    <>
      <Card>
        <CardHeader title="Xem trước trang người dân"
          action={
            <div className="flex flex-wrap gap-2">
              {DEVICES.map(({ key, label: l, Icon }) => (
                <button key={key} onClick={() => setDevice(key)}
                  className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border text-[12.5px] ${
                    device === key ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-600"
                  }`}>
                  <Icon size={14} /> {l}
                </button>
              ))}
              <Button size="sm" variant="secondary" icon={<RefreshCw size={14} />} onClick={() => setNonce((n) => n + 1)}>Làm mới</Button>
              <Button size="sm" variant="secondary" icon={<Pencil size={14} />} onClick={() => navigate("/dashboard/content/news")}>Quay lại chỉnh sửa</Button>
              <Allow module="preview" action="publish">
                <Button size="sm" icon={<Upload size={14} />} onClick={() => setConfirmPublish(true)}>Cập nhật trang</Button>
              </Allow>
            </div>
          } />
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        <Card className="xl:col-span-3 p-5 overflow-x-auto bg-slate-100">
          <div className="mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
            style={{ width: current.width * scale, maxWidth: "100%" }}>
            <div key={nonce} style={{ width: current.width, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <PublicPagePreview config={config} width={current.width} />
            </div>
          </div>
          <p className="text-center text-[11.5px] text-slate-500 mt-3">
            Khung mô phỏng {current.label} - {current.width}px
          </p>
        </Card>

        <Card className="h-fit">
          <CardHeader title="Điều khiển nội dung trang" />
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className={label}>Banner đang hiển thị</label>
              <select className={field} value={config.bannerIds[0] ?? ""}
                onChange={(e) => setConfig({ ...config, bannerIds: [e.target.value, ...config.bannerIds.filter((b) => b !== e.target.value)] })}>
                {byType("banner").map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Thông báo ghim</label>
              <select className={field} value={config.pinnedAnnouncementId ?? ""}
                onChange={(e) => setConfig({ ...config, pinnedAnnouncementId: e.target.value || null })}>
                <option value="">Không ghim</option>
                {byType("announcement").map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Tin nổi bật</label>
              <select multiple className={`${field} h-24`} value={config.featuredNewsIds}
                onChange={(e) => setConfig({ ...config, featuredNewsIds: Array.from(e.target.selectedOptions).map((o) => o.value) })}>
                {byType("news").map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Bài học số nổi bật</label>
              <select multiple className={`${field} h-24`} value={config.literacyIds}
                onChange={(e) => setConfig({ ...config, literacyIds: Array.from(e.target.selectedOptions).map((o) => o.value) })}>
                {byType("literacy").map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Tin cộng đồng</label>
              <select multiple className={`${field} h-24`} value={config.communityNewsIds}
                onChange={(e) => setConfig({ ...config, communityNewsIds: Array.from(e.target.selectedOptions).map((o) => o.value) })}>
                {byType("news").map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Tiện ích trang chủ</label>
              <select multiple className={`${field} h-24`} value={config.utilityIds}
                onChange={(e) => setConfig({ ...config, utilityIds: Array.from(e.target.selectedOptions).map((o) => o.value) })}>
                {utilities.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Khu phố đại diện</label>
              <select multiple className={`${field} h-24`} value={config.hoodIds.map(String)}
                onChange={(e) => setConfig({ ...config, hoodIds: Array.from(e.target.selectedOptions).map((o) => Number(o.value)) })}>
                {hoods.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <p className={label}>Bật / tắt khu vực</p>
              <div className="space-y-1.5">
                {Object.entries(config.sections).map(([key, on]) => (
                  <label key={key} className="flex items-center justify-between gap-2 text-[12.5px] text-slate-700">
                    <span>{({
                      banner: "Banner đầu trang", today: "Thông tin cần biết hôm nay", utilities: "Tiện ích người dân",
                      neighborhoods: "Khám phá khu phố", literacy: "Bình dân học vụ số", news: "Tin tức cộng đồng",
                      about: "Giới thiệu Xuân Hoà",
                    } as Record<string, string>)[key] ?? key}</span>
                    <input type="checkbox" checked={on} className="w-4 h-4"
                      onChange={(e) => setConfig({ ...config, sections: { ...config.sections, [key]: e.target.checked } })} />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <ConfirmDialog open={confirmPublish} title="Cập nhật trang công khai"
        description="Cấu hình hiện tại sẽ được áp dụng cho trang Xuân Hoà Số của người dân."
        confirmLabel="Cập nhật trang" onCancel={() => setConfirmPublish(false)}
        onConfirm={() => { setConfirmPublish(false); toast("Đã cập nhật trang công khai"); }} />
    </>
  );
}

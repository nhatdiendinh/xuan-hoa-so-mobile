import { useState } from "react";
import { RotateCcw, Save, Settings as SettingsIcon } from "lucide-react";
import { Card, CardHeader, Button } from "../../components/common/ui";
import { Tabs } from "../../components/common/Filters";
import { ConfirmDialog, useToast } from "../../components/common/Overlays";
import { resetDb, useTable } from "../../services/store";
import { FEEDBACK_FIELDS } from "../../data/mock";

const TABS = [
  { key: "org", label: "Thông tin đơn vị" },
  { key: "home", label: "Trang chủ" },
  { key: "feedback", label: "Phản ánh" },
  { key: "content", label: "Nội dung" },
  { key: "notify", label: "Thông báo" },
  { key: "data", label: "Dữ liệu" },
];

export default function Settings() {
  const toast = useToast();
  const [org, setOrg] = useTable("org");
  const [config, setConfig] = useTable("homeConfig");
  const [tab, setTab] = useState("org");
  const [draft, setDraft] = useState(org);
  const [confirmReset, setConfirmReset] = useState(false);
  const [slaDays, setSlaDays] = useState(7);
  const [maxImages, setMaxImages] = useState(6);
  const [requireApproval, setRequireApproval] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyInApp, setNotifyInApp] = useState(true);
  const [notifyLeader, setNotifyLeader] = useState(true);

  const field = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-blue-500";
  const label = "block text-[12.5px] font-medium text-slate-700 mb-1.5";

  return (
    <>
      <Card>
        <CardHeader title="Cấu hình hệ thống" icon={<SettingsIcon size={16} className="text-slate-500" />} />
        <Tabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "org" && (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            {([
              ["name", "Tên đơn vị"], ["address", "Địa chỉ"], ["phone", "Điện thoại"], ["email", "Email"],
              ["zaloOA", "Zalo OA"], ["fanpage", "Fanpage"], ["website", "Website"], ["copyright", "Bản quyền"],
            ] as const).map(([key, l]) => (
              <div key={key}>
                <label className={label}>{l}</label>
                <input value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} className={field} />
              </div>
            ))}
            <div className="md:col-span-2">
              <Button icon={<Save size={15} />} onClick={() => { setOrg(draft); toast("Đã lưu thông tin đơn vị"); }}>Lưu thay đổi</Button>
            </div>
          </div>
        )}

        {tab === "home" && (
          <div className="p-5 space-y-3 max-w-2xl">
            <p className="text-[13px] text-slate-600">
              Chọn nội dung hiển thị chi tiết tại màn hình <span className="font-medium">Xem trước trang</span>. Tại đây cấu hình
              số lượng và thứ tự các khu vực.
            </p>
            <div>
              <label className={label}>Số tiện ích hiển thị trên trang chủ</label>
              <input type="number" min={3} max={9} value={config.utilityIds.length} readOnly className={`${field} bg-slate-50`} />
            </div>
            <div>
              <label className={label}>Số khu phố hiển thị</label>
              <input type="number" min={2} max={18} value={config.hoodIds.length} readOnly className={`${field} bg-slate-50`} />
            </div>
            <div className="space-y-1.5">
              {Object.entries(config.sections).map(([key, on]) => (
                <label key={key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-[13px] text-slate-700">
                  <span>{key}</span>
                  <input type="checkbox" checked={on} className="w-4 h-4"
                    onChange={(e) => setConfig({ ...config, sections: { ...config.sections, [key]: e.target.checked } })} />
                </label>
              ))}
            </div>
          </div>
        )}

        {tab === "feedback" && (
          <div className="p-5 space-y-4 max-w-2xl">
            <div>
              <label className={label}>Lĩnh vực phản ánh</label>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_FIELDS.map((f) => (
                  <span key={f} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-[12.5px] text-slate-600">{f}</span>
                ))}
              </div>
            </div>
            <div>
              <label className={label}>Thời hạn xử lý mặc định (ngày)</label>
              <input type="number" value={slaDays} onChange={(e) => setSlaDays(Number(e.target.value))} className={field} />
            </div>
            <div>
              <label className={label}>Cảnh báo sắp quá hạn khi còn (ngày)</label>
              <input type="number" defaultValue={2} className={field} />
            </div>
            <Button icon={<Save size={15} />} onClick={() => toast("Đã lưu cấu hình phản ánh")}>Lưu cấu hình</Button>
          </div>
        )}

        {tab === "content" && (
          <div className="p-5 space-y-4 max-w-2xl">
            <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5 text-[13px] text-slate-700">
              <span>Bắt buộc duyệt trước khi xuất bản</span>
              <input type="checkbox" checked={requireApproval} onChange={(e) => setRequireApproval(e.target.checked)} className="w-4 h-4" />
            </label>
            <div>
              <label className={label}>Giới hạn số ảnh mỗi bài</label>
              <input type="number" value={maxImages} onChange={(e) => setMaxImages(Number(e.target.value))} className={field} />
            </div>
            <div>
              <label className={label}>Từ khoá hạn chế</label>
              <textarea rows={3} defaultValue="" placeholder="Mỗi từ khoá một dòng" className={`${field} resize-none`} />
            </div>
            <Button icon={<Save size={15} />} onClick={() => toast("Đã lưu cấu hình nội dung")}>Lưu cấu hình</Button>
          </div>
        )}

        {tab === "notify" && (
          <div className="p-5 space-y-2 max-w-2xl">
            {[
              ["Gửi email cho cán bộ", notifyEmail, setNotifyEmail],
              ["Thông báo trong hệ thống", notifyInApp, setNotifyInApp],
              ["Thông báo riêng cho Trưởng khu phố", notifyLeader, setNotifyLeader],
            ].map(([l, v, set]) => (
              <label key={l as string} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5 text-[13px] text-slate-700">
                <span>{l as string}</span>
                <input type="checkbox" checked={v as boolean} onChange={(e) => (set as (b: boolean) => void)(e.target.checked)} className="w-4 h-4" />
              </label>
            ))}
            <Button icon={<Save size={15} />} onClick={() => toast("Đã lưu cấu hình thông báo")}>Lưu cấu hình</Button>
          </div>
        )}

        {tab === "data" && (
          <div className="p-5 space-y-3 max-w-2xl">
            <p className="text-[13px] text-slate-600">
              Hệ thống đang chạy trên dữ liệu mô phỏng lưu tại trình duyệt. Đặt lại sẽ khôi phục toàn bộ dữ liệu mẫu ban đầu.
            </p>
            <Button variant="danger" icon={<RotateCcw size={15} />} onClick={() => setConfirmReset(true)}>Đặt lại dữ liệu mẫu</Button>
          </div>
        )}
      </Card>

      <ConfirmDialog open={confirmReset} title="Đặt lại dữ liệu mẫu"
        description="Toàn bộ thay đổi đã lưu trên trình duyệt sẽ bị xoá và khôi phục dữ liệu mô phỏng ban đầu."
        confirmLabel="Đặt lại" tone="danger" onCancel={() => setConfirmReset(false)}
        onConfirm={() => { resetDb(); setConfirmReset(false); toast("Đã khôi phục dữ liệu mẫu"); }} />
    </>
  );
}

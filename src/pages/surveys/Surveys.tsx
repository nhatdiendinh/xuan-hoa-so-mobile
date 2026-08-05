import { useState } from "react";
import { ClipboardList, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, Badge, Button } from "../../components/common/ui";
import { DataTable, type Column } from "../../components/common/DataTable";
import { FilterBar, SearchInput, Select } from "../../components/common/Filters";
import { ConfirmDialog, RightDrawer, useToast } from "../../components/common/Overlays";
import { Allow } from "../../components/common/Guards";
import { useTable } from "../../services/store";
import { fmtDate, toInputDate } from "../../utils/format";
import type { Survey } from "../../types";

const KIND_LABEL: Record<string, string> = {
  survey: "Khảo sát ý kiến", register_event: "Đăng ký tham gia hoạt động",
  register_support: "Đăng ký hỗ trợ", form: "Biểu mẫu cộng đồng",
};

const EMPTY: Survey = {
  id: "", title: "", description: "", kind: "survey",
  openAt: new Date().toISOString(), closeAt: new Date().toISOString(),
  hoodIds: null, limit: null, responses: 0, publicResult: false, status: "draft",
  questions: [{ id: "q1", label: "Họ và tên", type: "text", required: true }],
};

export default function Surveys() {
  const toast = useToast();
  const [surveys, setSurveys] = useTable("surveys");
  const [hoods] = useTable("neighborhoods");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Survey | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const rows = surveys.filter((s) =>
    (!q || s.title.toLowerCase().includes(q.toLowerCase())) &&
    (!kind || s.kind === kind) && (!status || s.status === status)
  );

  const columns: Column<Survey>[] = [
    { key: "title", header: "Tên biểu mẫu", mobile: "title", render: (r) => <span className="font-medium text-slate-800">{r.title}</span> },
    { key: "kind", header: "Loại", mobile: "meta", render: (r) => <Badge tone="violet">{KIND_LABEL[r.kind]}</Badge> },
    { key: "open", header: "Thời gian mở", mobile: "meta", render: (r) => fmtDate(r.openAt) },
    { key: "close", header: "Thời gian đóng", mobile: "meta", render: (r) => fmtDate(r.closeAt) },
    { key: "responses", header: "Lượt tham gia", mobile: "meta", render: (r) => r.responses },
    { key: "area", header: "Khu vực", mobile: "meta", render: (r) => (r.hoodIds ? r.hoodIds.map((i) => `KP ${i}`).join(", ") : "Toàn phường") },
    {
      key: "status", header: "Trạng thái", mobile: "badge",
      render: (r) => <Badge tone={r.status === "open" ? "green" : r.status === "draft" ? "slate" : "amber"}>
        {r.status === "open" ? "Đang mở" : r.status === "draft" ? "Nháp" : "Đã đóng"}
      </Badge>,
    },
    {
      key: "act", header: "Thao tác",
      render: (r) => (
        <div className="flex gap-1">
          <Allow module="surveys" action="edit">
            <button onClick={() => setEditing(r)} className="px-2 py-1 rounded-lg text-[12px] text-blue-600 hover:bg-blue-50">Sửa</button>
          </Allow>
          <Allow module="surveys" action="delete">
            <button onClick={() => setConfirmDelete(r.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500">
              <Trash2 size={13} />
            </button>
          </Allow>
        </div>
      ),
    },
  ];

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim()) { toast("Vui lòng nhập tên biểu mẫu", "error"); return; }
    setSurveys(editing.id ? surveys.map((s) => (s.id === editing.id ? editing : s)) : [{ ...editing, id: `sv-${Date.now()}` }, ...surveys]);
    setEditing(null);
    toast("Đã lưu biểu mẫu");
  };

  const field = "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-blue-500";
  const label = "block text-[12.5px] font-medium text-slate-700 mb-1.5";

  return (
    <>
      <Card>
        <CardHeader title="Khảo sát - đăng ký" icon={<ClipboardList size={16} className="text-teal-600" />}
          action={
            <Allow module="surveys" action="create">
              <Button size="sm" icon={<Plus size={14} />} onClick={() => setEditing({ ...EMPTY })}>Tạo biểu mẫu</Button>
            </Allow>
          } />
        <FilterBar>
          <SearchInput value={q} onChange={setQ} placeholder="Tìm biểu mẫu..." />
          <Select value={kind} onChange={setKind} placeholder="Tất cả loại"
            options={Object.entries(KIND_LABEL).map(([value, label]) => ({ value, label }))} />
          <Select value={status} onChange={setStatus} placeholder="Tất cả trạng thái"
            options={[{ value: "draft", label: "Nháp" }, { value: "open", label: "Đang mở" }, { value: "closed", label: "Đã đóng" }]} />
        </FilterBar>
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} emptyTitle="Chưa có biểu mẫu" />
      </Card>

      <RightDrawer open={!!editing} title={editing?.id ? "Cập nhật biểu mẫu" : "Tạo biểu mẫu"} onClose={() => setEditing(null)}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Huỷ</Button><Button onClick={save}>Lưu biểu mẫu</Button></>}>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className={label}>Tiêu đề <span className="text-red-500">*</span></label>
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={field} />
            </div>
            <div>
              <label className={label}>Mô tả</label>
              <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className={`${field} resize-none`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Loại</label>
                <select value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value as Survey["kind"] })} className={field}>
                  {Object.entries(KIND_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Giới hạn số người</label>
                <input type="number" value={editing.limit ?? ""} onChange={(e) => setEditing({ ...editing, limit: e.target.value ? Number(e.target.value) : null })} className={field} />
              </div>
              <div>
                <label className={label}>Thời gian mở</label>
                <input type="date" value={toInputDate(editing.openAt)} onChange={(e) => setEditing({ ...editing, openAt: new Date(e.target.value).toISOString() })} className={field} />
              </div>
              <div>
                <label className={label}>Thời gian đóng</label>
                <input type="date" value={toInputDate(editing.closeAt)} onChange={(e) => setEditing({ ...editing, closeAt: new Date(e.target.value).toISOString() })} className={field} />
              </div>
            </div>
            <div>
              <label className={label}>Khu vực áp dụng</label>
              <select multiple value={(editing.hoodIds ?? []).map(String)}
                onChange={(e) => {
                  const vals = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                  setEditing({ ...editing, hoodIds: vals.length ? vals : null });
                }}
                className={`${field} h-28`}>
                {hoods.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
              <p className="text-[11.5px] text-slate-400 mt-1">Không chọn khu phố nào nghĩa là áp dụng toàn phường.</p>
            </div>
            <label className="flex items-center gap-2 text-[13px] text-slate-700">
              <input type="checkbox" checked={editing.publicResult} onChange={(e) => setEditing({ ...editing, publicResult: e.target.checked })} className="w-4 h-4" />
              Công khai kết quả cho người dân
            </label>

            <div>
              <p className={label}>Câu hỏi</p>
              <div className="space-y-2">
                {editing.questions.map((qq, i) => (
                  <div key={qq.id} className="rounded-lg border border-slate-200 p-3 space-y-2">
                    <input value={qq.label}
                      onChange={(e) => setEditing({ ...editing, questions: editing.questions.map((x, j) => j === i ? { ...x, label: e.target.value } : x) })}
                      className={field} placeholder="Nội dung câu hỏi" />
                    <div className="flex items-center gap-2">
                      <select value={qq.type}
                        onChange={(e) => setEditing({ ...editing, questions: editing.questions.map((x, j) => j === i ? { ...x, type: e.target.value as typeof x.type } : x) })}
                        className="h-9 rounded-lg border border-slate-200 px-2 text-[12.5px]">
                        <option value="text">Trả lời tự do</option>
                        <option value="single">Chọn một</option>
                        <option value="multiple">Chọn nhiều</option>
                        <option value="number">Số</option>
                      </select>
                      <label className="flex items-center gap-1.5 text-[12.5px] text-slate-600">
                        <input type="checkbox" checked={qq.required}
                          onChange={(e) => setEditing({ ...editing, questions: editing.questions.map((x, j) => j === i ? { ...x, required: e.target.checked } : x) })} />
                        Bắt buộc
                      </label>
                      <button onClick={() => setEditing({ ...editing, questions: editing.questions.filter((_, j) => j !== i) })}
                        className="ml-auto text-[12px] text-red-500 hover:underline">Xoá</button>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="secondary" className="mt-2"
                onClick={() => setEditing({ ...editing, questions: [...editing.questions, { id: `q${Date.now()}`, label: "", type: "text", required: false }] })}>
                Thêm câu hỏi
              </Button>
            </div>
          </div>
        )}
      </RightDrawer>

      <ConfirmDialog open={!!confirmDelete} title="Xoá biểu mẫu" description="Biểu mẫu và dữ liệu phản hồi sẽ bị xoá."
        confirmLabel="Xoá" tone="danger" onCancel={() => setConfirmDelete(null)}
        onConfirm={() => { setSurveys(surveys.filter((s) => s.id !== confirmDelete)); setConfirmDelete(null); toast("Đã xoá biểu mẫu"); }} />
    </>
  );
}

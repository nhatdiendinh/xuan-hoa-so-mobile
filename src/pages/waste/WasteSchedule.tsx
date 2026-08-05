import { useState } from "react";
import { CalendarDays, Copy, Download, List, Pause, Play, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, Badge, Button, EmptyState } from "../../components/common/ui";
import { DataTable, type Column } from "../../components/common/DataTable";
import { FilterBar, SearchInput, Select } from "../../components/common/Filters";
import { ConfirmDialog, RightDrawer, useToast } from "../../components/common/Overlays";
import { Allow } from "../../components/common/Guards";
import { useAuth } from "../../services/auth";
import { pushLog, useTable } from "../../services/store";
import { csvDownload, fmtDate, WEEKDAY_LABEL } from "../../utils/format";
import type { WasteSchedule as WS } from "../../types";

const EMPTY: WS = {
  id: "", hoodId: 1, route: "", weekdays: [2, 5], timeRange: "05:00 - 07:00",
  wasteType: "Rác sinh hoạt", provider: "Công ty Dịch vụ công ích", note: "",
  effectiveFrom: new Date().toISOString(), status: "active",
};

export default function WasteSchedulePage() {
  const toast = useToast();
  const { user, hoodScope } = useAuth();
  const [waste, setWaste] = useTable("waste");
  const [hoods] = useTable("neighborhoods");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [q, setQ] = useState("");
  const [hood, setHood] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<WS | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const rows = waste.filter((w) =>
    (!hoodScope || w.hoodId === hoodScope) &&
    (!q || w.route.toLowerCase().includes(q.toLowerCase())) &&
    (!hood || w.hoodId === Number(hood)) &&
    (!status || w.status === status)
  );

  const save = () => {
    if (!editing) return;
    if (!editing.route.trim()) { toast("Vui lòng nhập tuyến đường", "error"); return; }
    if (editing.id) setWaste(waste.map((w) => (w.id === editing.id ? editing : w)));
    else setWaste([{ ...editing, id: `ws-${Date.now()}` }, ...waste]);
    if (user) pushLog(user.id, "cập nhật lịch thu gom rác", editing.route, editing.hoodId);
    setEditing(null);
    toast("Đã lưu lịch thu gom rác");
  };

  const columns: Column<WS>[] = [
    { key: "hood", header: "Khu phố", mobile: "title", render: (r) => hoods.find((h) => h.id === r.hoodId)?.name ?? "-" },
    { key: "route", header: "Tuyến đường", render: (r) => r.route },
    { key: "days", header: "Ngày trong tuần", mobile: "meta", render: (r) => r.weekdays.map((d) => WEEKDAY_LABEL[d]).join(", ") },
    { key: "time", header: "Khung giờ", mobile: "meta", render: (r) => r.timeRange },
    { key: "type", header: "Loại rác", mobile: "meta", render: (r) => <Badge tone="slate">{r.wasteType}</Badge> },
    { key: "provider", header: "Đơn vị thu gom", mobile: "meta", render: (r) => r.provider },
    { key: "from", header: "Hiệu lực từ", mobile: "meta", render: (r) => fmtDate(r.effectiveFrom) },
    { key: "status", header: "Trạng thái", mobile: "badge", render: (r) => <Badge tone={r.status === "active" ? "green" : "amber"}>{r.status === "active" ? "Đang áp dụng" : "Tạm dừng"}</Badge> },
    {
      key: "act", header: "Thao tác",
      render: (r) => (
        <div className="flex gap-1">
          <Allow module="waste" action="edit">
            <button title="Sửa" onClick={() => setEditing(r)} className="px-2 py-1 rounded-lg text-[12px] text-blue-600 hover:bg-blue-50">Sửa</button>
            <button title={r.status === "active" ? "Tạm dừng" : "Kích hoạt"}
              onClick={() => { setWaste(waste.map((w) => w.id === r.id ? { ...w, status: w.status === "active" ? "paused" : "active" } : w)); toast("Đã cập nhật trạng thái lịch"); }}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
              {r.status === "active" ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button title="Sao chép" onClick={() => { setEditing({ ...r, id: "" }); }}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"><Copy size={13} /></button>
          </Allow>
          <Allow module="waste" action="delete">
            <button title="Xoá" onClick={() => setConfirmDelete(r.id)}
              className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-red-500"><Trash2 size={13} /></button>
          </Allow>
        </div>
      ),
    },
  ];

  return (
    <>
      <Card>
        <CardHeader title="Lịch thu gom rác" icon={<CalendarDays size={16} className="text-emerald-600" />}
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" icon={view === "list" ? <CalendarDays size={14} /> : <List size={14} />}
                onClick={() => setView(view === "list" ? "calendar" : "list")}>
                {view === "list" ? "Dạng lịch" : "Dạng danh sách"}
              </Button>
              <Button size="sm" variant="secondary" icon={<Download size={14} />}
                onClick={() => csvDownload("lich-thu-gom-rac.csv", [
                  ["Khu phố", "Tuyến", "Ngày", "Giờ", "Loại rác", "Đơn vị", "Trạng thái"],
                  ...rows.map((r) => [`Khu phố ${r.hoodId}`, r.route, r.weekdays.map((d) => WEEKDAY_LABEL[d]).join(" "), r.timeRange, r.wasteType, r.provider, r.status]),
                ])}>
                Xuất CSV
              </Button>
              <Allow module="waste" action="create">
                <Button size="sm" icon={<Plus size={14} />} onClick={() => setEditing({ ...EMPTY, hoodId: hoodScope ?? 1 })}>Tạo lịch</Button>
              </Allow>
            </div>
          } />
        <FilterBar>
          <SearchInput value={q} onChange={setQ} placeholder="Tìm tuyến đường..." />
          <Select value={hood} onChange={setHood} placeholder="Tất cả khu phố" options={hoods.map((h) => ({ value: String(h.id), label: h.name }))} />
          <Select value={status} onChange={setStatus} placeholder="Tất cả trạng thái"
            options={[{ value: "active", label: "Đang áp dụng" }, { value: "paused", label: "Tạm dừng" }]} />
        </FilterBar>

        {view === "list" ? (
          <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} emptyTitle="Chưa có lịch thu gom rác" />
        ) : rows.length === 0 ? (
          <EmptyState title="Chưa có lịch thu gom rác" />
        ) : (
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[2, 3, 4, 5, 6, 7, 8].map((d) => (
              <div key={d} className="rounded-xl border border-slate-100">
                <p className="px-3 py-2 text-[12.5px] font-semibold text-slate-700 bg-slate-50 rounded-t-xl">{WEEKDAY_LABEL[d]}</p>
                <div className="p-3 space-y-2">
                  {rows.filter((r) => r.weekdays.includes(d)).map((r) => (
                    <div key={r.id} className="rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-2">
                      <p className="text-[12px] font-medium text-emerald-800">Khu phố {r.hoodId}</p>
                      <p className="text-[11.5px] text-emerald-700">{r.timeRange} · {r.wasteType}</p>
                    </div>
                  ))}
                  {rows.filter((r) => r.weekdays.includes(d)).length === 0 && (
                    <p className="text-[11.5px] text-slate-400">Không có lịch</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <RightDrawer open={!!editing} title={editing?.id ? "Cập nhật lịch thu gom" : "Tạo lịch thu gom"} onClose={() => setEditing(null)}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Huỷ</Button><Button onClick={save}>Lưu lịch</Button></>}>
        {editing && (
          <div className="space-y-4">
            <div>
              <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Khu phố</label>
              <select value={editing.hoodId} disabled={!!hoodScope} onChange={(e) => setEditing({ ...editing, hoodId: Number(e.target.value) })}
                className="w-full h-10 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-blue-500 disabled:bg-slate-50">
                {hoods.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Tuyến đường / hẻm <span className="text-red-500">*</span></label>
              <input value={editing.route} onChange={(e) => setEditing({ ...editing, route: e.target.value })}
                className="w-full h-10 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Ngày trong tuần</label>
              <div className="flex flex-wrap gap-1.5">
                {[2, 3, 4, 5, 6, 7, 8].map((d) => (
                  <button key={d}
                    onClick={() => setEditing({
                      ...editing,
                      weekdays: editing.weekdays.includes(d) ? editing.weekdays.filter((x) => x !== d) : [...editing.weekdays, d].sort(),
                    })}
                    className={`px-2.5 py-1.5 rounded-lg text-[12px] border ${
                      editing.weekdays.includes(d) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"
                    }`}>
                    {WEEKDAY_LABEL[d]}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Khung giờ</label>
                <input value={editing.timeRange} onChange={(e) => setEditing({ ...editing, timeRange: e.target.value })}
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Loại rác</label>
                <select value={editing.wasteType} onChange={(e) => setEditing({ ...editing, wasteType: e.target.value })}
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-blue-500">
                  {["Rác sinh hoạt", "Rác tái chế", "Rác cồng kềnh"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Ghi chú</label>
              <textarea value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500 resize-none" />
            </div>
          </div>
        )}
      </RightDrawer>

      <ConfirmDialog open={!!confirmDelete} title="Xoá lịch thu gom" description="Lịch sẽ bị xoá khỏi hệ thống."
        confirmLabel="Xoá" tone="danger" onCancel={() => setConfirmDelete(null)}
        onConfirm={() => { setWaste(waste.filter((w) => w.id !== confirmDelete)); setConfirmDelete(null); toast("Đã xoá lịch"); }} />
    </>
  );
}

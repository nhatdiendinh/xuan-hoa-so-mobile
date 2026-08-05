import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, CheckCircle2, ClipboardCheck, MapPin, Phone, RefreshCw, Send, UserPlus, AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, StatusBadge, PriorityBadge, Badge, Button, ErrorState } from "../../components/common/ui";
import { ConfirmDialog, RightDrawer, useToast } from "../../components/common/Overlays";
import { Allow } from "../../components/common/Guards";
import { useAuth } from "../../services/auth";
import { pushLog, useTable } from "../../services/store";
import { fmtDate, fmtDateTime, slaState, daysLeft } from "../../utils/format";
import type { Feedback, FeedbackStatus } from "../../types";

export default function FeedbackDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, hoodScope } = useAuth();
  const [feedbacks, setFeedbacks] = useTable("feedbacks");
  const [users] = useTable("users");

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignee, setAssignee] = useState("");
  const [note, setNote] = useState("");
  const [progressOpen, setProgressOpen] = useState(false);
  const [progress, setProgress] = useState("");
  const [confirmDone, setConfirmDone] = useState(false);
  const [result, setResult] = useState("");

  const fb = feedbacks.find((f) => f.id === id);
  if (!fb) return <ErrorState message="Không tìm thấy phản ánh." />;
  if (hoodScope && fb.hoodId !== hoodScope) {
    return <ErrorState message="Phản ánh này không thuộc khu phố bạn phụ trách." />;
  }

  const update = (patch: Partial<Feedback>, action: string, noteText?: string) => {
    const next = feedbacks.map((f) =>
      f.id === fb.id
        ? {
            ...f, ...patch,
            timeline: [...f.timeline, { at: new Date().toISOString(), by: user?.fullName ?? "Cán bộ", action, note: noteText }],
          }
        : f
    );
    setFeedbacks(next);
    if (user) pushLog(user.id, action.toLowerCase(), fb.code, fb.hoodId);
  };

  const sla = slaState(fb.dueAt, fb.status);
  const left = daysLeft(fb.dueAt);

  const STATUS_FLOW: { key: FeedbackStatus; label: string }[] = [
    { key: "new", label: "Đã tiếp nhận" },
    { key: "assigned", label: "Đã phân công" },
    { key: "processing", label: "Đang xử lý" },
    { key: "waiting", label: "Chờ phản hồi" },
    { key: "completed", label: "Đã hoàn thành" },
  ];
  const activeIdx = Math.max(0, STATUS_FLOW.findIndex((s) => s.key === fb.status));

  return (
    <>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate("/dashboard/feedback")}>
          Quay lại
        </Button>
        <span className="font-mono text-[13px] text-slate-500">{fb.code}</span>
        <StatusBadge status={fb.status} kind="feedback" />
        <PriorityBadge priority={fb.priority} />
      </div>

      {sla !== "ok" && (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-[13px] ${
          sla === "overdue" ? "border-red-200 bg-red-50 text-red-700" : "border-orange-200 bg-orange-50 text-orange-700"
        }`}>
          <AlertTriangle size={16} className="shrink-0" />
          {sla === "overdue"
            ? `Hồ sơ đã quá hạn ${-left} ngày so với thời hạn xử lý ${fmtDate(fb.dueAt)}.`
            : `Hồ sơ sắp đến hạn xử lý, còn ${left} ngày (hạn ${fmtDate(fb.dueAt)}).`}
          {!fb.assigneeId && " Hồ sơ chưa được phân công."}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-5">
          <Card>
            <CardHeader title={fb.summary} />
            <div className="px-5 py-4 space-y-4">
              <p className="text-[13.5px] text-slate-700 leading-relaxed">{fb.content}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {fb.images.map((src, i) => (
                  <img key={i} src={src} alt="" className="w-full h-32 rounded-lg object-cover border border-slate-100" />
                ))}
              </div>
              <div className="flex items-start gap-2 text-[13px] text-slate-600">
                <MapPin size={15} className="text-blue-600 shrink-0 mt-0.5" /> {fb.address}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Tiến trình xử lý" icon={<ClipboardCheck size={16} className="text-blue-600" />} />
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-2 mb-5">
                {STATUS_FLOW.map((s, i) => (
                  <span key={s.key}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium border ${
                      i <= activeIdx ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-400 border-slate-200"
                    }`}>
                    {s.label}
                  </span>
                ))}
              </div>
              <ol className="space-y-4">
                {fb.timeline.map((t, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1 w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-slate-800">{t.action}</p>
                      {t.note && <p className="text-[12.5px] text-slate-600 mt-0.5">{t.note}</p>}
                      <p className="text-[11.5px] text-slate-400 mt-0.5">{t.by} · {fmtDateTime(t.at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Thông tin hồ sơ" />
            <dl className="px-5 py-4 space-y-3 text-[13px]">
              {[
                ["Lĩnh vực", fb.field],
                ["Khu phố", `Khu phố ${fb.hoodId}`],
                ["Tiếp nhận", fmtDateTime(fb.createdAt)],
                ["Hạn xử lý", fmtDate(fb.dueAt)],
                ["Đơn vị xử lý", fb.unit ?? "Chưa phân công"],
                ["Người phụ trách", users.find((u) => u.id === fb.assigneeId)?.fullName ?? "Chưa phân công"],
              ].map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-slate-800 font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Allow module="feedback" action="edit">
            <Card>
              <CardHeader title="Người gửi" />
              <div className="px-5 py-4 space-y-2 text-[13px]">
                <p className="font-medium text-slate-800">{fb.senderName}</p>
                <a href={`tel:${fb.senderPhone}`} className="flex items-center gap-2 text-blue-600">
                  <Phone size={14} /> {fb.senderPhone}
                </a>
                <p className="text-slate-500 leading-snug">{fb.address}</p>
              </div>
            </Card>
          </Allow>

          <Allow module="feedback" action="edit">
            <Card>
              <CardHeader title="Thao tác" />
              <div className="px-5 py-4 flex flex-col gap-2">
                {fb.status === "new" && (
                  <Button icon={<CheckCircle2 size={15} />}
                    onClick={() => { update({ status: "assigned" }, "Tiếp nhận hồ sơ"); toast("Đã tiếp nhận hồ sơ"); }}>
                    Tiếp nhận
                  </Button>
                )}
                <Button variant="secondary" icon={<UserPlus size={15} />} onClick={() => setAssignOpen(true)}>
                  Phân công / chuyển xử lý
                </Button>
                <Button variant="secondary" icon={<Send size={15} />} onClick={() => setProgressOpen(true)}>
                  Cập nhật tiến độ
                </Button>
                <Button variant="secondary"
                  onClick={() => { update({ status: "waiting" }, "Yêu cầu người dân bổ sung thông tin"); toast("Đã gửi yêu cầu bổ sung", "info"); }}>
                  Yêu cầu bổ sung
                </Button>
                {fb.status !== "completed" ? (
                  <Button icon={<CheckCircle2 size={15} />} onClick={() => setConfirmDone(true)}>Hoàn thành</Button>
                ) : (
                  <Button variant="secondary" icon={<RefreshCw size={15} />}
                    onClick={() => { update({ status: "reopened" }, "Mở lại hồ sơ"); toast("Đã mở lại hồ sơ", "info"); }}>
                    Mở lại hồ sơ
                  </Button>
                )}
              </div>
            </Card>
          </Allow>

          {fb.result && (
            <Card>
              <CardHeader title="Kết quả xử lý" />
              <p className="px-5 py-4 text-[13px] text-slate-700 leading-relaxed">{fb.result}</p>
            </Card>
          )}
        </div>
      </div>

      <RightDrawer open={assignOpen} title="Phân công xử lý" onClose={() => setAssignOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setAssignOpen(false)}>Huỷ</Button>
            <Button disabled={!assignee}
              onClick={() => {
                const u = users.find((x) => x.id === assignee);
                update({ assigneeId: assignee, unit: u?.unit ?? null, status: "assigned" }, `Phân công cho ${u?.fullName}`, note);
                setAssignOpen(false); setNote("");
                toast("Đã phân công xử lý");
              }}>
              Xác nhận phân công
            </Button>
          </>
        }>
        <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Cán bộ xử lý <span className="text-red-500">*</span></label>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)}
          className="w-full h-10 rounded-lg border border-slate-200 px-3 text-[13px] outline-none focus:border-blue-500">
          <option value="">-- Chọn cán bộ --</option>
          {users.filter((u) => u.status === "active").map((u) => (
            <option key={u.id} value={u.id}>{u.fullName} - {u.unit}</option>
          ))}
        </select>
        <label className="block text-[12.5px] font-medium text-slate-700 mt-4 mb-1.5">Ghi chú phân công</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500 resize-none"
          placeholder="Nội dung yêu cầu cán bộ xử lý..." />
      </RightDrawer>

      <RightDrawer open={progressOpen} title="Cập nhật tiến độ" onClose={() => setProgressOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setProgressOpen(false)}>Huỷ</Button>
            <Button disabled={!progress.trim()}
              onClick={() => {
                update({ status: "processing" }, "Cập nhật tiến độ xử lý", progress);
                setProgress(""); setProgressOpen(false);
                toast("Đã cập nhật tiến độ");
              }}>
              Lưu cập nhật
            </Button>
          </>
        }>
        <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Nội dung tiến độ <span className="text-red-500">*</span></label>
        <textarea value={progress} onChange={(e) => setProgress(e.target.value)} rows={5}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-blue-500 resize-none"
          placeholder="Mô tả công việc đã thực hiện..." />
      </RightDrawer>

      <ConfirmDialog open={confirmDone} title="Xác nhận hoàn thành xử lý"
        description="Hồ sơ sẽ chuyển sang trạng thái Hoàn thành và gửi kết quả đến người dân."
        confirmLabel="Hoàn thành"
        onCancel={() => setConfirmDone(false)}
        onConfirm={() => {
          update({ status: "completed", result: result || "Đã xử lý xong và phản hồi người dân." }, "Hoàn thành xử lý", result);
          setConfirmDone(false); setResult("");
          toast("Đã hoàn thành hồ sơ");
        }} />
    </>
  );
}

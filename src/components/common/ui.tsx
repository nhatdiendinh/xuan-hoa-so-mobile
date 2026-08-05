import { type ReactNode } from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";

// ─── Thẻ nội dung ────────────────────────────────────────────────────────────
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, icon, action }: { title: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <h2 className="text-[15px] font-semibold text-slate-900 truncate">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ─── Badge trạng thái ────────────────────────────────────────────────────────
const TONES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
};

export function Badge({ tone = "slate", children }: { tone?: keyof typeof TONES | string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${TONES[tone] ?? TONES.slate}`}>
      {children}
    </span>
  );
}

const CONTENT_STATUS: Record<string, { label: string; tone: string }> = {
  draft: { label: "Nháp", tone: "slate" },
  pending: { label: "Chờ duyệt", tone: "violet" },
  needs_revision: { label: "Cần chỉnh sửa", tone: "amber" },
  approved: { label: "Đã duyệt", tone: "blue" },
  scheduled: { label: "Đã lên lịch", tone: "teal" },
  published: { label: "Đã xuất bản", tone: "green" },
  hidden: { label: "Đã ẩn", tone: "slate" },
};

const FEEDBACK_STATUS: Record<string, { label: string; tone: string }> = {
  new: { label: "Mới tiếp nhận", tone: "blue" },
  assigned: { label: "Đã phân công", tone: "violet" },
  processing: { label: "Đang xử lý", tone: "amber" },
  waiting: { label: "Chờ bổ sung", tone: "slate" },
  completed: { label: "Hoàn thành", tone: "green" },
  reopened: { label: "Mở lại", tone: "red" },
};

export function StatusBadge({ status, kind = "content" }: { status: string; kind?: "content" | "feedback" }) {
  const map = kind === "feedback" ? FEEDBACK_STATUS : CONTENT_STATUS;
  const s = map[status] ?? { label: status, tone: "slate" };
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export const contentStatusLabel = (s: string) => CONTENT_STATUS[s]?.label ?? s;
export const feedbackStatusLabel = (s: string) => FEEDBACK_STATUS[s]?.label ?? s;

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { label: string; tone: string }> = {
    urgent: { label: "Khẩn", tone: "red" },
    high: { label: "Ưu tiên", tone: "amber" },
    normal: { label: "Bình thường", tone: "slate" },
  };
  const p = map[priority] ?? map.normal;
  return <Badge tone={p.tone}>{p.label}</Badge>;
}

// ─── Trạng thái rỗng / tải / lỗi ─────────────────────────────────────────────
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 px-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
        <Inbox size={22} className="text-slate-400" />
      </div>
      <p className="text-[14px] font-semibold text-slate-700">{title}</p>
      {description && <p className="text-[12.5px] text-slate-500 max-w-md">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
      <AlertCircle size={16} className="shrink-0" /> {message}
    </div>
  );
}

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="p-5 space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
      ))}
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-slate-400 text-[13px]">
      <Loader2 size={16} className="animate-spin" /> {label ?? "Đang tải..."}
    </div>
  );
}

// ─── Nút ─────────────────────────────────────────────────────────────────────
type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
};

export function Button({
  children, onClick, variant = "primary", size = "md", icon, disabled, type = "button", className = "",
}: BtnProps) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
    secondary: "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent",
    danger: "bg-red-600 text-white hover:bg-red-700 border-red-600",
  };
  const sizes = { sm: "px-2.5 py-1.5 text-[12px] gap-1", md: "px-3.5 py-2 text-[13px] gap-1.5" };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg border font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon}{children}
    </button>
  );
}

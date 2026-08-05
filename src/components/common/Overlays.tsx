import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

// ─── Toast ───────────────────────────────────────────────────────────────────
type Toast = { id: number; message: string; tone: "success" | "info" | "error" };
const ToastCtx = createContext<(message: string, tone?: Toast["tone"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setItems((p) => [...p, { id, message, tone }]);
    setTimeout(() => setItems((p) => p.filter((t) => t.id !== id)), 3200);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-[calc(100vw-40px)]">
        {items.map((t) => (
          <div key={t.id}
            className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-[13px] shadow-lg bg-white ${
              t.tone === "error" ? "border-red-200 text-red-700" : t.tone === "info" ? "border-blue-200 text-blue-700" : "border-emerald-200 text-emerald-700"
            }`}>
            {t.tone === "error" ? <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              : t.tone === "info" ? <Info size={15} className="mt-0.5 shrink-0" />
              : <CheckCircle2 size={15} className="mt-0.5 shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ─── Hộp xác nhận ────────────────────────────────────────────────────────────
export function ConfirmDialog({
  open, title, description, confirmLabel = "Xác nhận", tone = "primary", onConfirm, onCancel,
}: {
  open: boolean; title: string; description?: string; confirmLabel?: string;
  tone?: "primary" | "danger"; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] bg-slate-900/40 flex items-center justify-center p-4" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5">
        <h3 className="text-[16px] font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-2 text-[13px] text-slate-600 leading-relaxed">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel}
            className="px-3.5 py-2 rounded-lg border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50">
            Huỷ
          </button>
          <button onClick={onConfirm}
            className={`px-3.5 py-2 rounded-lg text-[13px] font-medium text-white ${tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Drawer bên phải (mobile: bottom sheet) ──────────────────────────────────
export function RightDrawer({
  open, title, onClose, children, footer, width = "max-w-lg",
}: {
  open: boolean; title: string; onClose: () => void;
  children: ReactNode; footer?: ReactNode; width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[95] bg-slate-900/40 flex sm:justify-end items-end sm:items-stretch" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full ${width} sm:h-full rounded-t-2xl sm:rounded-none flex flex-col max-h-[92vh] sm:max-h-none`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

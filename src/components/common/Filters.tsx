import { Search, X } from "lucide-react";
import type { ReactNode } from "react";

export function SearchInput({ value, onChange, placeholder = "Tìm kiếm..." }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="relative flex-1 min-w-[180px]">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 bg-white text-[13px] outline-none focus:border-blue-500 transition-colors" />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function Select({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-blue-500 min-w-[140px]">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function DateRange({ from, to, onFrom, onTo }: {
  from: string; to: string; onFrom: (v: string) => void; onTo: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <input type="date" value={from} onChange={(e) => onFrom(e.target.value)}
        className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-[12.5px] outline-none focus:border-blue-500" />
      <span className="text-slate-400 text-[12px]">đến</span>
      <input type="date" value={to} onChange={(e) => onTo(e.target.value)}
        className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-[12.5px] outline-none focus:border-blue-500" />
    </div>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 px-5 py-3.5 border-b border-slate-100">{children}</div>;
}

export function Tabs({ tabs, active, onChange }: {
  tabs: { key: string; label: string; count?: number }[];
  active: string; onChange: (k: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto px-3 pt-3 border-b border-slate-100" style={{ scrollbarWidth: "none" }}>
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={`whitespace-nowrap rounded-t-lg px-3.5 py-2 text-[13px] font-medium border-b-2 transition-colors ${
            active === t.key
              ? "border-blue-600 text-blue-700 bg-blue-50/60"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}>
          {t.label}
          {typeof t.count === "number" && (
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] ${active === t.key ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

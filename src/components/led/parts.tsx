import { useEffect, useRef, useState, type ReactNode } from "react";

// ─── Panel kính mờ dùng chung cho toàn bộ màn hình LED ───────────────────────
export function Panel({ title, subtitle, right, active, children, className = "" }: {
  title?: string; subtitle?: string; right?: ReactNode; active?: boolean;
  children: ReactNode; className?: string;
}) {
  return (
    <section
      className={`relative flex flex-col min-h-0 overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-500 ${
        active ? "border-blue-400 bg-blue-50/70 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]" : "border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      } ${className}`}>
      {title && (
        <header className="flex items-end justify-between gap-4 px-6 pt-4 pb-3 shrink-0">
          <div className="min-w-0">
            <h2 className="text-[26px] font-semibold text-slate-900 leading-tight tracking-wide">{title}</h2>
            {subtitle && <p className="text-[18px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      <div className="flex-1 min-h-0 overflow-hidden px-6 pb-5 flex flex-col">{children}</div>
    </section>
  );
}

// ─── Số đếm tăng dần (count-up, easeOutCubic) ───────────────────────────────
export function CountUp({ value, decimals = 0, duration = 1000 }: {
  value: number; decimals?: number; duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <>{display.toLocaleString("vi-VN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

// ─── Sparkline nhỏ trong thẻ KPI ────────────────────────────────────────────
export function Sparkline({ data, color = "#2563EB", width = 150, height = 34 }: {
  data: number[]; color?: string; width?: number; height?: number;
}) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / span) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={2.5}
        strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
      <circle cx={width} cy={pts[pts.length - 1].split(",")[1]} r={3.5} fill={color} />
    </svg>
  );
}

// ─── Gauge bán nguyệt ───────────────────────────────────────────────────────
export function Gauge({ value, label, color = "#059669", size = 210 }: {
  value: number; label: string; color?: string; size?: number;
}) {
  const r = size / 2 - 16;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - value / 100);
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size / 2 + 12}>
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#E2E8F0" strokeWidth={16} strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth={16} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }} />
        <text x={cx} y={cy - 8} textAnchor="middle" className="fill-slate-900" style={{ fontSize: 40, fontWeight: 700 }}>
          {value.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
        </text>
      </svg>
      <p className="text-[18px] text-slate-500 -mt-1">{label}</p>
    </div>
  );
}

// ─── Vòng tròn tỷ lệ (donut đơn) ────────────────────────────────────────────
export function Ring({ value, label, color = "#2563EB", size = 150 }: {
  value: number; label: string; color?: string; size?: number;
}) {
  const r = size / 2 - 12;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={12} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)}
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }} />
      </svg>
      <p className="-mt-[92px] text-[30px] font-bold text-slate-900">{value.toFixed(1)}%</p>
      <p className="mt-[56px] text-[17px] text-slate-500 text-center leading-tight">{label}</p>
    </div>
  );
}

/** Màu theo điểm hiệu quả khu phố */
export function scoreColor(score: number) {
  if (score >= 85) return "#059669";
  if (score >= 80) return "#2563EB";
  if (score >= 70) return "#EA580C";
  return "#DC2626";
}

import { scoreColor } from "./parts";

interface Hood {
  code: string; users: number; feedback: number; overdue: number;
  onTime: number; events: number; survey: number; score: number; status: string;
}

/** Bản đồ điều hành khu phố dạng sơ đồ khối, tô màu theo điểm hiệu quả */
export function WardMap({ hoods, highlight }: { hoods: Hood[]; highlight: string | null }) {
  const active = hoods.find((h) => h.code === highlight) ?? null;

  return (
    <div className="w-full h-full flex gap-3 min-h-0">
      {/* Sơ đồ khu phố */}
      <div className="relative flex-1 min-w-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-200">
        <svg viewBox="0 0 600 300" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <path d="M0 150 C 120 110, 220 190, 340 150 S 520 110, 600 150" stroke="rgba(37,99,235,0.20)" strokeWidth="8" fill="none" />
          <path d="M300 0 L300 300" stroke="rgba(37,99,235,0.12)" strokeWidth="5" fill="none" />
        </svg>

        <div className="relative grid grid-cols-6 grid-rows-3 gap-2 p-3 h-full">
          {hoods.map((h) => {
            const color = scoreColor(h.score);
            const on = highlight === h.code;
            return (
              <div key={h.code}
                className="relative rounded-lg border transition-all duration-500 flex flex-col items-center justify-center min-h-0"
                style={{
                  background: `linear-gradient(160deg, ${color}22, ${color}0D)`,
                  borderColor: on ? color : `${color}66`,
                  boxShadow: on ? `0 0 0 3px ${color}44` : "none",
                  transform: on ? "scale(1.04)" : "scale(1)",
                }}>
                <span className="text-[22px] font-bold text-slate-900 leading-none">{h.code}</span>
                <span className="text-[15px] text-slate-500 mt-1">{h.score} điểm</span>
                {h.overdue > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[22px] h-[22px] px-1 rounded-full bg-red-600 text-white text-[13px] font-bold flex items-center justify-center">
                    {h.overdue}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Thẻ thông tin khu phố đang được làm nổi bật - đặt riêng, không đè lên bản đồ */}
      <div className="w-[300px] shrink-0 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-3 flex flex-col">
        {active ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[26px] font-bold text-slate-900">{active.code}</p>
              <span className="px-2.5 py-0.5 rounded-full text-[15px] font-semibold"
                style={{ background: `${scoreColor(active.score)}33`, color: scoreColor(active.score) }}>
                {active.status}
              </span>
            </div>
            <dl className="mt-3 space-y-2 text-[18px]">
              {[
                ["Người dùng hoạt động", active.users.toLocaleString("vi-VN")],
                ["Phản ánh", String(active.feedback)],
                ["Quá hạn", String(active.overdue)],
                ["Đúng hạn", `${active.onTime}%`],
                ["Hoạt động", String(active.events)],
                ["Khảo sát", `${active.survey}%`],
                ["Điểm hiệu quả", `${active.score}/100`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-slate-900 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="text-[18px] text-slate-400">Đang chọn khu phố...</p>
        )}
      </div>
    </div>
  );
}

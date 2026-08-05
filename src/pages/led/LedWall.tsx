import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  AlertTriangle, ArrowDownRight, ArrowUpRight, CalendarClock, ChevronLeft, ChevronRight,
  GraduationCap, LayoutGrid, MapPinned, Megaphone, Pause, Play, RefreshCw, Users, Wifi, WifiOff,
} from "lucide-react";
import demo from "../../data/led-demo.json";
import logoXuanHoa from "../../assets/logo-dashboard.png";
import { CountUp, Gauge, Panel, Ring, Sparkline, scoreColor } from "../../components/led/parts";
import { WardMap } from "../../components/led/WardMap";

const CANVAS_W = 3840;
const CANVAS_H = 2160;

const KPI_ICONS = [Users, Users, LayoutGrid, Megaphone, CalendarClock, LayoutGrid, AlertTriangle, GraduationCap];

const axisStyle = { fontSize: 20, fill: "#64748B" };
const tooltipProps = {
  contentStyle: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 12, fontSize: 20, color: "#0F172A" },
  labelStyle: { color: "#475569", fontSize: 20, fontWeight: 600 },
  itemStyle: { color: "#0F172A" },
};

/** Vùng cần tránh đường ghép: 60px mỗi phía quanh x=1920 và y=1080 */
const SEAM = 60;

export default function LedWall() {
  const navigate = useNavigate();
  const location = useLocation();
  const isStandalone = location.pathname === "/led";
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [now, setNow] = useState(new Date());
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date(demo.updatedAt));
  const [scale, setScale] = useState(0.5);
  const [highlight, setHighlight] = useState<string | null>("KP05");
  const [nonce, setNonce] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const scenes = demo.scenes;

  // Đồng hồ
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Trạng thái kết nối: mất mạng vẫn giữ dữ liệu gần nhất
  useEffect(() => {
    const on = () => { setOnline(true); setLastSync(new Date()); };
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Trình chiếu tự động 6 cảnh
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setScene((s) => (s + 1) % scenes.length), scenes[scene].duration * 1000);
    return () => clearTimeout(t);
  }, [playing, scene, scenes]);

  // Bản đồ tự làm nổi bật lần lượt từng khu phố mỗi 10 giây
  useEffect(() => {
    const t = setInterval(() => {
      setHighlight((cur) => {
        const list = demo.neighborhoods.map((h) => h.code);
        const i = cur ? list.indexOf(cur) : -1;
        return list[(i + 1) % list.length];
      });
    }, 10000);
    return () => clearInterval(t);
  }, []);

  // Tự co giãn canvas 3840x2160 giữ tỷ lệ 16:9
  useEffect(() => {
    const fit = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setScale(Math.min(w / CANVAS_W, h / CANVAS_H));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const kpiData = demo.kpis;
  const userSeries = useMemo(
    () => demo.users.months.map((m, i) => ({
      name: m.slice(0, 2),
      "Hoạt động": demo.users.activeSeries[i],
      "Người mới": demo.users.newSeries[i],
    })), []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  const syncStr = `${pad(lastSync.getHours())}:${pad(lastSync.getMinutes())}`;

  const isActive = (zone: "kpi" | "users" | "map" | "tasks" | "comm" | "alerts") => {
    switch (scene) {
      case 0: return zone === "kpi";
      case 1: return zone === "users";
      case 2: return zone === "tasks";
      case 3: return zone === "map";
      case 4: return zone === "comm";
      case 5: return zone === "alerts";
      default: return false;
    }
  };

  const alertColor: Record<string, string> = {
    critical: "#DC2626", high: "#EA580C", medium: "#CA8A04", positive: "#059669",
  };

  return (
    <div ref={wrapRef} className="fixed inset-0 bg-[#EEF2F7] overflow-hidden flex items-center justify-center">
      {/* Thanh điều khiển - không nằm trong canvas trình chiếu */}
      <div className="absolute bottom-3 left-3 z-50 flex items-center gap-2 rounded-xl bg-white/95 border border-slate-200 shadow-lg px-2 py-1.5">
        <button onClick={() => setScene((s) => (s - 1 + scenes.length) % scenes.length)}
          className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200" title="Cảnh trước">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => setPlaying((p) => !p)}
          className="h-9 px-3 rounded-lg bg-blue-600 text-white text-[13px] flex items-center gap-1.5 hover:bg-blue-700">
          {playing ? <Pause size={15} /> : <Play size={15} />} {playing ? "Dừng trình chiếu" : "Trình chiếu"}
        </button>
        <button onClick={() => setScene((s) => (s + 1) % scenes.length)}
          className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200" title="Cảnh sau">
          <ChevronRight size={16} />
        </button>
        <select value={scene} onChange={(e) => { setScene(Number(e.target.value)); setPlaying(false); }}
          className="h-9 rounded-lg bg-white border border-slate-200 text-slate-700 text-[13px] px-2 outline-none">
          {scenes.map((s, i) => <option key={s.id} value={i} className="text-slate-900">{`Cảnh ${s.id}: ${s.name}`}</option>)}
        </select>
        <button onClick={() => { setNonce((n) => n + 1); setLastSync(new Date()); }}
          className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200" title="Tải lại dữ liệu">
          <RefreshCw size={15} />
        </button>
        {!isStandalone && <button onClick={() => navigate("/dashboard/overview")}
          className="h-9 px-3 rounded-lg bg-slate-100 text-slate-600 text-[13px] hover:bg-slate-200">Thoát</button>}
      </div>

      {/* Canvas 3840x2160 */}
      <div style={{ width: CANVAS_W, height: CANVAS_H, transform: `scale(${scale})`, transformOrigin: "center" }}
        className="relative shrink-0 text-slate-800"
        key={nonce}>
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(1400px 900px at 15% 0%, #FFFFFF 0%, #F8FAFC 45%, #EFF4FA 100%)" }} />

        <div className="relative w-full h-full flex flex-col" style={{ padding: 48 }}>
          {/* A. Header 0-170px */}
          <header className="h-[122px] shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <img src={logoXuanHoa} alt="Logo phường Xuân Hoà" className="w-[88px] h-[88px] object-contain" />
              <div>
                <p className="text-[40px] font-bold tracking-wide leading-none text-slate-900">XUÂN HOÀ SỐ - TRUNG TÂM ĐIỀU HÀNH</p>
                <p className="text-[22px] text-slate-500 mt-1.5">
                  Cảnh {scenes[scene].id}/{scenes.length}: {scenes[scene].name} · Dữ liệu giả lập phục vụ trình diễn
                </p>
              </div>
            </div>
            <p className="text-[42px] font-semibold tracking-wide shrink-0 text-blue-700">TỔNG QUAN ĐIỀU HÀNH</p>
            <div className="text-right shrink-0 w-[560px]">
              <p className="text-[46px] font-bold leading-none tabular-nums text-slate-900">{clock}</p>
              <p className="text-[22px] text-slate-500 mt-1">Ngày {dateStr}</p>
              <p className="text-[20px] mt-1 flex items-center justify-end gap-2 text-slate-600">
                {online
                  ? <><span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" /><Wifi size={18} className="text-emerald-600" /> Hệ thống hoạt động bình thường</>
                  : <><span className="w-3 h-3 rounded-full bg-amber-500" /><WifiOff size={18} className="text-amber-600" /> Mất kết nối - đang hiển thị dữ liệu gần nhất</>}
              </p>
              <p className="text-[19px] text-slate-400">Cập nhật {syncStr}</p>
            </div>
          </header>

          {/* B. Dải KPI 170-460px */}
          <div className={`grid grid-cols-8 gap-4 mt-3 transition-all duration-500 ${isActive("kpi") ? "opacity-100" : "opacity-90"}`}>
            {kpiData.map((k, i) => {
              const Icon = KPI_ICONS[i] ?? Users;
              const up = k.delta >= 0;
              const good = k.tone === "up" || k.tone === "down_good";
              return (
                <div key={k.key}
                  className={`rounded-2xl border px-5 py-4 backdrop-blur-sm transition-all duration-500 ${
                    isActive("kpi") ? "border-blue-400 bg-blue-50/70" : "border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[19px] text-slate-500 leading-tight pr-2">{k.label}</span>
                    <Icon size={26} className="text-blue-600 shrink-0" />
                  </div>
                  <p className="text-[62px] font-bold leading-none mt-2 tabular-nums text-slate-900">
                    <CountUp value={k.value} decimals={k.unit === "%" || k.unit === "điểm" ? 1 : 0} />
                    {k.unit === "%" && <span className="text-[34px] ml-1">%</span>}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-[21px] font-semibold flex items-center gap-1 ${good ? "text-emerald-600" : "text-amber-600"}`}>
                      {up ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      {Math.abs(k.delta)}{k.deltaType === "percent" ? "%" : " điểm %"}
                    </span>
                    <Sparkline data={k.spark} color={good ? "#059669" : "#F59E0B"} width={120} height={30} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* C + D: 4 vùng nội dung, chừa vùng an toàn quanh đường ghép */}
          <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 mt-4" style={{ gap: SEAM * 2 }}>
            {/* C1. Người dùng và phản ánh */}
            <Panel title="Người dùng và phản ánh" subtitle="Mức độ sử dụng hệ thống và kết quả xử lý"
              active={isActive("users")} className="h-full">
              <div className="grid grid-cols-4 gap-3">
                {[
                  ["Tổng người dùng", demo.users.total.toLocaleString("vi-VN")],
                  ["Hoạt động 7 ngày", demo.users.active7d.toLocaleString("vi-VN")],
                  ["Hoạt động 30 ngày", demo.users.active30d.toLocaleString("vi-VN")],
                  ["Người dùng mới", `${demo.users.newInMonth.toLocaleString("vi-VN")} (+${demo.users.newGrowth}%)`],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                    <p className="text-[30px] font-bold leading-none text-slate-900">{v}</p>
                    <p className="text-[18px] text-slate-500 mt-1.5">{l}</p>
                  </div>
                ))}
              </div>

              <div className="flex-1 min-h-0 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userSeries}>
                    <defs>
                      <linearGradient id="ledActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.30} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 6" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
                    <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={70} />
                    <Tooltip {...tooltipProps} />
                    <Area type="monotone" dataKey="Hoạt động" stroke="#2563EB" strokeWidth={4} fill="url(#ledActive)"
                      animationDuration={1000} />
                    <Line type="monotone" dataKey="Người mới" stroke="#7C3AED" strokeWidth={3} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center mt-2 h-[210px] shrink-0">
                <div className="h-full col-span-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip {...tooltipProps} />
                      <Pie data={demo.feedback.byStatus} dataKey="value" nameKey="name"
                        innerRadius="55%" outerRadius="86%" paddingAngle={2} animationDuration={900}>
                        {demo.feedback.byStatus.map((s) => <Cell key={s.name} fill={s.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="col-span-1 space-y-1.5">
                  {demo.feedback.byStatus.map((s) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-sm" style={{ background: s.color }} />
                      <span className="text-[19px] text-slate-600 flex-1">{s.name}</span>
                      <span className="text-[22px] font-semibold tabular-nums text-slate-900">{s.value}</span>
                      <span className="text-[18px] text-slate-400 w-[70px] text-right">{s.rate}%</span>
                    </div>
                  ))}
                </div>
                <div className="col-span-1 flex justify-center">
                  <Gauge value={demo.feedback.satisfactionRate} label="Mức độ hài lòng" />
                </div>
              </div>
            </Panel>

            {/* C2. Bản đồ điều hành khu phố */}
            <Panel title="Bản đồ điều hành khu phố" subtitle="Tô màu theo điểm hiệu quả, tự làm nổi bật mỗi 10 giây"
              active={isActive("map")} className="h-full"
              right={
                <div className="flex gap-3">
                  {demo.mapLegend.slice(0, 4).map((l) => (
                    <span key={l.range} className="flex items-center gap-1.5 text-[17px] text-slate-500">
                      <span className="w-3.5 h-3.5 rounded-sm" style={{ background: l.color }} /> {l.label}
                    </span>
                  ))}
                </div>
              }>
              <div className="flex-1 min-h-0">
                <WardMap hoods={demo.neighborhoods} highlight={highlight} />
              </div>
              <div className="grid grid-cols-4 gap-3 mt-3 shrink-0">
                {[
                  ["Khu phố hoạt động tốt", demo.neighborhoods.filter((h) => h.score >= 85).length],
                  ["Khu phố khá", demo.neighborhoods.filter((h) => h.score >= 80 && h.score < 85).length],
                  ["Cần theo dõi", demo.neighborhoods.filter((h) => h.score < 80).length],
                  ["Tổng phản ánh quá hạn", demo.neighborhoods.reduce((a, h) => a + h.overdue, 0)],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                    <p className="text-[34px] font-bold leading-none text-slate-900">{v as number}</p>
                    <p className="text-[18px] text-slate-500 mt-1.5">{l as string}</p>
                  </div>
                ))}
              </div>
            </Panel>

            {/* D1. Công việc và hiệu quả xử lý */}
            <Panel title="Công việc và hiệu quả xử lý" subtitle={`Hoàn thành đúng hạn ${demo.tasks.onTimeRate}% · Trung bình ${demo.tasks.avgDays} ngày`}
              active={isActive("tasks")} className="h-full">
              <div className="grid grid-cols-5 gap-3">
                {[
                  ["Tổng công việc", demo.tasks.total, "#2563EB"],
                  ["Hoàn thành", demo.tasks.completed, "#059669"],
                  ["Đang xử lý", demo.tasks.processing, "#F59E0B"],
                  ["Sắp đến hạn", demo.tasks.dueSoon, "#EA580C"],
                  ["Quá hạn", demo.tasks.overdue, "#DC2626"],
                ].map(([l, v, c]) => (
                  <div key={l as string} className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                    <p className="text-[38px] font-bold leading-none" style={{ color: c as string }}>
                      <CountUp value={v as number} />
                    </p>
                    <p className="text-[18px] text-slate-500 mt-1.5">{l as string}</p>
                  </div>
                ))}
              </div>

              <div className="flex-1 min-h-0 mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demo.tasks.byUnit}>
                    <CartesianGrid strokeDasharray="4 6" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="unit" tick={{ ...axisStyle, fontSize: 17 }} tickLine={false} axisLine={false} interval={0} />
                    <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={60} />
                    <Tooltip {...tooltipProps} />
                    <Bar dataKey="score" name="Điểm hiệu quả" radius={[8, 8, 0, 0]} barSize={46} animationDuration={800}>
                      {demo.tasks.byUnit.map((u) => <Cell key={u.unit} fill={scoreColor(u.score)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 space-y-1.5 shrink-0">
                <p className="text-[20px] text-slate-500">Công việc cần lãnh đạo chú ý</p>
                {demo.tasks.watchList.slice(0, 4).map((t) => (
                  <div key={t.code} className="flex items-center gap-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2">
                    <span className="text-[18px] text-blue-600 font-mono w-[210px] shrink-0">{t.code}</span>
                    <span className="text-[21px] flex-1 min-w-0 truncate text-slate-800">{t.title}</span>
                    <span className="text-[18px] text-slate-500 w-[280px] shrink-0">{t.unit}</span>
                    <span className="text-[18px] text-slate-500 w-[150px] shrink-0">{t.due}</span>
                    <span className="text-[18px] font-semibold px-3 py-1 rounded-full shrink-0"
                      style={{
                        background: t.level === "critical" ? "#FEE2E2" : t.level === "warning" ? "#FFEDD5" : "#DBEAFE",
                        color: t.level === "critical" ? "#B91C1C" : t.level === "warning" ? "#C2410C" : "#1D4ED8",
                      }}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* D2. Truyền thông, cộng đồng và học vụ số */}
            <Panel title="Truyền thông, cộng đồng và học vụ số" subtitle="Hiệu quả lan toả thông tin tới người dân"
              active={isActive("comm")} className="h-full">
              <div className="grid grid-cols-4 gap-3">
                {[
                  ["Tin đã đăng", demo.communication.newsPosted],
                  ["Tổng lượt xem tin", demo.communication.newsViews.toLocaleString("vi-VN")],
                  ["Hoạt động đã tổ chức", demo.communication.eventsHeld],
                  ["Người tham gia", demo.communication.eventParticipants.toLocaleString("vi-VN")],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                    <p className="text-[32px] font-bold leading-none text-slate-900">{v as string}</p>
                    <p className="text-[18px] text-slate-500 mt-1.5">{l as string}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3 flex-1 min-h-0">
                <div className="col-span-2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={demo.communication.newsViewSeries}>
                      <CartesianGrid strokeDasharray="4 6" stroke="#E2E8F0" vertical={false} />
                      <XAxis dataKey="name" tick={axisStyle} tickLine={false} axisLine={false} />
                      <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={70} />
                      <Tooltip {...tooltipProps} />
                      <Bar dataKey="value" name="Lượt xem tin" fill="#2563EB" radius={[8, 8, 0, 0]} barSize={64} animationDuration={800} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center">
                  <Ring value={demo.communication.announcementViewRate} label="Tỷ lệ xem thông báo trong 24 giờ" />
                </div>
              </div>

              <div className="mt-3 shrink-0">
                <p className="text-[20px] text-slate-500 mb-2">Phễu Bình dân học vụ số</p>
                <div className="space-y-1.5">
                  {demo.communication.digitalLearning.map((s) => (
                    <div key={s.step} className="flex items-center gap-3">
                      <span className="text-[19px] text-slate-600 w-[260px] shrink-0">{s.step}</span>
                      <div className="flex-1 h-[30px] rounded-lg bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-lg transition-all duration-700"
                          style={{ width: `${s.rate}%`, background: "linear-gradient(90deg,#2563EB,#059669)" }} />
                      </div>
                      <span className="text-[22px] font-semibold tabular-nums w-[120px] text-right text-slate-900">{s.value.toLocaleString("vi-VN")}</span>
                      <span className="text-[18px] text-slate-400 w-[80px] text-right">{s.rate}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 shrink-0">
                {demo.communication.upcomingEvents.slice(0, 2).map((e) => (
                  <div key={e.title} className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5">
                    <p className="text-[20px] font-semibold truncate text-slate-800">{e.title}</p>
                    <p className="text-[17px] text-slate-500 mt-0.5">{e.time} · {e.place}</p>
                    <p className="text-[17px] text-emerald-600 mt-0.5">Đăng ký: {e.register}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* E. Dải cảnh báo 1920-2160px */}
          <div className={`mt-4 h-[112px] shrink-0 rounded-2xl border flex items-center gap-4 px-6 overflow-hidden transition-all duration-500 ${
            isActive("alerts") ? "border-red-300 bg-red-50" : "border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          }`}>
            <span className="flex items-center gap-2 text-[24px] font-bold text-red-600 shrink-0">
              <AlertTriangle size={28} className="animate-pulse" /> CẢNH BÁO
            </span>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-10 whitespace-nowrap led-marquee">
                {[...demo.alerts, ...demo.alerts].map((a, i) => (
                  <span key={i} className="flex items-center gap-2.5 text-[26px]" style={{ color: alertColor[a.level] }}>
                    <span className="w-3.5 h-3.5 rounded-full" style={{ background: alertColor[a.level] }} />
                    {a.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes ledMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .led-marquee { animation: ledMarquee 38s linear infinite; }
        `}</style>
      </div>
    </div>
  );
}

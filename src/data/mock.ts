import type {
  ActivityLog, ContentItem, ContentStatus, Feedback, FeedbackStatus, HomeConfig,
  MediaItem, Neighborhood, Notification, OrgSettings, Priority, Survey, User, Utility, WasteSchedule,
} from "../types";

// ─── Tiện ích tạo dữ liệu tất định (deterministic) ───────────────────────────
let seed = 20260804;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));

export const TODAY = new Date("2026-08-04T08:00:00");
const dayOffset = (d: number, h = 9) => {
  const t = new Date(TODAY);
  t.setDate(t.getDate() + d);
  t.setHours(h, 0, 0, 0);
  return t.toISOString();
};

const IMGS = [
  "photo-1582407947304-fd86f028f716", "photo-1486325212027-8081e485255e",
  "photo-1477959858617-67f85cf4f1df", "photo-1451187580459-43490279c0fa",
  "photo-1529156069898-49953e39b3ac", "photo-1466611653911-95081537e5b7",
  "photo-1449824913935-59a10b8d2000", "photo-1519501025264-65ba15a82390",
];
export const img = (i: number, w = 400, h = 250) =>
  `https://images.unsplash.com/${IMGS[i % IMGS.length]}?w=${w}&h=${h}&fit=crop&auto=format`;

const NAMES = [
  "Nguyễn Văn Hùng", "Trần Thị Mai", "Lê Minh Tuấn", "Phạm Văn Đức", "Võ Thị Hoa",
  "Đặng Minh Khoa", "Bùi Thị Lan", "Hoàng Văn Nam", "Ngô Thị Thu", "Đinh Văn Phong",
  "Lý Thị Quỳnh", "Vũ Minh Sơn", "Trương Thị Tâm", "Phan Văn Uy", "Mai Thị Vân",
  "Đỗ Văn Xuân", "Cao Thị Yên", "Lâm Văn Phúc", "Nguyễn Thị Bình", "Trần Quốc Anh",
];

const phone = (i: number) =>
  `09${String((10 + i * 3) % 90).padStart(2, "0")}${String((100 + i * 37) % 900 + 100)}${String((200 + i * 53) % 800 + 100)}`;

// ─── 18 khu phố ──────────────────────────────────────────────────────────────
export const NEIGHBORHOODS: Neighborhood[] = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  name: `Khu phố ${i + 1}`,
  leaderId: `u-hood-${i + 1}`,
  leaderName: NAMES[i],
  phone: phone(i),
  population: 800 + ((i * 47) % 600),
  households: 200 + ((i * 31) % 200),
  image: img(i, 600, 300),
  intro: `Khu phố ${i + 1} thuộc phường Xuân Hoà, TP. Hồ Chí Minh, có ${200 + ((i * 31) % 200)} hộ gia đình sinh sống, hạ tầng đô thị ổn định, phong trào cộng đồng được duy trì thường xuyên.`,
  board: [
    { name: NAMES[i], role: "Trưởng khu phố", phone: phone(i) },
    { name: NAMES[(i + 1) % 18], role: "Phó trưởng khu phố", phone: phone(i + 5) },
    { name: NAMES[(i + 2) % 18], role: "Thư ký", phone: phone(i + 9) },
  ],
  lastUpdate: dayOffset(-int(0, 25)),
  active: i % 7 !== 3,
}));

// ─── 20 tài khoản cán bộ ─────────────────────────────────────────────────────
const USER_SEED: User[] = [
  {
    id: "u-super", fullName: "Nguyễn Văn A", username: "superadmin", role: "SUPER_ADMIN" as const,
    unit: "UBND phường Xuân Hoà", hoodId: null, phone: "0901234567",
    email: "admin@xuanhoa.gov.vn", status: "active" as const, lastLogin: dayOffset(0, 7),
    canPublishDirectly: true,
  },
  {
    id: "u-phuong", fullName: "Trần Thị Bích", username: "phuongadmin", role: "PHUONG_ADMIN" as const,
    unit: "UBND phường Xuân Hoà", hoodId: null, phone: "0902345678",
    email: "vpubnd@xuanhoa.gov.vn", status: "active" as const, lastLogin: dayOffset(0, 8),
    canPublishDirectly: true,
  },
  {
    id: "u-editor", fullName: "Lê Hoàng Nam", username: "bientap", role: "CONTENT_EDITOR" as const,
    unit: "Ban Biên tập phường", hoodId: null, phone: "0903456789",
    email: "bientap@xuanhoa.gov.vn", status: "active" as const, lastLogin: dayOffset(-1, 16),
    canPublishDirectly: false,
  },
  {
    id: "u-feedback", fullName: "Phạm Thu Hà", username: "phananh", role: "FEEDBACK_OFFICER" as const,
    unit: "Bộ phận Tiếp nhận phản ánh", hoodId: null, phone: "0904567890",
    email: "phananh@xuanhoa.gov.vn", status: "active" as const, lastLogin: dayOffset(0, 7),
    canPublishDirectly: false,
  },
  ...NEIGHBORHOODS.map((n, i) => ({
    id: `u-hood-${n.id}`,
    fullName: n.leaderName,
    username: `kp${n.id}`,
    role: (i === 1 ? "NEIGHBORHOOD_STAFF" : "NEIGHBORHOOD_LEADER") as User["role"],
    unit: n.name,
    hoodId: n.id,
    phone: n.phone,
    email: `kp${n.id}@xuanhoa.gov.vn`,
    status: (i === 11 ? "locked" : "active") as User["status"],
    lastLogin: dayOffset(-int(0, 9), int(7, 20)),
    canPublishDirectly: i % 3 === 0,
  })),
];

export const USERS: User[] = USER_SEED.slice(0, 22);

export const userById = (id: string | null) => USERS.find((u) => u.id === id) ?? null;

// ─── 30 phản ánh kiến nghị ───────────────────────────────────────────────────
const FIELDS = ["Môi trường", "An ninh trật tự", "Điện - Nước", "Tiếng ồn", "Khác"];
const FB_SUMMARIES = [
  "Bãi rác tự phát cuối hẻm chưa được thu gom",
  "Đèn chiếu sáng công cộng hỏng nhiều ngày",
  "Quán karaoke mở nhạc lớn sau 22 giờ",
  "Nắp cống bị vỡ gây nguy hiểm cho người đi đường",
  "Nước sinh hoạt yếu vào giờ cao điểm",
  "Xe tải đậu lấn chiếm lòng đường",
  "Cây xanh nghiêng có nguy cơ ngã đổ",
  "Mất trật tự khu vực chợ vào buổi sáng",
  "Đường ngập sau mưa lớn",
  "Chó thả rông không rọ mõm trong khu dân cư",
];
const FB_STATUS: FeedbackStatus[] = ["new", "assigned", "processing", "waiting", "completed", "reopened"];

export const FEEDBACKS: Feedback[] = Array.from({ length: 30 }, (_, i) => {
  const hoodId = int(1, 18);
  const status = i < 5 ? "new" : FB_STATUS[i % FB_STATUS.length];
  const created = dayOffset(-int(0, 21), int(7, 18));
  const due = dayOffset(-int(0, 21) + 7, 17);
  const priority: Priority = i % 9 === 0 ? "urgent" : i % 4 === 0 ? "high" : "normal";
  const assignee = status === "new" ? null : pick(["u-feedback", "u-phuong", `u-hood-${hoodId}`]);
  return {
    id: `fb-${i + 1}`,
    code: `PK${String(1000 + i + 1)}`,
    summary: FB_SUMMARIES[i % FB_SUMMARIES.length],
    content: `${FB_SUMMARIES[i % FB_SUMMARIES.length]}. Người dân đề nghị UBND phường và Ban điều hành khu phố kiểm tra, xử lý dứt điểm để bảo đảm mỹ quan đô thị và an toàn cho cộng đồng.`,
    field: FIELDS[i % FIELDS.length],
    hoodId,
    senderName: NAMES[i % NAMES.length],
    senderPhone: phone(i + 3),
    address: `${int(1, 90)}/${int(1, 20)} Đường số ${int(1, 20)}, KP ${hoodId}, Phường Xuân Hoà`,
    images: [img(i, 600, 400)],
    createdAt: created,
    dueAt: due,
    assigneeId: assignee,
    unit: assignee ? "UBND phường Xuân Hoà" : null,
    status,
    priority,
    timeline: [
      { at: created, by: "Hệ thống", action: "Tiếp nhận phản ánh từ ứng dụng Xuân Hoà Số" },
      ...(assignee ? [{ at: dayOffset(-int(0, 5), 10), by: "Phạm Thu Hà", action: "Phân công xử lý" }] : []),
      ...(status === "completed"
        ? [{ at: dayOffset(-int(0, 3), 15), by: userById(assignee)?.fullName ?? "Cán bộ", action: "Hoàn thành xử lý", note: "Đã xử lý xong và phản hồi người dân." }]
        : []),
    ],
    result: status === "completed" ? "Đã xử lý xong, hiện trường được khắc phục và có ảnh nghiệm thu." : undefined,
  };
});

// ─── 25 tin tức - thông báo, 10 hoạt động, 10 bài học số, banner ─────────────
const NEWS_TITLES = [
  "UBND phường Xuân Hoà triển khai nhiệm vụ trọng tâm quý III",
  "Ra mắt mô hình Tổ dân phố tự quản về trật tự đô thị",
  "Ngày hội Toàn dân bảo vệ an ninh Tổ quốc",
  "Tập huấn kỹ năng sử dụng dịch vụ công trực tuyến",
  "Ra quân tổng vệ sinh môi trường toàn phường",
  "Trao quà cho hộ gia đình có hoàn cảnh khó khăn",
  "Khánh thành tuyến hẻm văn minh đô thị",
  "Hội nghị đối thoại giữa lãnh đạo phường và nhân dân",
  "Phát động phong trào toàn dân đoàn kết xây dựng đời sống văn hoá",
  "Kiểm tra công tác phòng cháy chữa cháy khu dân cư",
];
const ANNOUNCE_TITLES = [
  "Thông báo lịch tiếp công dân tháng 8/2026",
  "Thông báo thay đổi lịch thu gom rác khu vực trung tâm",
  "Thông báo nộp thuế đất phi nông nghiệp quý III",
  "Thông báo tạm ngưng cấp nước để bảo trì đường ống",
  "Thông báo tuyển chọn công dân nhập ngũ năm 2027",
];
const EVENT_TITLES = [
  "Ngày hội văn hoá - thể thao khu phố",
  "Buổi tuyên truyền phòng chống lừa đảo trực tuyến",
  "Hiến máu tình nguyện tại nhà văn hoá phường",
  "Ra quân bóc gỡ quảng cáo sai quy định",
  "Sinh hoạt chi bộ mở rộng",
];
const LITERACY = [
  { t: "Hướng dẫn nộp hồ sơ dịch vụ công trực tuyến toàn trình", topic: "Dịch vụ công" },
  { t: "Nhận diện 7 chiêu trò lừa đảo qua điện thoại phổ biến", topic: "Cảnh giác lừa đảo" },
  { t: "Cách bảo vệ thông tin cá nhân trên mạng xã hội", topic: "Bảo vệ thông tin" },
  { t: "Thanh toán không tiền mặt cho người lớn tuổi", topic: "Thanh toán số" },
  { t: "Hướng dẫn sử dụng ứng dụng Xuân Hoà Số từ A đến Z", topic: "Xuân Hoà Số" },
  { t: "Cài đặt và sử dụng VNeID mức độ 2", topic: "Dịch vụ công" },
  { t: "Phân biệt tin giả trên mạng xã hội", topic: "Cảnh giác lừa đảo" },
  { t: "Bảo mật tài khoản ngân hàng khi dùng điện thoại", topic: "Bảo vệ thông tin" },
  { t: "Quét mã QR thanh toán an toàn", topic: "Thanh toán số" },
  { t: "Gửi phản ánh kiến nghị đúng cách trên Xuân Hoà Số", topic: "Xuân Hoà Số" },
];
const STATUSES: ContentStatus[] = ["draft", "pending", "needs_revision", "approved", "scheduled", "published", "hidden"];

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

let cid = 0;
const makeContent = (
  type: ContentItem["type"], title: string, i: number, extra: Partial<ContentItem> = {}
): ContentItem => {
  cid += 1;
  const status = (extra.status ?? STATUSES[i % STATUSES.length]) as ContentStatus;
  const created = dayOffset(-int(1, 30), int(8, 17));
  return {
    id: `ct-${cid}`,
    type,
    title,
    slug: slugify(title),
    excerpt: `${title}. Thông tin do UBND phường Xuân Hoà và Ban điều hành khu phố cung cấp.`,
    body: `${title}.\n\nUBND phường Xuân Hoà thông tin đến người dân nội dung nêu trên. Đề nghị Ban điều hành các khu phố phổ biến rộng rãi đến từng hộ gia đình, đồng thời cập nhật kịp thời lên ứng dụng Xuân Hoà Số để người dân theo dõi.\n\nMọi thắc mắc, người dân liên hệ bộ phận tiếp nhận hồ sơ của phường trong giờ hành chính.`,
    image: img(i, 800, 450),
    gallery: [img(i + 1, 600, 400), img(i + 2, 600, 400)],
    hoodId: i % 3 === 0 ? null : ((i % 18) + 1),
    authorId: i % 4 === 0 ? "u-editor" : `u-hood-${(i % 18) + 1}`,
    status,
    createdAt: created,
    publishedAt: status === "published" ? dayOffset(-int(0, 12), 10) : null,
    scheduledAt: status === "scheduled" ? dayOffset(int(1, 10), 8) : null,
    pinned: i === 0,
    featured: i % 6 === 0,
    views: int(20, 900),
    history: [{ at: created, by: "Hệ thống", action: "created" }],
    ...extra,
  };
};

export const CONTENTS: ContentItem[] = [
  ...NEWS_TITLES.map((t, i) => makeContent("news", t, i)),
  ...NEWS_TITLES.slice(0, 5).map((t, i) => makeContent("news", `${t} (khu phố ${i + 3})`, i + 10)),
  ...ANNOUNCE_TITLES.map((t, i) => makeContent("announcement", t, i + 15)),
  ...EVENT_TITLES.map((t, i) =>
    makeContent("event", t, i + 20, {
      startAt: dayOffset(int(1, 12), int(7, 19)),
      endAt: dayOffset(int(1, 12), 21),
      place: `Nhà văn hoá Khu phố ${int(1, 18)}`,
    })
  ),
  ...EVENT_TITLES.map((t, i) =>
    makeContent("event", `${t} - đợt 2`, i + 25, {
      startAt: dayOffset(int(2, 20), 8),
      endAt: dayOffset(int(2, 20), 11),
      place: `Sân bóng Khu phố ${int(1, 18)}`,
    })
  ),
  ...LITERACY.map((l, i) =>
    makeContent("literacy", l.t, i + 30, {
      topic: l.topic,
      level: i % 2 === 0 ? "easy" : "medium",
      audience: i % 3 === 0 ? "Người cao tuổi" : "Người dân",
      hoodId: null,
    })
  ),
  ...["Chào mừng Quốc khánh 2/9", "Cải cách hành chính 2026", "Chuyển đổi số Xuân Hoà"].map((t, i) =>
    makeContent("banner", t, i + 40, { status: "published", hoodId: null })
  ),
];

// ─── 12 lịch thu gom rác ─────────────────────────────────────────────────────
export const WASTE: WasteSchedule[] = Array.from({ length: 12 }, (_, i) => ({
  id: `ws-${i + 1}`,
  hoodId: (i % 18) + 1,
  route: `Đường số ${int(1, 20)} và các hẻm nhánh`,
  weekdays: i % 3 === 0 ? [2, 4, 6] : i % 3 === 1 ? [3, 5, 7] : [2, 5],
  timeRange: i % 2 === 0 ? "05:00 - 07:00" : "17:00 - 19:00",
  wasteType: pick(["Rác sinh hoạt", "Rác tái chế", "Rác cồng kềnh"]),
  provider: "Công ty Dịch vụ công ích",
  note: i % 4 === 0 ? "Người dân để rác đúng giờ, đúng nơi quy định." : "",
  effectiveFrom: dayOffset(-int(10, 60)),
  status: i % 6 === 0 ? "paused" : "active",
}));

// ─── 8 khảo sát ──────────────────────────────────────────────────────────────
export const SURVEYS: Survey[] = [
  ["Khảo sát mức độ hài lòng về dịch vụ hành chính công", "survey"],
  ["Đăng ký tham gia Ngày hội văn hoá - thể thao", "register_event"],
  ["Khảo sát nhu cầu lắp đặt camera an ninh", "survey"],
  ["Đăng ký hỗ trợ học phí cho học sinh khó khăn", "register_support"],
  ["Lấy ý kiến về lịch thu gom rác mới", "survey"],
  ["Đăng ký tập huấn kỹ năng số cho người cao tuổi", "register_event"],
  ["Biểu mẫu góp ý chỉnh trang đô thị", "form"],
  ["Khảo sát chất lượng ứng dụng Xuân Hoà Số", "survey"],
].map(([title, kind], i) => ({
  id: `sv-${i + 1}`,
  title: title as string,
  description: `${title}. Kết quả phục vụ công tác điều hành của UBND phường Xuân Hoà.`,
  kind: kind as Survey["kind"],
  openAt: dayOffset(-int(1, 20)),
  closeAt: dayOffset(int(-3, 20)),
  hoodIds: i % 3 === 0 ? null : [((i % 18) + 1), ((i % 18) + 2)],
  limit: i % 4 === 0 ? 200 : null,
  responses: int(12, 480),
  publicResult: i % 2 === 0,
  status: i % 5 === 0 ? "draft" : i % 7 === 3 ? "closed" : "open",
  questions: [
    { id: "q1", label: "Họ và tên", type: "text", required: true },
    { id: "q2", label: "Khu phố đang sinh sống", type: "single", required: true, options: NEIGHBORHOODS.map((n) => n.name) },
    { id: "q3", label: "Mức độ hài lòng", type: "single", required: true, options: ["Rất hài lòng", "Hài lòng", "Bình thường", "Chưa hài lòng"] },
    { id: "q4", label: "Góp ý thêm", type: "text", required: false },
  ],
}));

// ─── 30 media ────────────────────────────────────────────────────────────────
export const MEDIA: MediaItem[] = Array.from({ length: 30 }, (_, i) => ({
  id: `md-${i + 1}`,
  url: img(i, 400, 300),
  kind: i % 9 === 0 ? "video" : "image",
  name: `hinh-hoat-dong-${i + 1}.${i % 9 === 0 ? "mp4" : "jpg"}`,
  album: pick(["Hoạt động cộng đồng", "Chỉnh trang đô thị", "Hội nghị", "Ngày hội khu phố"]),
  hoodId: i % 4 === 0 ? null : ((i % 18) + 1),
  event: pick(EVENT_TITLES),
  size: `${int(240, 3800)} KB`,
  uploadedAt: dayOffset(-int(0, 40), int(8, 18)),
  uploadedBy: pick(USERS).fullName,
  usedIn: i % 3 === 0 ? [`ct-${int(1, 20)}`] : [],
}));

// ─── Tiện ích ────────────────────────────────────────────────────────────────
export const UTILITIES: Utility[] = [
  ["Dịch vụ công trực tuyến", "FileText", "Hành chính"],
  ["Thông tin quy hoạch", "Map", "Hành chính"],
  ["Trường học", "GraduationCap", "Giáo dục"],
  ["Trạm y tế", "HeartPulse", "Y tế"],
  ["Chợ - siêu thị", "Store", "Dân sinh"],
  ["Nhà văn hoá", "Landmark", "Dân sinh"],
  ["Cơ quan hành chính", "Building2", "Hành chính"],
  ["Điểm công cộng", "MapPin", "Dân sinh"],
  ["Đường dây nóng", "Phone", "Hỗ trợ"],
].map(([name, icon, category], i) => ({
  id: `ut-${i + 1}`,
  name: name as string,
  icon: icon as string,
  category: category as string,
  description: `${name} trên địa bàn phường Xuân Hoà.`,
  link: `/utilities/${slugify(name as string)}`,
  order: i + 1,
  onHome: i < 6,
  status: i === 8 ? "hidden" : "active",
}));

// ─── Nhật ký hoạt động ───────────────────────────────────────────────────────
export const LOGS: ActivityLog[] = Array.from({ length: 24 }, (_, i) => {
  const u = USERS[i % USERS.length];
  return {
    id: `lg-${i + 1}`,
    at: dayOffset(-Math.floor(i / 3), 18 - (i % 10)),
    actorId: u.id,
    action: pick([
      "đăng tin mới", "duyệt nội dung", "phân công phản ánh",
      "cập nhật lịch thu gom rác", "cập nhật thông tin khu phố", "xuất bản thông báo",
    ]),
    target: pick([...NEWS_TITLES.slice(0, 4), ...ANNOUNCE_TITLES.slice(0, 3), "PK1003", "PK1010"]),
    hoodId: u.hoodId,
  };
});

// ─── Thông báo nội bộ ────────────────────────────────────────────────────────
export const NOTIFICATIONS: Notification[] = [
  { kind: "feedback", title: "3 phản ánh mới cần tiếp nhận", description: "Khu phố 3, 7 và 12 vừa có phản ánh mới.", link: "/dashboard/feedback?tab=new" },
  { kind: "feedback", title: "2 phản ánh sắp quá hạn", description: "Còn dưới 24 giờ so với hạn xử lý.", link: "/dashboard/feedback?tab=due" },
  { kind: "content", title: "1 nội dung chờ duyệt", description: "Trưởng khu phố 7 vừa gửi duyệt bài viết.", link: "/dashboard/content?status=pending" },
  { kind: "content", title: "Bài viết của bạn đã được duyệt", description: "Nội dung sẽ xuất bản theo lịch đã đặt.", link: "/dashboard/content" },
  { kind: "event", title: "2 hoạt động sắp diễn ra", description: "Trong 7 ngày tới trên địa bàn phường.", link: "/dashboard/content/events" },
  { kind: "survey", title: "1 khảo sát sắp đóng", description: "Khảo sát mức độ hài lòng sẽ đóng trong 2 ngày.", link: "/dashboard/surveys" },
].map((n, i) => ({ ...n, id: `nt-${i + 1}`, at: dayOffset(0, 8 - i), read: i > 3, hoodId: null } as Notification));

// ─── Cấu hình trang chủ và đơn vị ────────────────────────────────────────────
export const HOME_CONFIG: HomeConfig = {
  bannerIds: CONTENTS.filter((c) => c.type === "banner").map((c) => c.id),
  pinnedAnnouncementId: CONTENTS.find((c) => c.type === "announcement")?.id ?? null,
  featuredNewsIds: CONTENTS.filter((c) => c.type === "news").slice(0, 3).map((c) => c.id),
  utilityIds: UTILITIES.filter((u) => u.onHome).map((u) => u.id),
  hoodIds: [1, 3, 7, 12],
  literacyIds: CONTENTS.filter((c) => c.type === "literacy").slice(0, 3).map((c) => c.id),
  communityNewsIds: CONTENTS.filter((c) => c.type === "news").slice(3, 6).map((c) => c.id),
  sections: {
    banner: true, today: true, utilities: true, neighborhoods: true,
    literacy: true, news: true, about: true,
  },
};

export const ORG: OrgSettings = {
  name: "UBND phường Xuân Hoà",
  address: "Số 1 Đường Xuân Hoà, Phường Xuân Hoà, TP. Hồ Chí Minh",
  phone: "02513123456",
  email: "ubnd@xuanhoa.gov.vn",
  zaloOA: "Xuân Hoà Số",
  fanpage: "facebook.com/xuanhoaso",
  website: "xuanhoa.gov.vn",
  copyright: "© 2026 UBND phường Xuân Hoà",
};

export const FEEDBACK_FIELDS = FIELDS;
export const CONTENT_TYPE_LABEL: Record<string, string> = {
  news: "Tin tức", announcement: "Thông báo", event: "Lịch hoạt động",
  banner: "Banner", literacy: "Bình dân học vụ số",
};

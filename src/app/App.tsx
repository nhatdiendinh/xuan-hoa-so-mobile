import { useState, useRef, useEffect, type ReactNode } from "react";
import {
  Bell, ChevronLeft, ChevronRight, Search, Send, Phone,
  Home, MessageSquare, Grid3X3, User, Camera,
  Check, Clock, AlertCircle, Bot, Building2, Megaphone,
  Plus, X, ArrowRight, CheckCircle2, Info, Headphones,
  Edit3, ChevronDown, RefreshCw, Users, MapPin, Star,
  Mic, Settings, FileText, Navigation, GraduationCap, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logoXuanHoa from "./assets/logo-xuan-hoa.png";
import robotAssistant from "./assets/robot-assistant.png";
import iconKhuPho from "./assets/icon-khu-pho.png";
import iconPhanAnh from "./assets/icon-phan-anh.png";
import bannerXuanHoa from "./assets/banner-xuan-hoa-so-1.jpg";
import bannerXuanHoa2 from "./assets/banner-xuan-hoa-so-2.jpg";
import bannerXuanHoa3 from "./assets/banner-xuan-hoa-so-3.jpg";
import newsHoiNghi from "./assets/news-hoi-nghi.jpg";
import newsToDanPho from "./assets/news-to-dan-pho-tu-quan.jpg";
import newsVeSinh from "./assets/news-ve-sinh-moi-truong.jpg";

// ─── TYPES ──────────────────────────────────────────────────────────────────
type Screen =
  | "home" | "assistant" | "chat" | "neighborhood" | "detail" | "news" | "news-list"
  | "post" | "feedback" | "feedback-form" | "feedback-track"
  | "notifications" | "profile" | "utilities";
type TabName = "home" | "notifications" | "utilities" | "profile";

// ─── DATA ────────────────────────────────────────────────────────────────────
const BANNERS = [
  {
    id: 1,
    kicker: "CHÀO MỪNG ĐẾN VỚI",
    title: "XUÂN HOÀ SỐ",
    tagline: "Kết nối - Chia sẻ - Phát triển",
    image: bannerXuanHoa,
    plain: true,
  },
  {
    id: 2,
    kicker: "XUÂN HOÀ SỐ",
    title: "ĐƯA CHÍNH QUYỀN GẦN HƠN VỚI NGƯỜI DÂN",
    tagline: "Nhanh - Chính xác - Thân thiện",
    image: bannerXuanHoa2,
    plain: true,
  },
  {
    id: 3,
    kicker: "CHUYỂN ĐỔI SỐ",
    title: "ĐÔ THỊ THÔNG MINH",
    tagline: "Xây dựng chính quyền số",
    image: bannerXuanHoa3,
    plain: true,
  },
];

const TICKER_ITEMS = [
  { text: "📢 Lịch tiếp dân tháng 8/2024: Thứ 3 và Thứ 5 hàng tuần từ 7:30–11:30", newsId: 1 },
  { text: "🔔 Thông báo nộp thuế đất định kỳ quý III/2024 đến ngày 31/08", newsId: 3 },
  { text: "✅ Khai trương Cổng dịch vụ công trực tuyến phường Xuân Hoà", newsId: 1 },
  { text: "🌟 Phường Xuân Hoà đạt danh hiệu Đô thị văn minh năm 2024", newsId: 2 },
  { text: "📌 Hội nghị phong trào toàn dân bảo vệ an ninh Tổ quốc tháng 8", newsId: 2 },
];

const NEWS = [
  {
    id: 1,
    title: "UBND phường Xuân Hoà tổ chức Hội nghị triển khai nhiệm vụ 6 tháng cuối năm 2024",
    time: "2 giờ trước",
    image: newsHoiNghi,
    category: "Hoạt động",
    views: 342,
    status: "approved",
    hoodId: 3,
    author: "Ban Biên tập phường Xuân Hoà",
    body: [
      "Sáng nay, UBND phường Xuân Hoà đã tổ chức Hội nghị triển khai nhiệm vụ phát triển kinh tế – xã hội 6 tháng cuối năm 2024 với sự tham dự của lãnh đạo phường, trưởng các khu phố và đại diện các tổ chức đoàn thể trên địa bàn.",
      "Hội nghị đánh giá kết quả thực hiện 6 tháng đầu năm: thu ngân sách đạt 58% kế hoạch, tỷ lệ hồ sơ hành chính giải quyết đúng hạn đạt 98,6%, công tác chỉnh trang đô thị và vệ sinh môi trường có nhiều chuyển biến tích cực.",
      "Trong 6 tháng cuối năm, phường xác định ba nhiệm vụ trọng tâm: đẩy mạnh chuyển đổi số trong giải quyết thủ tục hành chính, hoàn thiện mô hình khu phố số, và tăng cường tiếp nhận – xử lý phản ánh kiến nghị của người dân qua ứng dụng Xuân Hoà Số.",
      "Lãnh đạo phường đề nghị các khu phố chủ động tuyên truyền để người dân cài đặt và sử dụng ứng dụng, xem đây là kênh thông tin chính thức giữa chính quyền và nhân dân.",
    ],
  },
  {
    id: 2,
    title: "Ra mắt mô hình Tổ dân phố tự quản về trật tự đô thị và vệ sinh môi trường",
    time: "5 giờ trước",
    image: newsToDanPho,
    category: "Thông báo",
    views: 218,
    status: "approved",
    hoodId: 7,
    author: "Ban điều hành Khu phố 7",
    body: [
      "Khu phố 7 vừa chính thức ra mắt mô hình Tổ dân phố tự quản về trật tự đô thị và vệ sinh môi trường, với 12 thành viên là đại diện các hộ gia đình tiêu biểu trên địa bàn.",
      "Tổ tự quản có nhiệm vụ nhắc nhở, vận động người dân không lấn chiếm lòng lề đường, bỏ rác đúng giờ và đúng nơi quy định, đồng thời phản ánh kịp thời các trường hợp vi phạm đến Ban điều hành khu phố.",
      "Sau một tháng thí điểm, tình trạng đổ rác không đúng giờ tại khu vực đã giảm rõ rệt. Mô hình dự kiến được nhân rộng ra các khu phố khác trong quý IV/2024.",
    ],
  },
  {
    id: 3,
    title: "Thông báo lịch vệ sinh môi trường tháng 8/2024 trên địa bàn phường Xuân Hoà",
    time: "1 ngày trước",
    image: newsVeSinh,
    category: "Thông báo",
    views: 156,
    status: "pending",
    hoodId: 12,
    author: "UBND phường Xuân Hoà",
    body: [
      "UBND phường Xuân Hoà thông báo lịch ra quân tổng vệ sinh môi trường tháng 8/2024 trên toàn địa bàn phường.",
      "Thời gian: từ 7h00 sáng Chủ nhật hàng tuần. Địa điểm tập trung: nhà văn hoá của từng khu phố. Nội dung: phát quang bụi rậm, khơi thông cống rãnh, thu gom rác thải tại các điểm đen về môi trường.",
      "Đề nghị Ban điều hành các khu phố thông báo rộng rãi đến từng hộ gia đình, vận động mỗi hộ cử ít nhất một thành viên tham gia.",
    ],
  },
];

// ─── Lịch thu gom rác theo khu phố ──────────────────────────────────────────
const WASTE_SCHEDULE = Array.from({ length: 18 }, (_, i) => ({
  id: `ws-${i + 1}`,
  hoodId: i + 1,
  route: `Đường số ${i + 1} và các hẻm nhánh`,
  days: i % 3 === 0 ? "Thứ 2, Thứ 4, Thứ 6" : i % 3 === 1 ? "Thứ 3, Thứ 5, Thứ 7" : "Thứ 2, Thứ 5",
  time: i % 2 === 0 ? "05:00 - 07:00" : "17:00 - 19:00",
  type: i % 3 === 0 ? "Rác sinh hoạt" : i % 3 === 1 ? "Rác tái chế" : "Rác cồng kềnh",
  provider: "Công ty Dịch vụ công ích",
}));

// ─── Học vụ số (Bình dân học vụ số) ───────────────────────────────────────
const LITERACY_TOPICS = [
  {
    id: "dl-1",
    title: "Dịch vụ công trực tuyến",
    desc: "Hướng dẫn nộp hồ sơ, tra cứu kết quả và thanh toán trực tuyến.",
    icon: "FileText",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=450&fit=crop&auto=format",
    author: "UBND phường Xuân Hoà",
    body: [
      "Dịch vụ công trực tuyến toàn trình cho phép người dân nộp hồ sơ, theo dõi tiến độ và nhận kết quả hoàn toàn qua mạng, không cần đến trực tiếp trụ sở.",
      "Các bước thực hiện: đăng nhập Cổng dịch vụ công bằng tài khoản VNeID mức độ 2; chọn đúng thủ tục cần làm; điền tờ khai và tải lên bản chụp giấy tờ; nộp lệ phí trực tuyến nếu có rồi bấm gửi hồ sơ.",
      "Sau khi nộp, theo dõi trạng thái trong mục Hồ sơ đã nộp. Khi có kết quả, hệ thống gửi thông báo và người dân chọn nhận bản điện tử hoặc qua bưu chính.",
      "Cần hỗ trợ, người dân liên hệ bộ phận tiếp nhận hồ sơ của UBND phường Xuân Hoà trong giờ hành chính.",
    ],
  },
  {
    id: "dl-2",
    title: "Kỹ năng sử dụng điện thoại",
    desc: "Cài đặt ứng dụng, quét mã QR, gọi video và sử dụng các tiện ích cơ bản.",
    icon: "Smartphone",
    image: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=450&fit=crop&auto=format",
    author: "Tổ công nghệ số cộng đồng",
    body: [
      "Cài đặt ứng dụng: mở CH Play trên máy Android hoặc App Store trên iPhone, gõ tên ứng dụng cần tìm rồi bấm Cài đặt. Chỉ cài từ hai kho chính thức này, không cài qua đường dẫn lạ.",
      "Quét mã QR: mở ứng dụng Camera, đưa khung hình vào mã QR và chờ điện thoại hiện đường dẫn. Đọc kỹ nội dung hiện ra trước khi bấm mở.",
      "Gọi video: dùng Zalo hoặc Messenger, chọn người thân trong danh bạ rồi bấm biểu tượng máy quay. Nên dùng wifi để hình ảnh mượt và tiết kiệm dữ liệu.",
      "Một số tiện ích cơ bản khác: phóng to chữ trong phần Cài đặt - Màn hình, bật trợ lý giọng nói để đọc tin nhắn, và sao lưu ảnh lên tài khoản để không mất khi hỏng máy.",
    ],
  },
  {
    id: "dl-3",
    title: "Thanh toán không tiền mặt",
    desc: "Hướng dẫn chuyển khoản, thanh toán hoá đơn và sử dụng ví điện tử an toàn.",
    icon: "Wallet",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=450&fit=crop&auto=format",
    author: "UBND phường Xuân Hoà",
    body: [
      "Thanh toán không tiền mặt giúp mua sắm, đóng tiền điện nước nhanh chóng và hạn chế rủi ro mang theo tiền mặt.",
      "Chuyển khoản: mở ứng dụng ngân hàng, chọn Chuyển tiền, nhập số tài khoản người nhận, kiểm tra kỹ tên hiển thị rồi mới xác nhận bằng mật khẩu hoặc vân tay.",
      "Thanh toán hoá đơn điện, nước, internet: chọn mục Thanh toán hoá đơn, nhập mã khách hàng ghi trên giấy báo, hệ thống sẽ hiện số tiền cần trả.",
      "An toàn khi dùng ví điện tử: đặt hạn mức giao dịch thấp, bật xác thực sinh trắc học, không lưu mật khẩu trên máy và luôn giữ lại biên lai điện tử.",
    ],
  },
  {
    id: "dl-4",
    title: "An toàn trên mạng",
    desc: "Nhận biết cuộc gọi giả mạo, đường link lừa đảo và bảo vệ thông tin cá nhân.",
    icon: "ShieldCheck",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop&auto=format",
    author: "Công an phường Xuân Hoà",
    body: [
      "Xuất hiện nhiều cuộc gọi mạo danh cán bộ công an, toà án, nhân viên điện lực hoặc ngân hàng để yêu cầu người dân chuyển tiền hoặc cung cấp mã OTP.",
      "Nguyên tắc chung: cơ quan nhà nước không bao giờ yêu cầu chuyển tiền qua điện thoại và không hỏi mã OTP. Tuyệt đối không bấm vào đường dẫn lạ trong tin nhắn.",
      "Bảo vệ thông tin cá nhân: không chia sẻ ảnh chụp căn cước, không đăng số điện thoại và địa chỉ công khai trên mạng xã hội, đặt mật khẩu khác nhau cho từng tài khoản quan trọng.",
      "Khi nghi ngờ, hãy tắt máy và liên hệ trực tiếp UBND phường hoặc công an khu vực để xác minh trước khi làm theo bất kỳ yêu cầu nào.",
    ],
  },
  {
    id: "dl-5",
    title: "Trí tuệ nhân tạo",
    desc: "Hướng dẫn sử dụng ChatGPT, Gemini và các công cụ AI phục vụ đời sống.",
    icon: "Bot",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=450&fit=crop&auto=format",
    author: "Tổ công nghệ số cộng đồng",
    body: [
      "Trí tuệ nhân tạo là công cụ trả lời câu hỏi, soạn văn bản, dịch thuật và tóm tắt thông tin. Người dân có thể dùng miễn phí ChatGPT, Gemini hoặc trợ lý ảo ngay trong ứng dụng Xuân Hoà Số.",
      "Cách dùng cơ bản: mở ứng dụng, gõ hoặc nói câu hỏi bằng tiếng Việt càng rõ ràng càng tốt. Ví dụ: soạn giúp tôi đơn xin xác nhận cư trú, hoặc tóm tắt nội dung thông báo này.",
      "Ứng dụng trong đời sống: soạn đơn từ, tra cứu thủ tục, dịch tài liệu, gợi ý thực đơn, hướng dẫn sử dụng thiết bị trong nhà.",
      "Lưu ý quan trọng: không cung cấp thông tin cá nhân, số tài khoản hay mật khẩu cho công cụ AI, và luôn kiểm tra lại thông tin quan trọng với nguồn chính thức trước khi sử dụng.",
    ],
  },
  {
    id: "dl-6",
    title: "Tiện ích số địa phương",
    desc: "Hướng dẫn sử dụng Xuân Hoà Số, gửi phản ánh và tra cứu thông tin khu phố.",
    icon: "MapPinned",
    image: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=450&fit=crop&auto=format",
    author: "UBND phường Xuân Hoà",
    body: [
      "Ứng dụng Xuân Hoà Số là kênh thông tin chính thức giữa chính quyền phường và người dân, hoạt động ngay trên Zalo, không cần cài thêm ứng dụng.",
      "Khai báo hộ gia đình một lần ở mục Khu phố số để hệ thống xác định bạn thuộc khu phố nào, sau đó thông tin sẽ tự điền khi gửi phản ánh.",
      "Gửi phản ánh: chọn nhóm phản ánh, mô tả sự việc, bấm lấy vị trí hiện tại hoặc nhập địa chỉ, đính kèm tối đa 4 ảnh rồi gửi. Mỗi phản ánh có mã riêng để theo dõi tiến độ xử lý.",
      "Tra cứu thông tin khu phố: xem ban điều hành, tin tức, lịch thu gom rác và các phản ánh đang xử lý của khu phố mình cũng như các khu phố khác.",
    ],
  },
];

const LITERACY = LITERACY_TOPICS.map((t, i) => ({
  id: t.id,
  title: t.title,
  topic: t.desc,
  news: {
    id: 100 + i + 1,
    title: t.title,
    time: `${i + 1} ngày trước`,
    image: t.image,
    category: "Học vụ số",
    views: 300 + i * 87,
    status: "approved",
    hoodId: 1,
    author: t.author,
    body: t.body,
  },
}));

const FEEDBACKS = [
  { id: "PK001", type: "Khác", content: "Đường Nguyễn Văn Linh đoạn qua KP 3 bị lún sụt nghiêm trọng, cần sửa chữa gấp", status: "processing" as const, date: "28/07/2024", address: "Đường Nguyễn Văn Linh, KP 3" },
  { id: "PK002", type: "Điện - Nước", content: "Đèn đường trước số nhà 45/3 KP 7 bị hỏng từ 2 tuần nay, đề nghị sửa chữa", status: "completed" as const, date: "20/07/2024", address: "45/3 Đường Xuân Hoà, KP 7" },
  { id: "PK003", type: "Môi trường", content: "Bãi rác tự phát hình thành tại cuối đường số 12, cần xử lý dứt điểm", status: "received" as const, date: "30/07/2024", address: "Cuối đường số 12, KP 12" },
];

const LEADER_NAMES = [
  "Nguyễn Văn Hùng","Trần Thị Mai","Lê Minh Tuấn","Phạm Văn Đức",
  "Võ Thị Hoa","Đặng Minh Khoa","Bùi Thị Lan","Hoàng Văn Nam",
  "Ngô Thị Thu","Đinh Văn Phong","Lý Thị Quỳnh","Vũ Minh Sơn",
  "Trương Thị Tâm","Phan Văn Uy","Mai Thị Vân","Đỗ Văn Xuân",
  "Cao Thị Yên","Lâm Văn Phúc",
];

const HOOD_IMGS = [
  "photo-1582407947304-fd86f028f716","photo-1486325212027-8081e485255e",
  "photo-1477959858617-67f85cf4f1df","photo-1451187580459-43490279c0fa",
  "photo-1529156069898-49953e39b3ac","photo-1466611653911-95081537e5b7",
  "photo-1449824913935-59a10b8d2000","photo-1519501025264-65ba15a82390",
];

const NEIGHBORHOODS = Array.from({ length: 18 }, (_, i) => {
  const leader = LEADER_NAMES[i];
  const img = HOOD_IMGS[i % HOOD_IMGS.length];
  return {
    id: i + 1,
    name: `Khu phố ${i + 1}`,
    population: 800 + ((i * 47) % 600),
    households: 200 + ((i * 31) % 200),
    leader,
    phone: `09${String((10 + i * 3) % 90).padStart(2, "0")}.${String((100 + i * 37) % 900 + 100).padStart(3, "0")}.${String((200 + i * 53) % 800 + 100).padStart(3, "0")}`,
    image: `https://images.unsplash.com/${img}?w=400&h=200&fit=crop&auto=format`,
    board: [
      { name: leader, role: "Trưởng khu phố", phone: `09${String((10+i*3)%90).padStart(2,"0")}.${String((100+i*37)%900+100).padStart(3,"0")}.${String((200+i*53)%800+100).padStart(3,"0")}` },
      { name: LEADER_NAMES[(i+1)%18], role: "Phó trưởng khu phố", phone: `09${String((20+i*2)%80+10).padStart(2,"0")}.${String((200+i*17)%800+100).padStart(3,"0")}.${String((300+i*41)%700+100).padStart(3,"0")}` },
      { name: LEADER_NAMES[(i+2)%18], role: "Thư ký", phone: `09${String((30+i*4)%70+20).padStart(2,"0")}.${String((300+i*23)%700+100).padStart(3,"0")}.${String((400+i*29)%600+100).padStart(3,"0")}` },
    ],
    households_list: Array.from({ length: 5 }, (_, j) => ({
      id: j + 1,
      representative: `${["Nguyễn","Trần","Lê","Phạm","Võ"][j]} Văn ${["An","Bình","Cường","Dũng","Em"][j]}`,
      phone: `09${i%9+1}0.${String(111+j*111).padStart(3,"0")}.${String(222+j*111).padStart(3,"0")}`,
      address: `${(j+1)*12+i}/3 Đường số ${i+1}, KP ${i+1}`,
      members: 2 + (j % 4),
    })),
  };
});

const SUGGESTED = {
  public: [
    "Thủ tục đăng ký thường trú?",
    "Cấp phép xây dựng nhà ở?",
    "Đăng ký khai sinh cho trẻ em?",
    "Chứng thực giấy tờ cá nhân?",
    "Điều kiện nhập khẩu hộ gia đình?",
  ],
  planning: [
    "Quy hoạch tổng thể phường Xuân Hoà?",
    "Chỉ giới đường đỏ khu vực nào?",
    "Đất nhà tôi có thuộc diện quy hoạch?",
    "Hệ số sử dụng đất khu dân cư?",
    "Dự án giao thông sắp triển khai?",
  ],
};

const FEEDBACK_TYPES = [
  "Môi trường","An ninh trật tự","Điện - Nước","Tiếng ồn","Khác",
];

const BOT_ANSWERS: Record<string, string> = {
  "Thủ tục đăng ký thường trú?": "Để đăng ký thường trú, bạn cần chuẩn bị: (1) CCCD/CMND bản gốc còn hiệu lực, (2) Giấy tờ chứng minh chỗ ở hợp pháp (sổ hồng hoặc hợp đồng thuê nhà), (3) Đơn đề nghị đăng ký thường trú theo mẫu CT01. Thời gian giải quyết: 7 ngày làm việc kể từ ngày nhận đủ hồ sơ.",
  "Cấp phép xây dựng nhà ở?": "Hồ sơ xin cấp phép xây dựng nhà ở gồm: (1) Đơn đề nghị cấp phép xây dựng, (2) Sổ đỏ/sổ hồng, (3) Bản vẽ thiết kế kiến trúc có chứng chỉ hành nghề, (4) Giấy tờ chứng minh quyền sử dụng đất. Thời gian: 15 ngày làm việc.",
  "Quy hoạch tổng thể phường Xuân Hoà?": "Theo đồ án quy hoạch phân khu được UBND TP. Hồ Chí Minh phê duyệt, phường Xuân Hoà được định hướng phát triển thành đô thị xanh, thông minh với các khu chức năng: khu dân cư, khu thương mại dịch vụ, hành lang xanh ven kênh và khu công viên đô thị.",
  "Đăng ký khai sinh cho trẻ em?": "Hồ sơ đăng ký khai sinh gồm: (1) Giấy chứng sinh do bệnh viện cấp, (2) CCCD của cha và mẹ, (3) Giấy đăng ký kết hôn (nếu có), (4) Tờ khai đăng ký khai sinh theo mẫu. Đăng ký trong vòng 60 ngày kể từ ngày sinh. Miễn phí lệ phí.",
};

// ─── HOUSEHOLD REGISTRATION (khai báo hộ) ────────────────────────────────────
type Household = { name: string; phone: string; address: string; hoodId: number };
const HH_KEY = "xhs_household";

function loadHousehold(): Household | null {
  try {
    const raw = localStorage.getItem(HH_KEY);
    return raw ? (JSON.parse(raw) as Household) : null;
  } catch { return null; }
}
function saveHousehold(h: Household | null) {
  try {
    if (h) localStorage.setItem(HH_KEY, JSON.stringify(h));
    else localStorage.removeItem(HH_KEY);
  } catch { /* ignore */ }
}

/** Tài khoản Zalo - Mini App tự đăng nhập 1 chạm, lấy sẵn SĐT từ Zalo */
const ZALO_USER = {
  name: "Người dùng Zalo",
  phone: "0901 234 567",
  zaloId: "zl_8842019",
};

const HH_LISTENERS = new Set<() => void>();
/** Dùng chung cho mọi màn hình: khai báo ở đâu cũng cập nhật ngay ở nơi khác */
function useHousehold(): [Household | null, (h: Household | null) => void] {
  const [h, setH] = useState<Household | null>(() => loadHousehold());
  useEffect(() => {
    const cb = () => setH(loadHousehold());
    HH_LISTENERS.add(cb);
    return () => { HH_LISTENERS.delete(cb); };
  }, []);
  const update = (next: Household | null) => {
    saveHousehold(next);
    HH_LISTENERS.forEach((f) => f());
  };
  return [h, update];
}
/** Nhận diện khu phố từ địa chỉ: "KP 7", "khu phố 12", "kp.3"... */
function detectHoodId(address: string): number | null {
  const m = address.match(/(?:kp|khu\s*ph[ốôóo])\s*\.?\s*(\d{1,2})/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n >= 1 && n <= NEIGHBORHOODS.length ? n : null;
}

const newsById = (id: number) => NEWS.find((n) => n.id === id) ?? NEWS[0];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const statusColor = (s: string) =>
  ({ received: "bg-amber-100 text-amber-700", processing: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700" }[s] ?? "bg-gray-100 text-gray-600");
const statusLabel = (s: string) =>
  ({ received: "Tiếp nhận", processing: "Đang xử lý", completed: "Hoàn thành" }[s] ?? s);

// ─── BASE COMPONENTS ─────────────────────────────────────────────────────────
function StatusBar() {
  const now = new Date();
  const t = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  return (
    <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-bold text-white bg-[#1565C0] select-none shrink-0">
      <span>{t}</span>
      <div className="flex items-center gap-1.5">
        <svg width="15" height="11" viewBox="0 0 15 11" fill="white">
          <rect x="0" y="5" width="3" height="6" rx="0.5" opacity="0.4" />
          <rect x="4" y="3" width="3" height="8" rx="0.5" opacity="0.65" />
          <rect x="8" y="1" width="3" height="10" rx="0.5" opacity="0.85" />
          <rect x="12" y="0" width="3" height="11" rx="0.5" />
        </svg>
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
          <rect x="0.5" y="0.5" width="18" height="10" rx="2" stroke="white" strokeWidth="1.2" />
          <rect x="19" y="3" width="3" height="5" rx="1" fill="white" />
          <rect x="1.5" y="1.5" width="14" height="8" rx="1.5" fill="white" />
        </svg>
      </div>
    </div>
  );
}

function AppHeader({
  title, onBack, right, blue = true,
}: {
  title?: string; onBack?: () => void; right?: ReactNode; blue?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 shrink-0 ${blue ? "bg-[#1565C0]" : "bg-white border-b border-gray-100"}`}>
      <div className="w-8">
        {onBack && (
          <button onClick={onBack} className={`p-1 -ml-1 rounded-full active:opacity-60 ${blue ? "text-white" : "text-gray-700"}`}>
            <ChevronLeft size={22} />
          </button>
        )}
      </div>
      <h2 className={`text-[15px] font-bold flex-1 text-center ${blue ? "text-white" : "text-gray-800"}`}>{title}</h2>
      <div className="w-8 flex justify-end">{right}</div>
    </div>
  );
}

function BottomNav({ active, onNavigate }: { active: TabName; onNavigate: (t: TabName) => void }) {
  const tabs: { id: TabName; label: string; Icon: typeof Home }[] = [
    { id: "home", label: "Trang chủ", Icon: Home },
    { id: "notifications", label: "Thông báo", Icon: Bell },
    { id: "utilities", label: "Tiện ích", Icon: Grid3X3 },
    { id: "profile", label: "Cá nhân", Icon: User },
  ];
  return (
    <div className="flex border-t border-gray-100 bg-white shrink-0">
      {tabs.map(({ id, label, Icon }) => (
        <button key={id} onClick={() => onNavigate(id)}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors active:opacity-60 ${active === id ? "text-[#1565C0]" : "text-gray-400"}`}>
          <Icon size={20} />
          <span className="text-[9.5px] font-semibold">{label}</span>
          {active === id && <div className="w-1 h-1 rounded-full bg-[#1565C0]" />}
        </button>
      ))}
    </div>
  );
}

function LoadingSpinner({ text = "Đang tải..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <RefreshCw size={26} className="text-[#1565C0] animate-spin" />
      <span className="text-sm text-gray-400">{text}</span>
    </div>
  );
}

function EmptyState({ icon, text, sub }: { icon: ReactNode; text: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-2.5">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-200">{icon}</div>
      <p className="text-[13px] font-semibold text-gray-500">{text}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}

// ─── ROBOT ICON (trợ lý ảo) ──────────────────────────────────────────────────
function RobotIcon({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <img src={robotAssistant} alt="Trợ lý ảo" width={size} height={size}
      className={`object-contain ${className}`} style={{ width: size, height: size }} />
  );
}

// ─── LOCATION BUTTON ─────────────────────────────────────────────────────────
async function fetchJson(url: string, ms = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    return await res.json();
  } finally { clearTimeout(timer); }
}

function LocateButton({ onLocated, className = "" }: { onLocated: (addr: string) => void; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const doneRef = useRef(false);
  const watchRef = useRef<number | null>(null);

  const stopWatch = () => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
  };

  const reverse = async (lat: number, lon: number) => {
    try {
      const d = await fetchJson(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=vi`
      );
      return (d?.display_name as string) || "";
    } catch { return ""; }
  };

  const finish = async (pos: GeolocationPosition) => {
    if (doneRef.current) return;
    doneRef.current = true;
    stopWatch();
    const { latitude: lat, longitude: lon, accuracy } = pos.coords;
    const acc = accuracy ? ` (±${Math.round(accuracy)}m)` : "";
    onLocated(`Toạ độ: ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
    setOk(`Đã lấy vị trí hiện tại thành công${acc}`);
    setBusy(false);
    const addr = await reverse(lat, lon);
    if (addr) { onLocated(addr); setOk(`Đã lấy vị trí hiện tại thành công${acc}`); }
    else setOk(`Đã lấy vị trí hiện tại thành công${acc} - vui lòng bổ sung số nhà, tên đường`);
  };

  /** Dự phòng: định vị theo mạng, thử lần lượt nhiều nhà cung cấp */
  const fallbackByIp = async (reason: string) => {
    const providers: { url: string; pick: (d: any) => { lat?: number; lon?: number; label?: string } }[] = [
      { url: "https://ipwho.is/", pick: (d) => ({ lat: d?.latitude, lon: d?.longitude, label: [d?.city, d?.region, d?.country].filter(Boolean).join(", ") }) },
      { url: "https://get.geojs.io/v1/ip/geo.json", pick: (d) => ({ lat: Number(d?.latitude), lon: Number(d?.longitude), label: [d?.city, d?.region, d?.country].filter(Boolean).join(", ") }) },
      { url: "https://ipapi.co/json/", pick: (d) => ({ lat: d?.latitude, lon: d?.longitude, label: [d?.city, d?.region, d?.country_name].filter(Boolean).join(", ") }) },
    ];
    for (const p of providers) {
      try {
        const { lat, lon, label } = p.pick(await fetchJson(p.url, 7000));
        if (lat && lon) {
          const addr = (await reverse(lat, lon)) || label || `Toạ độ: ${lat}, ${lon}`;
          onLocated(addr);
          setOk("Đã lấy vị trí theo mạng (tương đối) - vui lòng bổ sung số nhà, tên đường");
          setBusy(false);
          return true;
        }
      } catch { /* thử nhà cung cấp kế tiếp */ }
    }
    setBusy(false);
    setErr(reason);
    return false;
  };

  const fail = (e: GeolocationPositionError) => {
    if (doneRef.current) return;
    doneRef.current = true;
    stopWatch();
    void fallbackByIp(
      e.code === e.PERMISSION_DENIED
        ? "Trình duyệt đang chặn quyền vị trí. Bấm biểu tượng ổ khoá trên thanh địa chỉ → cho phép Vị trí."
        : "Không lấy được GPS. Kiểm tra Dịch vụ vị trí của máy đã bật cho trình duyệt, rồi thử lại."
    );
  };

  const locate = () => {
    setErr(""); setOk(""); doneRef.current = false; setBusy(true);

    const secure = typeof window === "undefined" || window.isSecureContext !== false;
    if (!("geolocation" in navigator) || !secure) {
      void fallbackByIp(
        !secure
          ? "Trình duyệt chỉ cho phép định vị GPS trên HTTPS hoặc localhost."
          : "Thiết bị không hỗ trợ định vị GPS."
      );
      return;
    }

    // watchPosition bám vị trí liên tục - đáng tin hơn getCurrentPosition trên máy tính
    watchRef.current = navigator.geolocation.watchPosition(
      finish,
      (e) => { if (e.code === e.PERMISSION_DENIED) fail(e); },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 30000 }
    );

    // Song song: thử một phát getCurrentPosition ở chế độ nhẹ
    navigator.geolocation.getCurrentPosition(finish, () => {}, {
      enableHighAccuracy: false, timeout: 25000, maximumAge: 300000,
    });

    // Hết 26s mà chưa có GPS -> chuyển sang định vị theo mạng
    setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      stopWatch();
      void fallbackByIp("Không lấy được GPS. Kiểm tra Dịch vụ vị trí của máy đã bật cho trình duyệt, rồi thử lại.");
    }, 26000);
  };

  useEffect(() => () => stopWatch(), []);

  return (
    <div className={className}>
      <button type="button" onClick={locate} disabled={busy}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#1565C0]/30 bg-blue-50 text-[#1565C0] text-[12px] font-bold active:bg-blue-100 disabled:opacity-60">
        {busy ? <RefreshCw size={14} className="animate-spin" /> : <Navigation size={14} />}
        {busy ? "Đang lấy vị trí..." : ok ? "Lấy lại vị trí" : "Lấy vị trí hiện tại"}
      </button>
      {ok && !busy && (
        <p className="mt-1.5 text-[11px] text-green-600 font-semibold flex items-start gap-1">
          <CheckCircle2 size={11} className="shrink-0 mt-0.5" /> {ok}
        </p>
      )}
      {err && !busy && (
        <p className="mt-1.5 text-[11px] text-red-600 flex items-start gap-1">
          <AlertCircle size={11} className="shrink-0 mt-0.5" /> {err}
        </p>
      )}
    </div>
  );
}

// ─── SCREEN: HOME ─────────────────────────────────────────────────────────────
function HomeScreen({ navigate }: { navigate: (s: Screen, p?: unknown) => void }) {
  const [bannerIdx, setBannerIdx] = useState(0);
  const [tickerIdx, setTickerIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER_ITEMS.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain bg-white" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div className="bg-white px-4 pt-2 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={logoXuanHoa} alt="Logo phường Xuân Hoà"
            className="w-11 h-11 rounded-full object-contain bg-white shrink-0" />
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold text-gray-900 leading-tight">Xuân Hoà Số</p>
            <p className="text-[11.5px] text-gray-500 leading-tight mt-0.5">Phường Xuân Hoà, TP. Hồ Chí Minh</p>
          </div>
        </div>
        <button onClick={() => navigate("notifications")} className="relative p-2 active:opacity-60">
          <Bell size={22} className="text-[#1565C0]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-white" />
        </button>
      </div>

      {/* Banner Carousel */}
      <div className="px-3">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-blue-900 shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div key={bannerIdx}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }} className="absolute inset-0">
              <img src={BANNERS[bannerIdx].image} alt={BANNERS[bannerIdx].title} className="w-full h-full object-cover" />
              {!BANNERS[bannerIdx].plain && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0D47A1]/70 via-[#0D47A1]/45 to-[#0D47A1]/70" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center">
                    <p className="text-white/85 text-[11px] font-semibold tracking-[0.18em]">{BANNERS[bannerIdx].kicker}</p>
                    <p className="text-white font-extrabold text-[26px] leading-tight tracking-wide mt-1 drop-shadow">{BANNERS[bannerIdx].title}</p>
                    <p className="text-white/90 text-[13px] italic mt-1.5">{BANNERS[bannerIdx].tagline}</p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex justify-center gap-1.5 items-center py-3">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => setBannerIdx(i)}
              className={`rounded-full transition-all ${i === bannerIdx ? "w-4 h-1.5 bg-[#1565C0]" : "w-1.5 h-1.5 bg-gray-300"}`} />
          ))}
        </div>
      </div>

      {/* 3 Main Utilities */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "assistant", icon: <RobotIcon size={62} />, grad: "", bare: true, label: "Trợ lý ảo" },
            { id: "neighborhood", icon: <img src={iconKhuPho} alt="Khu phố số" className="w-[62px] h-[62px] object-contain" />, grad: "", bare: true, label: "Khu phố số" },
            { id: "feedback", icon: <img src={iconPhanAnh} alt="Phản ánh kiến nghị" className="w-[58px] h-[58px] object-contain" />, grad: "", bare: true, label: "Phản ánh kiến nghị" },
          ].map((item) => (
            <button key={item.id} onClick={() => navigate(item.id as Screen)}
              className="flex flex-col items-center gap-2 active:scale-95 transition-transform">
              <div className={`w-[62px] h-[62px] flex items-center justify-center ${
                "bare" in item && item.bare ? "" : `rounded-[18px] bg-gradient-to-br ${item.grad} shadow-md`
              }`}>
                {item.icon}
              </div>
              <span className="text-[11.5px] font-semibold text-gray-700 text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Điểm tin */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[15px] font-extrabold text-gray-900">Điểm tin</h3>
          <button onClick={() => navigate("news-list")}
            className="text-[12px] text-[#1565C0] font-semibold flex items-center gap-0.5 active:opacity-60">
            Xem tất cả <ChevronRight size={13} />
          </button>
        </div>
        <button onClick={() => navigate("news", { news: newsById(TICKER_ITEMS[tickerIdx].newsId) })}
          className="w-full rounded-xl bg-white border border-gray-200 shadow-sm flex items-center gap-2 px-3 py-2.5 overflow-hidden active:bg-gray-50">
          <span className="text-[#1565C0] text-[15px] leading-none shrink-0">•</span>
          <AnimatePresence mode="wait">
            <motion.p key={tickerIdx}
              initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}
              transition={{ duration: 0.28 }}
              className="flex-1 text-[12px] text-gray-700 font-medium truncate text-left">
              {TICKER_ITEMS[tickerIdx].text}
            </motion.p>
          </AnimatePresence>
          <span className="shrink-0 bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wider">HOT</span>
        </button>
      </div>

      {/* Tin tức nổi bật */}
      <div className="px-4 pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[15px] font-extrabold text-gray-900">Tin tức nổi bật</h3>
          <button onClick={() => navigate("post")}
            className="w-8 h-8 rounded-full bg-[#1565C0] flex items-center justify-center shadow active:scale-90 transition-transform">
            <Edit3 size={14} className="text-white" />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {NEWS.map((item) => (
            <button key={item.id} onClick={() => navigate("news", { news: item })}
              className="w-full flex gap-3 py-3 text-left active:opacity-70">
              <img src={item.image} alt="" className="w-[104px] h-[72px] rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                <p className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2">{item.title}</p>
                <span className="text-[11px] text-gray-400">{item.time}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: ASSISTANT ───────────────────────────────────────────────────────
function AssistantScreen({ navigate }: { navigate: (s: Screen, p?: unknown) => void }) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FA]" style={{ scrollbarWidth: "none" }}>
      <div className="bg-gradient-to-b from-[#1565C0] to-[#1E88E5] px-4 pt-2 pb-10">
        <AppHeader title="Trợ lý ảo" onBack={() => navigate("home")} />
        <div className="flex flex-col items-center mt-1 gap-2">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", duration: 0.6 }}
            className="w-20 h-20 flex items-center justify-center">
            <RobotIcon size={80} className="drop-shadow-xl" />
          </motion.div>
          <p className="text-white font-extrabold text-[17px]">Trợ lý ảo Xuân Hoà</p>
          <p className="text-blue-100 text-[11.5px] text-center px-8 leading-relaxed">
            Hỏi đáp thông minh về thủ tục hành chính và thông tin quy hoạch đất đai
          </p>
        </div>
      </div>

      <div className="px-4 -mt-5 space-y-3">
        {[
          { type: "public", emoji: "🏛️", title: "Dịch vụ công", desc: "Tra cứu thủ tục hành chính, hướng dẫn nộp hồ sơ trực tuyến", grad: "from-[#1565C0] to-[#1976D2]" },
          { type: "planning", emoji: "🗺️", title: "Thông tin quy hoạch", desc: "Tra cứu quy hoạch đất đai, chỉ giới xây dựng, dự án hạ tầng", grad: "from-indigo-500 to-purple-600" },
        ].map((item) => (
          <button key={item.type} onClick={() => navigate("chat", { chatType: item.type })}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform text-left">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center text-3xl shadow-md shrink-0`}>
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-800 text-[14px]">{item.title}</p>
              <p className="text-gray-500 text-[12px] mt-0.5 leading-snug">{item.desc}</p>
            </div>
            <ChevronRight size={17} className="text-gray-300 shrink-0" />
          </button>
        ))}

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-[12px] font-bold text-[#1565C0] mb-3">💡 Câu hỏi thường gặp</p>
          {SUGGESTED.public.slice(0, 4).map((q, i) => (
            <button key={i} onClick={() => navigate("chat", { chatType: "public", initialQ: q })}
              className="w-full text-left py-2.5 border-b border-blue-100 last:border-0 text-[12px] text-gray-700 flex items-center gap-2.5 active:opacity-60">
              <span className="w-5 h-5 rounded-full bg-[#1565C0]/10 text-[#1565C0] text-[9px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: CHAT ────────────────────────────────────────────────────────────
function ChatScreen({ navigate, params }: { navigate: (s: Screen, p?: unknown) => void; params?: Record<string, unknown> }) {
  const chatType = (params?.chatType as string) ?? "public";
  const initialQ = (params?.initialQ as string) ?? "";
  const [messages, setMessages] = useState<{ id: number; role: "user" | "bot"; text: string }[]>([{
    id: 0, role: "bot",
    text: chatType === "public"
      ? "Xin chào! Tôi là trợ lý ảo phường Xuân Hoà. Bạn cần tư vấn về thủ tục hành chính nào?"
      : "Xin chào! Tôi có thể giúp bạn tra cứu thông tin quy hoạch đất đai tại phường Xuân Hoà.",
  }]);
  const [input, setInput] = useState(initialQ);
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((p) => [...p, { id: Date.now(), role: "user", text }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((p) => [...p, {
        id: Date.now() + 1, role: "bot",
        text: BOT_ANSWERS[text] ??
          "Cảm ơn câu hỏi của bạn! Để được hỗ trợ chính xác nhất, bạn vui lòng đến trực tiếp bộ phận tiếp nhận hồ sơ UBND phường Xuân Hoà (Thứ 2 – Thứ 6, 7:30–11:30 và 13:00–16:30) hoặc gọi: 02513.123.456.",
      }]);
    }, 1400);
  };

  const title = chatType === "public" ? "Dịch vụ công" : "Thông tin quy hoạch";

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title={title} onBack={() => navigate("assistant")} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ scrollbarWidth: "none" }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "bot" && (
              <div className="w-7 h-7 shrink-0 mt-0.5 flex items-center justify-center"><RobotIcon size={28} /></div>
            )}
            <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${
              msg.role === "user"
                ? "bg-[#1565C0] text-white rounded-br-sm"
                : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-2 items-end">
            <div className="w-7 h-7 flex items-center justify-center"><RobotIcon size={28} /></div>
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestion chips */}
      <div className="px-4 pb-2 shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          {SUGGESTED[chatType as keyof typeof SUGGESTED].map((q, i) => (
            <button key={i} onClick={() => setInput(q)}
              className="shrink-0 bg-blue-50 border border-blue-200 text-[#1565C0] text-[11px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap active:bg-blue-100">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex items-center gap-2 shrink-0">
        <button className="p-1.5 text-gray-400 active:opacity-60"><Mic size={17} /></button>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Nhập câu hỏi của bạn..."
          className="flex-1 bg-[#F5F7FA] rounded-full px-4 py-2 text-[12.5px] outline-none border border-gray-200 focus:border-[#1565C0] transition-colors" />
        <button onClick={send}
          className="w-9 h-9 rounded-full bg-[#1565C0] flex items-center justify-center active:scale-90 transition-transform shadow-sm">
          <Send size={14} className="text-white ml-0.5" />
        </button>
      </div>
    </div>
  );
}

// ─── SCREEN: NEIGHBORHOOD ────────────────────────────────────────────────────
function HouseholdForm({
  initial, onSubmit, onCancel,
}: { initial?: Household | null; onSubmit: (h: Household) => void; onCancel?: () => void }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [hoodId, setHoodId] = useState<number | "">(initial?.hoodId ?? "");
  const [touchedHood, setTouchedHood] = useState(!!initial);
  const [err, setErr] = useState("");

  // Tự nhận diện khu phố khi người dân nhập địa chỉ
  useEffect(() => {
    if (touchedHood) return;
    const id = detectHoodId(address);
    if (id) setHoodId(id);
  }, [address, touchedHood]);

  const detected = !touchedHood && detectHoodId(address) !== null;

  const submit = () => {
    if (!name.trim()) return setErr("Vui lòng nhập tên chủ hộ");
    if (!/^0\d{8,10}$/.test(phone.replace(/[\s.]/g, ""))) return setErr("Số điện thoại không hợp lệ (VD: 0901234567)");
    if (!address.trim()) return setErr("Vui lòng nhập địa chỉ");
    if (!hoodId) return setErr("Vui lòng chọn khu phố bạn đang sinh sống");
    setErr("");
    onSubmit({ name: name.trim(), phone: phone.trim(), address: address.trim(), hoodId: Number(hoodId) });
  };

  const label = "text-[12px] font-bold text-gray-700 mb-1.5 block";
  const input = "w-full bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-[13px] outline-none focus:border-[#1565C0] transition-colors";

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3.5 flex gap-2.5">
        <Info size={17} className="text-[#1565C0] shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-gray-600 leading-relaxed">
          Khai báo thông tin hộ gia đình để hệ thống xác định bạn thuộc khu phố nào và hiển thị thông tin khu phố của bạn.
          Bạn vẫn có thể xem thông tin của tất cả các khu phố khác.
        </p>
      </div>

      <div>
        <label className={label}>Tên chủ hộ <span className="text-red-500">*</span></label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Nguyễn Văn An" className={input} />
      </div>

      <div>
        <label className={label}>Số điện thoại <span className="text-red-500">*</span></label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel"
          placeholder="VD: 0901234567" className={input} />
      </div>

      <div>
        <label className={label}>Địa chỉ <span className="text-red-500">*</span></label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
          placeholder="VD: 45/3 Đường số 7, KP 7, Phường Xuân Hoà"
          className={input + " resize-none"} />
        <p className="text-[10.5px] text-gray-400 mt-1">Ghi rõ số khu phố (VD: KP 7) để hệ thống tự nhận diện.</p>
        <LocateButton className="mt-2" onLocated={setAddress} />
      </div>

      <div>
        <label className={label}>Khu phố <span className="text-red-500">*</span></label>
        <div className="relative">
          <select value={hoodId} onChange={(e) => { setTouchedHood(true); setHoodId(Number(e.target.value)); }}
            className={input + " appearance-none pr-9"}>
            <option value="">-- Chọn khu phố --</option>
            {NEIGHBORHOODS.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {detected && hoodId && (
          <p className="text-[11px] text-green-600 font-semibold mt-1.5 flex items-center gap-1">
            <CheckCircle2 size={12} /> Hệ thống tự nhận diện: {NEIGHBORHOODS[Number(hoodId) - 1].name}
          </p>
        )}
      </div>

      {err && (
        <div className="flex items-center gap-2 text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
          <AlertCircle size={14} className="shrink-0" /> {err}
        </div>
      )}

      <div className="flex gap-2.5 pt-1">
        {onCancel && (
          <button onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl border border-gray-200 bg-white text-[13px] font-bold text-gray-600 active:bg-gray-50">
            Huỷ
          </button>
        )}
        <button onClick={submit}
          className="flex-1 py-3.5 rounded-xl bg-[#1565C0] text-white text-[13px] font-bold shadow active:scale-[0.98] transition-transform">
          Xác nhận khai báo
        </button>
      </div>
    </div>
  );
}

function NeighborhoodScreen({ navigate }: { navigate: (s: Screen, p?: unknown) => void }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useHousehold();
  const [editing, setEditing] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  const myHood = household ? NEIGHBORHOODS[household.hoodId - 1] : null;

  const commit = (h: Household) => {
    setHousehold(h); setEditing(false);
    setJustSaved(true); setTimeout(() => setJustSaved(false), 2600);
  };

  const filtered = NEIGHBORHOODS.filter(
    (n) => n.name.toLowerCase().includes(query.toLowerCase()) || n.leader.toLowerCase().includes(query.toLowerCase())
  );
  const others = filtered.filter((n) => n.id !== household?.hoodId);
  const displayed = showAll ? others : others.slice(0, 18);

  const handleExpand = () => {
    setLoading(true);
    setTimeout(() => { setShowAll(true); setLoading(false); }, 500);
  };

  // ── Chưa khai báo → hiển thị form khai báo ──
  if (!household || editing) {
    return (
      <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
        <div className="bg-[#1565C0] shrink-0">
          <AppHeader title={editing ? "Cập nhật khai báo" : "Khai báo hộ gia đình"}
            onBack={() => (editing ? setEditing(false) : navigate("home"))} />
        </div>
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <HouseholdForm initial={editing ? household : null} onSubmit={commit}
            onCancel={editing ? () => setEditing(false) : undefined} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Khu phố số" onBack={() => navigate("home")} />
        <div className="px-4 pb-3">
          <div className="flex items-center bg-white/20 rounded-xl px-3 py-2.5 gap-2">
            <Search size={15} className="text-white/60" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm khu phố, tên trưởng khu phố..."
              className="flex-1 bg-transparent text-white placeholder-white/55 text-[13px] outline-none" />
            {query && (
              <button onClick={() => setQuery("")} className="text-white/70"><X size={14} /></button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: "none" }}>
        <AnimatePresence>
          {justSaved && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-3 flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3 py-2.5 text-[12px] font-semibold text-green-700">
              <CheckCircle2 size={15} /> Đã ghi nhận: bạn thuộc {myHood!.name}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Khu phố của tôi */}
        {myHood && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[13px] font-extrabold text-gray-800">Khu phố của tôi</h3>
              <button onClick={() => setEditing(true)}
                className="text-[11px] text-[#1565C0] font-semibold flex items-center gap-1 active:opacity-60">
                <Edit3 size={11} /> Sửa khai báo
              </button>
            </div>
            <motion.button whileTap={{ scale: 0.98 }} onClick={() => navigate("detail", { hood: myHood })}
              className="w-full text-left rounded-2xl overflow-hidden shadow-sm border border-[#1565C0]/25 bg-white">
              <div className="relative h-24">
                <img src={myHood.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D47A1]/85 to-[#0D47A1]/25" />
                <div className="absolute inset-0 px-3.5 flex flex-col justify-center">
                  <span className="text-[9.5px] font-extrabold tracking-wider text-white/80">KHU PHỐ CỦA BẠN</span>
                  <p className="text-white font-extrabold text-[19px] leading-tight">{myHood.name}</p>
                  <p className="text-white/85 text-[11px] mt-0.5">
                    {myHood.households} hộ · {myHood.population} nhân khẩu
                  </p>
                </div>
                <ChevronRight size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/90" />
              </div>
              <div className="p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-[12px] text-gray-700">
                  <User size={13} className="text-[#1565C0] shrink-0" />
                  <span className="font-semibold">{household.name}</span>
                  <span className="text-gray-400">· Chủ hộ</span>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-gray-600">
                  <Phone size={13} className="text-[#1565C0] shrink-0" /> {household.phone}
                </div>
                <div className="flex items-start gap-2 text-[12px] text-gray-600">
                  <MapPin size={13} className="text-[#1565C0] shrink-0 mt-0.5" />
                  <span className="leading-snug">{household.address}</span>
                </div>
                <div className="pt-1.5 mt-1 border-t border-gray-100 flex items-center gap-2 text-[12px] text-gray-600">
                  <Users size={13} className="text-[#1565C0] shrink-0" />
                  Trưởng khu phố: <span className="font-semibold text-gray-800">{myHood.leader}</span>
                </div>
              </div>
            </motion.button>
          </div>
        )}

        {loading ? <LoadingSpinner text="Đang tải danh sách khu phố..." /> : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-extrabold text-gray-800">
                Các khu phố khác <span className="font-medium text-gray-400">({others.length})</span>
              </h3>
              <span className="text-[11px] text-[#1565C0] font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">TP. Hồ Chí Minh</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {displayed.map((hood) => (
                <motion.button key={hood.id} onClick={() => navigate("detail", { hood })}
                  whileTap={{ scale: 0.94 }}
                  className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center gap-1.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center text-2xl">
                    🏘️
                  </div>
                  <span className="text-[11px] font-extrabold text-gray-800 text-center leading-tight">{hood.name}</span>
                  <span className="text-[9.5px] text-gray-400">{hood.households} hộ</span>
                </motion.button>
              ))}
            </div>

            {others.length > 18 && !showAll && (
              <button onClick={handleExpand}
                className="w-full mt-4 py-3.5 bg-white rounded-2xl border border-[#1565C0]/30 text-[#1565C0] text-[13px] font-bold flex items-center justify-center gap-2 active:bg-blue-50">
                <ChevronDown size={16} /> Xem thêm ({others.length - 18} khu phố)
              </button>
            )}

            {filtered.length === 0 && !loading && (
              <EmptyState icon={<Search size={26} />} text="Không tìm thấy khu phố" sub="Thử tìm kiếm với từ khoá khác" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── SCREEN: NEIGHBORHOOD DETAIL ─────────────────────────────────────────────
function NeighborhoodDetailScreen({ navigate, params }: { navigate: (s: Screen, p?: unknown) => void; params?: Record<string, unknown> }) {
  const hood = (params?.hood as typeof NEIGHBORHOODS[0]) ?? NEIGHBORHOODS[0];
  const [tab, setTab] = useState<"news" | "literacy" | "waste" | "feedback">("news");
  const [hSearch, setHSearch] = useState("");

  const hoodNews = NEWS.filter((n) => n.hoodId === hood.id);
  const hoodFeedbacks = FEEDBACKS.filter((f) => f.address.includes(`KP ${hood.id}`));
  const hoodWaste = WASTE_SCHEDULE.filter((w) => w.hoodId === hood.id);

  const filtered = hood.households_list.filter(
    (h) => h.representative.toLowerCase().includes(hSearch.toLowerCase()) || h.phone.includes(hSearch)
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5F7FA]" style={{ scrollbarWidth: "none" }}>
      {/* Cover */}
      <div className="relative h-40 bg-blue-900 shrink-0">
        <img src={hood.image} alt={hood.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 to-black/70" />
        <button onClick={() => navigate("neighborhood")}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/35 flex items-center justify-center backdrop-blur-sm active:opacity-60">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-white font-extrabold text-[19px] leading-tight">{hood.name}</h2>
          <p className="text-white/75 text-[11.5px] flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="shrink-0" /> Phường Xuân Hoà, TP. Hồ Chí Minh
          </p>
        </div>
      </div>

      {/* Stats card */}
      <div className="mx-4 mt-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-2 py-3.5 grid grid-cols-3">
        {[
          { Icon: Users, label: "Dân số", value: `${hood.population.toLocaleString()} người` },
          { Icon: Home, label: "Hộ gia đình", value: `${hood.households} hộ` },
          { Icon: MapPin, label: "Khu vực", value: "Nội ô" },
        ].map(({ Icon, label, value }) => (
          <div key={label} className="min-w-0 px-1.5 flex flex-col items-center gap-1 border-r border-gray-100 last:border-0">
            <Icon size={15} className="text-[#1565C0] shrink-0" />
            <span className="w-full text-[12.5px] font-extrabold text-gray-800 text-center leading-tight break-words">{value}</span>
            <span className="text-[9.5px] text-gray-400 text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* Management Board */}
      <div className="mx-4 mt-4">
        <h4 className="text-[13px] font-extrabold text-gray-800 mb-2.5">👥 Ban điều hành</h4>
        <div className="space-y-2">
          {hood.board.map((m, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                {m.name.split(" ").pop()![0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-800 truncate">{m.name}</p>
                <p className="text-[11px] text-gray-500">{m.role}</p>
                <p className="text-[11px] text-[#1565C0] font-medium">{m.phone}</p>
              </div>
              <a href={`tel:${m.phone}`}
                className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shadow-sm active:scale-90 transition-transform">
                <Phone size={15} className="text-white" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Households */}
      <div className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-[13px] font-extrabold text-gray-800">🏠 Quản lý hộ gia đình</h4>
          <span className="text-[11px] text-gray-400">{hood.households} hộ</span>
        </div>
        <div className="flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5 gap-2 mb-3">
          <Search size={13} className="text-gray-400" />
          <input value={hSearch} onChange={(e) => setHSearch(e.target.value)}
            placeholder="Tên đại diện hoặc số điện thoại..."
            className="flex-1 text-[12px] outline-none" />
          {hSearch && <button onClick={() => setHSearch("")} className="text-gray-400 active:opacity-60"><X size={12} /></button>}
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={<Users size={22} />} text="Không tìm thấy hộ gia đình" />
        ) : (
          <div className="space-y-1.5">
            {filtered.map((h) => (
              <div key={h.id} className="bg-white rounded-xl border border-gray-100 px-3 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Home size={13} className="text-[#1565C0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-bold text-gray-800">{h.representative}</p>
                  <p className="text-[10.5px] text-gray-400 truncate">{h.address}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11.5px] text-[#1565C0] font-semibold">{h.phone}</p>
                  <p className="text-[9.5px] text-gray-400">{h.members} thành viên</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mx-4 mt-4 mb-5">
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 gap-0.5">
          {(["news","literacy","waste","feedback"] as const).map((key) => {
            const labels = { news: "Tin tức", literacy: "Học vụ số", waste: "Lịch gom rác", feedback: "Phản ánh" };
            return (
              <button key={key} onClick={() => setTab(key)}
                className={`flex-1 py-1.5 rounded-lg text-[10.5px] font-bold transition-all ${tab === key ? "bg-[#1565C0] text-white shadow-sm" : "text-gray-500"}`}>
                {labels[key]}
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          {tab === "news" && (
            <div className="space-y-2">
              {hoodNews.map((n) => (
                <button key={n.id} onClick={() => navigate("news", { news: n, from: "detail", hood })}
                  className="w-full text-left bg-white rounded-xl p-3 border border-gray-100 flex gap-3 active:bg-gray-50">
                  <img src={n.image} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 line-clamp-2">{n.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={9} />{n.time}</p>
                  </div>
                  <ChevronRight size={15} className="text-gray-300 shrink-0 self-center" />
                </button>
              ))}
              {hoodNews.length === 0 && <EmptyState icon={<FileText size={24} />} text="Chưa có tin tức" sub="Tin của khu phố sẽ được cập nhật sớm" />}
            </div>
          )}
          {tab === "literacy" && (
            <div className="space-y-2">
              {LITERACY.map((l) => (
                <button key={l.id} onClick={() => navigate("news", { news: l.news, from: "detail", hood })}
                  className="w-full text-left bg-white rounded-xl p-3 border border-gray-100 flex gap-3 active:bg-gray-50">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <GraduationCap size={17} className="text-[#1565C0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 line-clamp-2">{l.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{l.topic}</p>
                  </div>
                  <ChevronRight size={15} className="text-gray-300 shrink-0 self-center" />
                </button>
              ))}
            </div>
          )}
          {tab === "waste" && (
            <div className="space-y-2">
              {hoodWaste.map((w) => (
                <div key={w.id} className="bg-white rounded-xl p-3 border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Trash2 size={15} className="text-emerald-600 shrink-0" />
                    <p className="text-[12.5px] font-semibold text-gray-800 flex-1 min-w-0">{w.route}</p>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5">{w.days} · {w.time}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{w.type} · {w.provider}</p>
                </div>
              ))}
              {hoodWaste.length === 0 && <EmptyState icon={<Trash2 size={24} />} text="Chưa có lịch thu gom rác" sub="Lịch sẽ được cập nhật sớm" />}
            </div>
          )}
          {tab === "feedback" && (
            <div className="space-y-2">
              {hoodFeedbacks.map((f) => (
                <button key={f.id} onClick={() => navigate("feedback-track")}
                  className="w-full text-left bg-white rounded-xl p-3 border border-gray-100 active:bg-gray-50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-gray-400">#{f.id}</span>
                    <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold ${statusColor(f.status)}`}>
                      {statusLabel(f.status)}
                    </span>
                  </div>
                  <p className="text-[12px] font-semibold text-gray-800 mt-1 line-clamp-2">{f.content}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{f.type} · {f.date}</p>
                </button>
              ))}
              {hoodFeedbacks.length === 0 && (
                <EmptyState icon={<Megaphone size={24} />} text="Chưa có phản ánh" sub="Khu phố chưa có phản ánh nào được ghi nhận" />
              )}
              <button onClick={() => navigate("feedback-form")}
                className="w-full py-3 rounded-xl bg-[#1565C0] text-white text-[12.5px] font-bold active:opacity-90">
                Gửi phản ánh cho khu phố này
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: NEWS DETAIL ─────────────────────────────────────────────────────
function NewsDetailScreen({ navigate, params }: { navigate: (s: Screen, p?: unknown) => void; params?: Record<string, unknown> }) {
  const news = (params?.news as typeof NEWS[0]) ?? NEWS[0];
  const from = (params?.from as string) ?? "home";
  const fromHood = params?.hood as typeof NEIGHBORHOODS[0] | undefined;
  const hood = NEIGHBORHOODS[(news.hoodId ?? 1) - 1];
  const related = NEWS.filter((n) => n.id !== news.id).slice(0, 2);

  const goBack = () => {
    if (from === "detail" && fromHood) return navigate("detail", { hood: fromHood });
    if (from === "post") return navigate("post");
    if (from === "news-list") return navigate("news-list");
    return navigate("home");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white" style={{ scrollbarWidth: "none" }}>
      {/* Cover */}
      <div className="relative h-52">
        <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-black/10" />
        <button onClick={goBack}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/35 flex items-center justify-center backdrop-blur-sm active:opacity-60">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <span className="absolute bottom-3 left-4 bg-[#1565C0] text-white text-[10px] font-extrabold px-2 py-1 rounded-full">
          {news.category}
        </span>
      </div>

      <div className="px-4 pt-4 pb-6">
        <h1 className="text-[18px] font-extrabold text-gray-900 leading-snug">{news.title}</h1>

        <div className="flex items-center gap-3 mt-2.5 text-[11px] text-gray-400">
          <span className="flex items-center gap-1"><Clock size={11} />{news.time}</span>
          <span className="flex items-center gap-1"><Users size={11} />{news.views} lượt xem</span>
        </div>

        {/* Khu phố gắn với bài viết */}
        <button onClick={() => navigate("detail", { hood })}
          className="w-full mt-3.5 rounded-xl bg-blue-50 border border-blue-100 px-3.5 py-3 flex items-center gap-2.5 active:bg-blue-100/70">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[18px] shrink-0">🏘️</div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-[9.5px] font-extrabold tracking-wider text-[#1565C0]">TIN CỦA</p>
            <p className="text-[13px] font-extrabold text-gray-800 leading-tight">{hood.name}</p>
          </div>
          <span className="text-[11px] text-[#1565C0] font-semibold flex items-center gap-0.5 shrink-0">
            Xem khu phố <ChevronRight size={13} />
          </span>
        </button>

        <div className="mt-4 space-y-3.5">
          {(news.body ?? []).map((para, i) => (
            <p key={i} className="text-[13.5px] text-gray-700 leading-relaxed">{para}</p>
          ))}
        </div>

        <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center gap-2 text-[11.5px] text-gray-500">
          <Edit3 size={12} className="text-[#1565C0]" /> Nguồn: <span className="font-semibold text-gray-700">{news.author}</span>
        </div>

        {/* Tin liên quan */}
        <div className="mt-6">
          <h3 className="text-[14px] font-extrabold text-gray-900 mb-2.5">Tin liên quan</h3>
          <div className="divide-y divide-gray-100">
            {related.map((n) => (
              <button key={n.id} onClick={() => navigate("news", { news: n, from, hood: fromHood })}
                className="w-full flex gap-3 py-3 text-left active:opacity-70">
                <img src={n.image} alt="" className="w-[92px] h-16 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                  <p className="text-[12.5px] font-semibold text-gray-900 leading-snug line-clamp-2">{n.title}</p>
                  <span className="text-[10.5px] text-gray-400">{n.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: NEWS LIST ───────────────────────────────────────────────────────
function NewsListScreen({ navigate }: { navigate: (s: Screen, p?: unknown) => void }) {
  const [query, setQuery] = useState("");
  const list = NEWS.filter((n) => n.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Tin tức - Điểm tin" onBack={() => navigate("home")} />
        <div className="px-4 pb-3">
          <div className="flex items-center bg-white/20 rounded-xl px-3 py-2.5 gap-2">
            <Search size={15} className="text-white/60" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tin tức..."
              className="flex-1 bg-transparent text-white placeholder-white/55 text-[13px] outline-none" />
            {query && <button onClick={() => setQuery("")} className="text-white/70"><X size={14} /></button>}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: "none" }}>
        <h3 className="text-[13px] font-extrabold text-gray-800 mb-2">Điểm tin</h3>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 mb-4">
          {TICKER_ITEMS.map((t, i) => (
            <button key={i} onClick={() => navigate("news", { news: newsById(t.newsId), from: "news-list" })}
              className="w-full text-left px-3.5 py-3 flex items-center gap-2 active:bg-gray-50">
              <span className="flex-1 text-[12px] text-gray-700 leading-snug">{t.text}</span>
              <ChevronRight size={14} className="text-gray-300 shrink-0" />
            </button>
          ))}
        </div>

        <h3 className="text-[13px] font-extrabold text-gray-800 mb-2">Tất cả tin tức</h3>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100">
          {list.map((n) => (
            <button key={n.id} onClick={() => navigate("news", { news: n, from: "news-list" })}
              className="w-full flex gap-3 p-3 text-left active:bg-gray-50">
              <img src={n.image} alt="" className="w-[92px] h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                <p className="text-[12.5px] font-semibold text-gray-900 leading-snug line-clamp-2">{n.title}</p>
                <span className="text-[10.5px] text-gray-400">{n.time} · {NEIGHBORHOODS[(n.hoodId ?? 1) - 1].name}</span>
              </div>
            </button>
          ))}
        </div>
        {list.length === 0 && <EmptyState icon={<Search size={26} />} text="Không tìm thấy tin tức" />}
      </div>
    </div>
  );
}

// ─── SCREEN: POST NEWS ───────────────────────────────────────────────────────
function PostNewsScreen({ navigate }: { navigate: (s: Screen, p?: unknown) => void }) {
  const [images, setImages] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Hoạt động");
  const [success, setSuccess] = useState(false);
  const MAX = 300;

  const PLACEHOLDER_IMGS = [
    "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=200&h=200&fit=crop&auto=format",
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=200&h=200&fit=crop&auto=format",
  ];

  const addImage = () => { if (images.length < 4) setImages((p) => [...p, PLACEHOLDER_IMGS[p.length]]); };
  const removeImage = (i: number) => setImages((p) => p.filter((_, j) => j !== i));

  const submit = () => {
    if (!content.trim()) return;
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setContent(""); setImages([]); }, 2500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Đăng tin" onBack={() => navigate("home")} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5" style={{ scrollbarWidth: "none" }}>
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle2 size={17} className="text-green-600 shrink-0" />
              <p className="text-[12.5px] text-green-700 font-semibold">Bài đăng đã gửi, đang chờ kiểm duyệt!</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image upload */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[13px] font-extrabold text-gray-800 mb-3">Ảnh đính kèm <span className="text-gray-400 font-normal">(tối đa 4 ảnh)</span></p>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm active:scale-90">
                  <X size={9} className="text-white" />
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <button onClick={addImage}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 active:bg-gray-50 transition-colors">
                <Camera size={18} />
                <span className="text-[9.5px] font-semibold">Thêm ảnh</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-extrabold text-gray-800">Nội dung bài đăng</p>
            <span className={`text-[11px] font-semibold tabular-nums ${content.length > MAX * 0.85 ? "text-orange-500" : "text-gray-400"}`}>
              {content.length}/{MAX}
            </span>
          </div>
          <textarea value={content} onChange={(e) => e.target.value.length <= MAX && setContent(e.target.value)}
            placeholder="Nhập nội dung tin tức, thông báo cho cộng đồng khu phố..."
            rows={5}
            className="w-full text-[12.5px] text-gray-700 outline-none resize-none leading-relaxed placeholder-gray-300" />
        </div>

        {/* Category */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[13px] font-extrabold text-gray-800 mb-3">Danh mục</p>
          <div className="relative">
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className={`w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl pl-3.5 pr-9 py-3 text-[13px] outline-none focus:border-[#1565C0] transition-colors ${
                category ? "text-gray-800 font-semibold" : "text-gray-400"
              }`}>
              <option value="">-- Chọn danh mục --</option>
              {["Hoạt động","Thông báo","Sự kiện","Khẩn cấp"].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Submit */}
        <button onClick={submit}
          className={`w-full py-4 rounded-xl font-extrabold text-[15px] transition-all active:scale-[0.98] ${
            content.trim() ? "bg-[#1565C0] text-white shadow-md shadow-blue-200" : "bg-gray-200 text-gray-400"
          }`}>
          Đăng bài
        </button>

        {/* Posted items */}
        <div>
          <h3 className="text-[14px] font-extrabold text-gray-800 mb-3">Bài đã đăng</h3>
          <div className="space-y-2.5">
            {NEWS.map((n) => (
              <button key={n.id} onClick={() => navigate("news", { news: n, from: "post" })}
                className="w-full text-left bg-white rounded-2xl border border-gray-100 overflow-hidden active:bg-gray-50">
                <div className="flex gap-3 p-3">
                  <img src={n.image} alt="" className="w-16 h-14 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-gray-800 line-clamp-2">{n.title}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock size={9} />{n.time}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        n.status === "approved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {n.status === "approved" ? "✓ Đã duyệt" : "⏳ Chờ duyệt"}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: FEEDBACK MAIN ───────────────────────────────────────────────────
function FeedbackScreen({ navigate }: { navigate: (s: Screen, p?: unknown) => void }) {
  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Phản ánh kiến nghị" onBack={() => navigate("home")} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: "none" }}>
        {[
          { emoji: "📝", label: "Gửi phản ánh", desc: "Gửi kiến nghị, phản ánh đến chính quyền phường", screen: "feedback-form", grad: "from-[#1565C0] to-[#1976D2]" },
          { emoji: "🔍", label: "Theo dõi phản ánh", desc: "Tra cứu tiến độ xử lý phản ánh của bạn", screen: "feedback-track", grad: "from-green-500 to-teal-600" },
          { emoji: "📖", label: "Hướng dẫn gửi phản ánh", desc: "Quy trình tiếp nhận và xử lý phản ánh", screen: "feedback", grad: "from-purple-500 to-indigo-600" },
          { emoji: "📞", label: "Đường dây nóng", desc: "Liên hệ trực tiếp: 02513.123.456", screen: "feedback", grad: "from-orange-400 to-rose-500" },
        ].map((item) => (
          <button key={item.label} onClick={() => navigate(item.screen as Screen)}
            className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform text-left">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.grad} flex items-center justify-center text-2xl shadow-md shrink-0`}>
              {item.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-gray-800 text-[13.5px]">{item.label}</p>
              <p className="text-gray-500 text-[11.5px] mt-0.5 leading-snug">{item.desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </button>
        ))}

        {/* Stats */}
        <div className="bg-[#1565C0] rounded-2xl p-4 mt-1">
          <p className="text-[12px] font-bold text-white/80 mb-3">📊 Thống kê tháng 7/2024</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { num: "47", label: "Tiếp nhận", color: "text-white" },
              { num: "39", label: "Đã xử lý", color: "text-green-300" },
              { num: "8", label: "Đang xử lý", color: "text-yellow-300" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-3xl font-black ${s.color}`}>{s.num}</p>
                <p className="text-[10px] text-white/60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: FEEDBACK FORM ───────────────────────────────────────────────────
function FeedbackFormScreen({ navigate }: { navigate: (s: Screen, p?: unknown) => void }) {
  const [household] = useHousehold();
  const myHood = household ? NEIGHBORHOODS[household.hoodId - 1] : null;
  const [type, setType] = useState("");
  const [content, setContent] = useState("");
  const [address, setAddress] = useState(household?.address ?? "");
  const [name, setName] = useState(household?.name ?? "");
  const [phone, setPhone] = useState(household?.phone ?? "");
  const [editContact, setEditContact] = useState(!household);
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [refId] = useState(`PK${String(Date.now()).slice(-4)}`);

  const submit = () => {
    if (!type || !content.trim() || !address.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="bg-[#1565C0] shrink-0">
          <AppHeader title="Gửi phản ánh" onBack={() => navigate("feedback")} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-5xl">
            ✅
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-center space-y-2">
            <p className="text-xl font-extrabold text-gray-800">Gửi thành công!</p>
            <p className="text-[13px] text-gray-500 leading-relaxed">Phản ánh của bạn đã được tiếp nhận. Chúng tôi sẽ xử lý trong vòng 5–7 ngày làm việc.</p>
            <div className="inline-block bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 mt-2">
              <p className="text-[11px] text-gray-500">Mã phản ánh</p>
              <p className="text-[16px] font-extrabold text-[#1565C0] tracking-wider">#{refId}</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex gap-3 w-full">
            <button onClick={() => navigate("feedback-track")}
              className="flex-1 py-3.5 border border-[#1565C0] rounded-xl text-[#1565C0] text-[13px] font-bold active:bg-blue-50">
              Theo dõi
            </button>
            <button onClick={() => navigate("feedback")}
              className="flex-1 py-3.5 bg-[#1565C0] rounded-xl text-white text-[13px] font-bold active:opacity-80">
              Về trang chủ
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Gửi phản ánh" onBack={() => navigate("feedback")} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5" style={{ scrollbarWidth: "none" }}>
        {/* Type selection */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[13px] font-extrabold text-gray-800 mb-3">
            Loại phản ánh <span className="text-red-400">*</span>
          </p>
          <div className="relative">
            <select value={type} onChange={(e) => setType(e.target.value)}
              className={`w-full appearance-none bg-gray-50 border rounded-xl pl-3.5 pr-9 py-3 text-[13px] outline-none focus:border-[#1565C0] transition-colors ${
                type ? "text-gray-800 font-semibold border-gray-200" : "text-gray-400 border-gray-200"
              }`}>
              <option value="">-- Chọn loại phản ánh --</option>
              {FEEDBACK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Content & location */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <p className="text-[13px] font-extrabold text-gray-800">Nội dung phản ánh <span className="text-red-400">*</span></p>
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Mô tả chi tiết vấn đề bạn muốn phản ánh..."
            rows={4}
            className="w-full text-[12.5px] text-gray-700 outline-none resize-none leading-relaxed placeholder-gray-300 border-b border-gray-100 pb-3" />
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#1565C0] shrink-0" />
            <input value={address} onChange={(e) => setAddress(e.target.value)}
              placeholder="Địa chỉ cụ thể *"
              className="flex-1 text-[12.5px] outline-none placeholder-gray-300" />
          </div>
          <LocateButton onLocated={setAddress} />
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-[13px] font-extrabold text-gray-800 mb-3">Ảnh minh chứng <span className="text-gray-400 font-normal">(tối đa 4 ảnh)</span></p>
          <div className="grid grid-cols-4 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center active:scale-90">
                  <X size={9} className="text-white" />
                </button>
              </div>
            ))}
            {images.length < 4 && (
              <button onClick={() => setImages((p) => [...p, "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=200&h=200&fit=crop&auto=format"])}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 active:bg-gray-50">
                <Camera size={18} />
                <span className="text-[9.5px] font-semibold">Tải ảnh</span>
              </button>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-extrabold text-gray-800">Thông tin người phản ánh</p>
            {household && (
              <button onClick={() => setEditContact((v) => !v)}
                className="text-[11px] text-[#1565C0] font-semibold flex items-center gap-1 active:opacity-60">
                <Edit3 size={11} /> {editContact ? "Dùng thông tin đã khai" : "Sửa"}
              </button>
            )}
          </div>

          {household && !editContact ? (
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5 space-y-2">
              <p className="text-[10px] font-extrabold tracking-wider text-[#1565C0] flex items-center gap-1">
                <CheckCircle2 size={11} /> ĐÃ TỰ ĐIỀN TỪ KHAI BÁO HỘ GIA ĐÌNH
              </p>
              <div className="flex items-center gap-2 text-[12.5px] text-gray-700">
                <User size={13} className="text-[#1565C0] shrink-0" />
                <span className="font-semibold">{household.name}</span>
                <span className="text-gray-400">· Chủ hộ</span>
              </div>
              <div className="flex items-center gap-2 text-[12.5px] text-gray-600">
                <Phone size={13} className="text-[#1565C0] shrink-0" /> {household.phone}
              </div>
              <div className="flex items-start gap-2 text-[12.5px] text-gray-600">
                <MapPin size={13} className="text-[#1565C0] shrink-0 mt-0.5" />
                <span className="leading-snug">{household.address}</span>
              </div>
              {myHood && (
                <div className="flex items-center gap-2 text-[12.5px] text-gray-600 pt-1.5 border-t border-blue-100">
                  <Building2 size={13} className="text-[#1565C0] shrink-0" />
                  <span className="font-semibold text-gray-800">{myHood.name}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Họ và tên (tùy chọn)"
                className="w-full text-[12.5px] bg-gray-50 rounded-xl px-3.5 py-2.5 outline-none border border-gray-200 focus:border-[#1565C0] transition-colors" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại (tùy chọn)"
                type="tel"
                className="w-full text-[12.5px] bg-gray-50 rounded-xl px-3.5 py-2.5 outline-none border border-gray-200 focus:border-[#1565C0] transition-colors" />
            </>
          )}

          {!household && (
            <button onClick={() => navigate("neighborhood")}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#1565C0]/30 bg-blue-50 text-[#1565C0] text-[12px] font-bold active:bg-blue-100">
              <Info size={13} /> Khai báo hộ gia đình để tự điền thông tin
            </button>
          )}
        </div>

        <button onClick={submit}
          className={`w-full py-4 rounded-xl font-extrabold text-[15px] transition-all active:scale-[0.98] ${
            type && content.trim() && address.trim()
              ? "bg-[#1565C0] text-white shadow-md shadow-blue-200"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}>
          Gửi phản ánh
        </button>
      </div>
    </div>
  );
}

// ─── SCREEN: FEEDBACK TRACK ──────────────────────────────────────────────────
function FeedbackTrackScreen({ navigate }: { navigate: (s: Screen, p?: unknown) => void }) {
  const STEPS = ["received", "processing", "completed"];
  const STEP_LABELS = ["Tiếp nhận", "Đang xử lý", "Hoàn thành"];

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] shrink-0">
        <AppHeader title="Theo dõi phản ánh" onBack={() => navigate("feedback")} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: "none" }}>
        {FEEDBACKS.map((fb) => {
          const stepIdx = STEPS.indexOf(fb.status);
          return (
            <div key={fb.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <span className="text-[10px] text-gray-400 font-mono tracking-wide">#{fb.id}</span>
                    <p className="text-[13.5px] font-extrabold text-gray-800 mt-0.5">{fb.type}</p>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${statusColor(fb.status)}`}>
                    {statusLabel(fb.status)}
                  </span>
                </div>
                <p className="text-[12px] text-gray-600 leading-relaxed">{fb.content}</p>
                <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1"><MapPin size={10} />{fb.address}</p>
              </div>

              {/* Progress bar */}
              <div className="border-t border-gray-100 px-4 pt-3 pb-1">
                <div className="flex items-center">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        stepIdx >= i ? "bg-[#1565C0]" : "bg-gray-200"
                      }`}>
                        {stepIdx >= i
                          ? <Check size={13} className="text-white" />
                          : <span className="text-[10px] text-gray-400 font-bold">{i + 1}</span>
                        }
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 transition-colors ${stepIdx > i ? "bg-[#1565C0]" : "bg-gray-200"}`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-1.5 mb-3">
                  {STEP_LABELS.map((label, i) => (
                    <span key={i} className={`text-[9.5px] font-semibold ${stepIdx >= i ? "text-[#1565C0]" : "text-gray-400"}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-4 pb-3">
                <p className="text-[10.5px] text-gray-400 flex items-center gap-1.5">
                  <Clock size={10} /> Ngày gửi: {fb.date}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SCREEN: NOTIFICATIONS ───────────────────────────────────────────────────
function NotificationsScreen() {
  const notifs = [
    { emoji: "📋", title: "Nhắc nhở nộp thuế đất quý III/2024, hạn cuối 31/08/2024", time: "30 phút trước", unread: true },
    { emoji: "✅", title: "Phản ánh #PK002 của bạn đã được xử lý hoàn thành", time: "2 giờ trước", unread: true },
    { emoji: "📢", title: "Thông báo: Họp tổ dân phố KP 3 lúc 19:00 ngày 05/08/2024", time: "5 giờ trước", unread: false },
    { emoji: "🎉", title: "Ngày hội Toàn dân đoàn kết xây dựng đời sống văn hoá ngày 04/08/2024", time: "1 ngày trước", unread: false },
    { emoji: "🔔", title: "Lịch tiếp dân: Thứ 3 ngày 06/08 và Thứ 5 ngày 08/08/2024", time: "2 ngày trước", unread: false },
    { emoji: "🏆", title: "Phường Xuân Hoà được công nhận đạt chuẩn tiếp cận pháp luật năm 2024", time: "3 ngày trước", unread: false },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] px-4 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-extrabold text-white">Thông báo</h2>
          <button className="text-[12px] text-blue-200 font-semibold active:opacity-60">Đọc tất cả</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-100" style={{ scrollbarWidth: "none" }}>
        {notifs.map((n, i) => (
          <div key={i} className={`flex gap-3 px-4 py-4 active:bg-gray-50 ${n.unread ? "bg-blue-50/60" : "bg-white"}`}>
            <span className="text-2xl shrink-0">{n.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-[12.5px] leading-snug ${n.unread ? "font-semibold text-gray-800" : "text-gray-500"}`}>{n.title}</p>
              <p className="text-[10.5px] text-gray-400 mt-1.5">{n.time}</p>
            </div>
            {n.unread && <div className="w-2 h-2 bg-[#1565C0] rounded-full mt-1.5 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SCREEN: PROFILE ─────────────────────────────────────────────────────────
function ProfileScreen({ navigate }: { navigate: (s: Screen, p?: unknown) => void }) {
  const [household, setHousehold] = useHousehold();
  const [confirmOut, setConfirmOut] = useState(false);
  const myHood = household ? NEIGHBORHOODS[household.hoodId - 1] : null;

  const logout = () => {
    setHousehold(null);      // xoá khai báo -> lần sau phải khai báo lại
    setConfirmOut(false);
    navigate("neighborhood");
  };

  return (
    <div className="relative flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-gradient-to-b from-[#1565C0] to-[#1976D2] px-4 pt-4 pb-12 shrink-0">
        <h2 className="text-[17px] font-extrabold text-white mb-5">Cá nhân</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white border border-white/30 flex items-center justify-center shrink-0 overflow-hidden">
            <img src={logoXuanHoa} alt="Logo phường Xuân Hoà" className="w-14 h-14 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-extrabold text-[16px] truncate">{household?.name ?? ZALO_USER.name}</p>
            <p className="text-blue-200 text-[12px] truncate">
              {myHood ? `${myHood.name}, Phường Xuân Hoà` : "Chưa khai báo hộ gia đình"}
            </p>
            <p className="text-blue-200/80 text-[11px] mt-0.5 flex items-center gap-1">
              <Phone size={9} /> {household?.phone ?? ZALO_USER.phone}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 pb-4 flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        {/* Tài khoản Zalo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0068FF] flex items-center justify-center shrink-0">
              <span className="text-white font-extrabold text-[12px]">Zalo</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-bold text-gray-800">Đã đăng nhập bằng Zalo</p>
              <p className="text-[11px] text-gray-400">Số điện thoại Zalo: {ZALO_USER.phone}</p>
            </div>
            <CheckCircle2 size={17} className="text-green-500 shrink-0" />
          </div>
        </div>

        {/* Thông tin chủ hộ đã khai báo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-extrabold text-gray-800">Thông tin chủ hộ</p>
            {household && (
              <button onClick={() => navigate("neighborhood")}
                className="text-[11px] text-[#1565C0] font-semibold flex items-center gap-1 active:opacity-60">
                <Edit3 size={11} /> Cập nhật
              </button>
            )}
          </div>

          {household ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-[12.5px] text-gray-700">
                <User size={13} className="text-[#1565C0] shrink-0" />
                <span className="font-semibold">{household.name}</span>
                <span className="text-gray-400">· Chủ hộ</span>
              </div>
              <div className="flex items-center gap-2 text-[12.5px] text-gray-600">
                <Phone size={13} className="text-[#1565C0] shrink-0" /> {household.phone}
              </div>
              <div className="flex items-start gap-2 text-[12.5px] text-gray-600">
                <MapPin size={13} className="text-[#1565C0] shrink-0 mt-0.5" />
                <span className="leading-snug">{household.address}</span>
              </div>
              <button onClick={() => navigate("detail", { hood: myHood })}
                className="w-full mt-1 pt-2.5 border-t border-gray-100 flex items-center gap-2 text-[12.5px] text-gray-600 active:opacity-60">
                <Building2 size={13} className="text-[#1565C0] shrink-0" />
                <span className="font-semibold text-gray-800">{myHood!.name}</span>
                <ChevronRight size={14} className="text-gray-300 ml-auto" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Bạn chưa khai báo thông tin chủ hộ. Khai báo một lần để hệ thống xác định khu phố và tự điền
                thông tin khi gửi phản ánh.
              </p>
              <button onClick={() => navigate("neighborhood")}
                className="w-full py-3 rounded-xl bg-[#1565C0] text-white text-[13px] font-bold active:scale-[0.98] transition-transform">
                Khai báo chủ hộ
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {[
            { emoji: "📣", label: "Phản ánh của tôi", action: () => navigate("feedback-track") },
            { emoji: "🔖", label: "Mục đã lưu", action: () => {} },
            { emoji: "🔔", label: "Cài đặt thông báo", action: () => {} },
            { emoji: "❓", label: "Hỗ trợ & Hướng dẫn", action: () => {} },
          ].map((item, i) => (
            <button key={i} onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-4 border-b border-gray-100 last:border-0 text-left active:bg-gray-50 transition-colors">
              <span className="text-xl shrink-0">{item.emoji}</span>
              <span className="flex-1 text-[13px] font-semibold text-gray-700">{item.label}</span>
              <ChevronRight size={15} className="text-gray-300" />
            </button>
          ))}
        </div>

        {household && (
          <button onClick={() => setConfirmOut(true)}
            className="w-full mt-3 py-3.5 bg-red-50 rounded-xl border border-red-100 text-red-500 text-[13px] font-bold flex items-center justify-center gap-2 active:bg-red-100">
            🚪 Đăng xuất
          </button>
        )}
        <p className="text-center text-[10.5px] text-gray-400 mt-3">Xuân Hoà Số · Zalo Mini App · Phiên bản 1.0</p>
      </div>

      {/* Xác nhận đăng xuất */}
      <AnimatePresence>
        {confirmOut && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-end z-50" onClick={() => setConfirmOut(false)}>
            <motion.div initial={{ y: 220 }} animate={{ y: 0 }} exit={{ y: 220 }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-3xl p-5 pb-7 space-y-3">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-2" />
              <p className="text-[15px] font-extrabold text-gray-900 text-center">Đăng xuất khỏi ứng dụng?</p>
              <p className="text-[12.5px] text-gray-500 text-center leading-relaxed">
                Thông tin chủ hộ đã khai báo sẽ bị xoá. Lần sau bạn cần khai báo lại để sử dụng
                Khu phố số và gửi phản ánh nhanh.
              </p>
              <div className="flex gap-2.5 pt-1">
                <button onClick={() => setConfirmOut(false)}
                  className="flex-1 py-3.5 rounded-xl border border-gray-200 text-[13px] font-bold text-gray-600 active:bg-gray-50">
                  Huỷ
                </button>
                <button onClick={logout}
                  className="flex-1 py-3.5 rounded-xl bg-red-500 text-white text-[13px] font-bold active:opacity-80">
                  Đăng xuất
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── UTILITIES SCREEN ────────────────────────────────────────────────────────
function UtilitiesScreen({ navigate }: { navigate: (s: Screen, p?: unknown) => void }) {
  const items = [
    { emoji: "", icon: <RobotIcon size={38} />, label: "Trợ lý ảo", screen: "assistant" },
    { emoji: "🏘️", label: "Khu phố số", screen: "neighborhood" },
    { emoji: "📣", label: "Phản ánh", screen: "feedback" },
    { emoji: "📝", label: "Đăng tin", screen: "post" },
    { emoji: "📋", label: "Dịch vụ công", screen: "assistant" },
    { emoji: "🗺️", label: "Quy hoạch", screen: "assistant" },
    { emoji: "💰", label: "Nộp thuế", screen: "assistant" },
    { emoji: "🏥", label: "Y tế", screen: "assistant" },
    { emoji: "📊", label: "Thống kê", screen: "assistant" },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F5F7FA] overflow-hidden">
      <div className="bg-[#1565C0] px-4 py-4 shrink-0">
        <h2 className="text-[17px] font-extrabold text-white">Tiện ích</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: "none" }}>
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <button key={item.label} onClick={() => navigate(item.screen as Screen)}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 shadow-sm active:scale-95 transition-transform">
              {"icon" in item && item.icon
                ? <span className="h-[38px] flex items-center">{item.icon}</span>
                : <span className="text-3xl">{item.emoji}</span>}
              <span className="text-[11.5px] font-bold text-gray-700 text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [params, setParams] = useState<Record<string, unknown> | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>("home");

  const navigate = (newScreen: Screen, newParams?: unknown) => {
    setScreen(newScreen);
    setParams((newParams as Record<string, unknown>) ?? null);
    if (newScreen === "home") setActiveTab("home");
    else if (newScreen === "notifications") setActiveTab("notifications");
    else if (newScreen === "profile") setActiveTab("profile");
    else if (newScreen === "neighborhood") setActiveTab("utilities");
  };

  const handleTab = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === "home") navigate("home");
    else if (tab === "notifications") navigate("notifications");
    else if (tab === "utilities") navigate("neighborhood");
    else if (tab === "profile") navigate("profile");
  };

  const hideBottomNav = screen === "chat" || screen === "feedback-form";

  const screenProps = { navigate, params: params ?? {} };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #1565C0 0%, #42A5F5 50%, #E3F2FD 100%)", fontFamily: "'Be Vietnam Pro', Inter, system-ui, sans-serif" }}
    >
      {/* Nút vào Dashboard điều hành - chỉ hiện trên màn hình desktop */}
      <a href="/dashboard"
        className="hidden md:flex fixed top-5 right-5 items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 text-[#1565C0] text-[13px] font-bold shadow-lg hover:bg-white transition-colors z-40">
        <Grid3X3 size={15} /> Truy cập Dashboard
      </a>

      <div className="w-[390px] h-[844px] rounded-[44px] overflow-hidden shadow-2xl flex flex-col bg-[#F5F7FA]"
        style={{ boxShadow: "0 32px 80px rgba(21,101,192,0.35), 0 8px 24px rgba(0,0,0,0.2)" }}>
        <StatusBar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {screen === "home" && <HomeScreen navigate={navigate} />}
              {screen === "assistant" && <AssistantScreen navigate={navigate} />}
              {screen === "chat" && <ChatScreen navigate={navigate} params={screenProps.params} />}
              {screen === "neighborhood" && <NeighborhoodScreen navigate={navigate} />}
              {screen === "detail" && <NeighborhoodDetailScreen navigate={navigate} params={screenProps.params} />}
              {screen === "news-list" && <NewsListScreen navigate={navigate} />}
              {screen === "news" && <NewsDetailScreen navigate={navigate} params={screenProps.params} />}
              {screen === "post" && <PostNewsScreen navigate={navigate} />}
              {screen === "feedback" && <FeedbackScreen navigate={navigate} />}
              {screen === "feedback-form" && <FeedbackFormScreen navigate={navigate} />}
              {screen === "feedback-track" && <FeedbackTrackScreen navigate={navigate} />}
              {screen === "notifications" && <NotificationsScreen />}
              {screen === "profile" && <ProfileScreen navigate={navigate} />}
              {screen === "utilities" && <UtilitiesScreen navigate={navigate} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {!hideBottomNav && <BottomNav active={activeTab} onNavigate={handleTab} />}
      </div>
    </div>
  );
}

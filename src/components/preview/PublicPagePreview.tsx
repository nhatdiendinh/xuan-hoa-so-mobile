import { Badge } from "../common/ui";
import { useTable } from "../../services/store";
import { fmtDate } from "../../utils/format";
import type { HomeConfig } from "../../types";

/** Mô phỏng trang công khai Xuân Hoà Số - không chứa menu quản trị hay số liệu điều hành */
export function PublicPagePreview({ config, width }: { config: HomeConfig; width: number }) {
  const [contents] = useTable("contents");
  const [utilities] = useTable("utilities");
  const [hoods] = useTable("neighborhoods");
  const [org] = useTable("org");

  const byId = (id: string) => contents.find((c) => c.id === id);
  const banners = config.bannerIds.map(byId).filter(Boolean);
  const pinned = config.pinnedAnnouncementId ? byId(config.pinnedAnnouncementId) : null;
  const featured = config.featuredNewsIds.map(byId).filter(Boolean);
  const literacy = config.literacyIds.map(byId).filter(Boolean);
  const community = config.communityNewsIds.map(byId).filter(Boolean);
  const utils = utilities.filter((u) => config.utilityIds.includes(u.id) && u.status === "active");
  const shownHoods = hoods.filter((h) => config.hoodIds.includes(h.id));

  const compact = width < 500;
  const draftTag = (status: string) =>
    status === "published" ? <Badge tone="green">Đã xuất bản</Badge>
      : status === "pending" ? <Badge tone="violet">Chờ duyệt</Badge>
      : <Badge tone="slate">Nháp</Badge>;

  return (
    <div className="bg-white text-slate-800" style={{ fontFamily: "'Be Vietnam Pro', Inter, system-ui, sans-serif" }}>
      {/* 1. Đầu trang */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-[13px] font-bold">XH</div>
        <div className="min-w-0">
          <p className="text-[15px] font-bold text-slate-900 leading-tight">Xuân Hoà Số</p>
          <p className="text-[11.5px] text-slate-500">Phường Xuân Hoà, TP. Hồ Chí Minh</p>
        </div>
      </header>

      {config.sections.banner && banners.length > 0 && (
        <section className="px-3 pt-3">
          <div className="relative rounded-2xl overflow-hidden aspect-video">
            <img src={banners[0]!.image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-blue-900/55 flex flex-col items-center justify-center text-center px-5">
              <p className="text-white/85 text-[11px] font-semibold tracking-widest">CHÀO MỪNG ĐẾN VỚI</p>
              <p className="text-white font-extrabold text-[24px] leading-tight mt-1">XUÂN HOÀ SỐ</p>
              <p className="text-white/90 text-[13px] italic mt-1">Kết nối - Chia sẻ - Phát triển</p>
            </div>
            <span className="absolute top-2 right-2">{draftTag(banners[0]!.status)}</span>
          </div>
        </section>
      )}

      {/* 2. Thông tin cần biết hôm nay */}
      {config.sections.today && pinned && (
        <section className="px-4 pt-4">
          <h2 className="text-[15px] font-bold text-slate-900 mb-2">Thông tin cần biết hôm nay</h2>
          <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex items-center gap-2">
            <span className="text-blue-600">•</span>
            <span className="flex-1 text-[12.5px] text-slate-700 line-clamp-2">{pinned.title}</span>
            {draftTag(pinned.status)}
          </div>
        </section>
      )}

      {/* 3. Tiện ích người dân */}
      {config.sections.utilities && (
        <section className="px-4 pt-5">
          <h2 className="text-[15px] font-bold text-slate-900 mb-3">Tiện ích người dân</h2>
          <div className={`grid ${compact ? "grid-cols-3" : "grid-cols-6"} gap-3`}>
            {utils.map((u) => (
              <div key={u.id} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100" />
                <span className="text-[11px] text-slate-600 text-center leading-tight">{u.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Khám phá khu phố */}
      {config.sections.neighborhoods && (
        <section className="px-4 pt-5">
          <h2 className="text-[15px] font-bold text-slate-900 mb-3">Khám phá 18 khu phố</h2>
          <div className={`grid ${compact ? "grid-cols-2" : "grid-cols-4"} gap-3`}>
            {shownHoods.map((h) => (
              <div key={h.id} className="rounded-xl overflow-hidden border border-slate-200">
                <img src={h.image} alt="" className="w-full h-20 object-cover" />
                <div className="px-2.5 py-2">
                  <p className="text-[12.5px] font-semibold text-slate-800">{h.name}</p>
                  <p className="text-[11px] text-slate-500">{h.households} hộ</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Bình dân học vụ số */}
      {config.sections.literacy && (
        <section className="px-4 pt-5">
          <h2 className="text-[15px] font-bold text-slate-900 mb-3">Bình dân học vụ số</h2>
          <div className={`grid ${compact ? "grid-cols-1" : "grid-cols-3"} gap-3`}>
            {literacy.map((c) => (
              <div key={c!.id} className="rounded-xl border border-slate-200 overflow-hidden">
                <img src={c!.image} alt="" className="w-full h-24 object-cover" />
                <div className="px-3 py-2">
                  <p className="text-[12.5px] font-semibold text-slate-800 line-clamp-2">{c!.title}</p>
                  <div className="mt-1.5">{draftTag(c!.status)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Tin tức - hoạt động cộng đồng */}
      {config.sections.news && (
        <section className="px-4 pt-5">
          <h2 className="text-[15px] font-bold text-slate-900 mb-3">Tin tức - hoạt động cộng đồng</h2>
          <div className="space-y-3">
            {[...featured, ...community].map((c) => (
              <div key={c!.id} className="flex gap-3">
                <img src={c!.image} alt="" className="w-[104px] h-[72px] rounded-xl object-cover shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-slate-900 line-clamp-2">{c!.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{fmtDate(c!.publishedAt ?? c!.createdAt)}</p>
                  <div className="mt-1.5">{draftTag(c!.status)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Giới thiệu */}
      {config.sections.about && (
        <section className="px-4 pt-5">
          <h2 className="text-[15px] font-bold text-slate-900 mb-2">Giới thiệu Xuân Hoà</h2>
          <p className="text-[12.5px] text-slate-600 leading-relaxed">
            Phường Xuân Hoà thuộc TP. Hồ Chí Minh với 18 khu phố, đang xây dựng chính quyền số phục vụ người dân
            thông qua nền tảng Xuân Hoà Số.
          </p>
        </section>
      )}

      {/* 8. Footer */}
      <footer className="mt-6 px-4 py-5 bg-slate-50 border-t border-slate-100">
        <p className="text-[12.5px] font-semibold text-slate-800">{org.name}</p>
        <p className="text-[11.5px] text-slate-500 mt-1">{org.address}</p>
        <p className="text-[11.5px] text-slate-500">{org.phone} · {org.email}</p>
        <p className="text-[11px] text-slate-400 mt-2">{org.copyright}</p>
      </footer>
    </div>
  );
}

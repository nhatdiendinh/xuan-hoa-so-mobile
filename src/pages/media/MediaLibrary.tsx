import { useState } from "react";
import { Images, Plus, Trash2, Upload } from "lucide-react";
import { Card, CardHeader, Badge, Button, EmptyState } from "../../components/common/ui";
import { FilterBar, SearchInput, Select } from "../../components/common/Filters";
import { ConfirmDialog, RightDrawer, useToast } from "../../components/common/Overlays";
import { Allow } from "../../components/common/Guards";
import { useAuth } from "../../services/auth";
import { useTable } from "../../services/store";
import { img } from "../../data/mock";
import { fmtDate } from "../../utils/format";
import type { MediaItem } from "../../types";

export default function MediaLibrary() {
  const toast = useToast();
  const { user, hoodScope } = useAuth();
  const [media, setMedia] = useTable("media");
  const [contents] = useTable("contents");
  const [hoods] = useTable("neighborhoods");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [album, setAlbum] = useState("");
  const [detail, setDetail] = useState<MediaItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaItem | null>(null);

  const albums = Array.from(new Set(media.map((m) => m.album)));
  const rows = media.filter((m) =>
    (!hoodScope || m.hoodId === hoodScope || m.hoodId === null) &&
    (!q || m.name.toLowerCase().includes(q.toLowerCase())) &&
    (!kind || m.kind === kind) && (!album || m.album === album)
  );

  const upload = () => {
    const item: MediaItem = {
      id: `md-${Date.now()}`, url: img(Math.floor(Math.random() * 8), 400, 300), kind: "image",
      name: `anh-tai-len-${Date.now()}.jpg`, album: albums[0] ?? "Hoạt động cộng đồng",
      hoodId: hoodScope ?? null, event: "", size: "820 KB",
      uploadedAt: new Date().toISOString(), uploadedBy: user?.fullName ?? "Cán bộ", usedIn: [],
    };
    setMedia([item, ...media]);
    toast("Đã tải ảnh lên thư viện");
  };

  return (
    <>
      <Card>
        <CardHeader title="Thư viện ảnh - video" icon={<Images size={16} className="text-violet-600" />}
          action={
            <Allow module="media" action="create">
              <Button size="sm" icon={<Upload size={14} />} onClick={upload}>Tải lên</Button>
            </Allow>
          } />
        <FilterBar>
          <SearchInput value={q} onChange={setQ} placeholder="Tìm theo tên tệp..." />
          <Select value={kind} onChange={setKind} placeholder="Tất cả loại"
            options={[{ value: "image", label: "Hình ảnh" }, { value: "video", label: "Video" }]} />
          <Select value={album} onChange={setAlbum} placeholder="Tất cả album"
            options={albums.map((a) => ({ value: a, label: a }))} />
        </FilterBar>
        {rows.length === 0 ? (
          <EmptyState title="Chưa có tệp nào" description="Tải ảnh hoặc video lên để sử dụng cho nội dung." />
        ) : (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {rows.map((m) => (
              <button key={m.id} onClick={() => setDetail(m)}
                className="group rounded-xl border border-slate-200 overflow-hidden text-left hover:border-blue-400">
                <div className="relative">
                  <img src={m.url} alt={m.name} className="w-full h-24 object-cover" />
                  {m.kind === "video" && <span className="absolute top-1.5 left-1.5"><Badge tone="violet">Video</Badge></span>}
                </div>
                <div className="px-2.5 py-2">
                  <p className="text-[12px] text-slate-700 truncate">{m.name}</p>
                  <p className="text-[11px] text-slate-400">{m.size}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      <RightDrawer open={!!detail} title="Thông tin tệp" onClose={() => setDetail(null)}
        footer={
          detail && (
            <Allow module="media" action="delete">
              <Button variant="danger" icon={<Trash2 size={14} />} onClick={() => { setConfirmDelete(detail); }}>Xoá tệp</Button>
            </Allow>
          )
        }>
        {detail && (
          <div className="space-y-3">
            <img src={detail.url} alt={detail.name} className="w-full rounded-xl object-cover" />
            <dl className="space-y-2 text-[13px]">
              {[
                ["Tên tệp", detail.name],
                ["Loại", detail.kind === "image" ? "Hình ảnh" : "Video"],
                ["Album", detail.album],
                ["Khu phố", detail.hoodId ? `Khu phố ${detail.hoodId}` : "Toàn phường"],
                ["Sự kiện", detail.event || "-"],
                ["Dung lượng", detail.size],
                ["Người tải lên", detail.uploadedBy],
                ["Ngày tải lên", fmtDate(detail.uploadedAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{k}</dt><dd className="text-slate-800 font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <p className="text-[12.5px] font-medium text-slate-700 mb-1.5">Đang được dùng ở nội dung</p>
              {detail.usedIn.length === 0 ? (
                <p className="text-[12.5px] text-slate-400">Chưa được sử dụng ở nội dung nào.</p>
              ) : (
                <ul className="space-y-1">
                  {detail.usedIn.map((cid) => (
                    <li key={cid} className="text-[12.5px] text-blue-600">
                      {contents.find((c) => c.id === cid)?.title ?? cid}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </RightDrawer>

      <ConfirmDialog open={!!confirmDelete}
        title="Xoá tệp khỏi thư viện"
        description={confirmDelete?.usedIn.length
          ? "Tệp đang được sử dụng trong nội dung đã đăng. Xoá tệp có thể làm nội dung mất ảnh minh hoạ."
          : "Tệp sẽ bị xoá khỏi thư viện."}
        confirmLabel="Xoá tệp" tone="danger"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => {
          setMedia(media.filter((m) => m.id !== confirmDelete!.id));
          setConfirmDelete(null); setDetail(null); toast("Đã xoá tệp");
        }} />
    </>
  );
}

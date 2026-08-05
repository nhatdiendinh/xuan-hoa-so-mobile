import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState, LoadingSkeleton } from "./ui";

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => ReactNode;
  /** Hiển thị trên thẻ khi ở màn hình điện thoại */
  mobile?: "title" | "meta" | "badge" | "hidden";
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
  pageSizeOptions?: number[];
}

/** Bảng dữ liệu: desktop hiển thị table, điện thoại tự chuyển sang danh sách thẻ */
export function DataTable<T>({
  columns, rows, rowKey, loading, emptyTitle = "Chưa có dữ liệu",
  emptyDescription, onRowClick, pageSizeOptions = [10, 20, 50],
}: Props<T>) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSizeOptions[0]);

  if (loading) return <LoadingSkeleton />;
  if (!rows.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(page, pages);
  const slice = rows.slice((current - 1) * size, current * size);

  const title = columns.find((c) => c.mobile === "title") ?? columns[0];
  const metas = columns.filter((c) => c.mobile === "meta");
  const badges = columns.filter((c) => c.mobile === "badge");

  return (
    <div>
      {/* Desktop / tablet */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-y border-slate-200">
              {columns.map((c) => (
                <th key={c.key} style={{ width: c.width }}
                  className="px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row) => (
              <tr key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}>
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-[13px] text-slate-700 align-top">{c.render(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Điện thoại: danh sách thẻ, không cuộn ngang */}
      <div className="md:hidden divide-y divide-slate-100">
        {slice.map((row) => (
          <div key={rowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined}
            className="px-4 py-3 active:bg-slate-50">
            <div className="text-[13.5px] font-semibold text-slate-900">{title.render(row)}</div>
            {metas.length > 0 && (
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {metas.map((c) => (
                  <div key={c.key} className="min-w-0">
                    <p className="text-[10.5px] uppercase tracking-wide text-slate-400">{c.header}</p>
                    <div className="text-[12.5px] text-slate-600 truncate">{c.render(row)}</div>
                  </div>
                ))}
              </div>
            )}
            {badges.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">{badges.map((c) => <div key={c.key}>{c.render(row)}</div>)}</div>
            )}
          </div>
        ))}
      </div>

      {/* Phân trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-[12.5px] text-slate-500">
          <span>Hiển thị</span>
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
            className="border border-slate-200 rounded-lg px-2 py-1 text-[12.5px] outline-none focus:border-blue-500">
            {pageSizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <span>trên tổng {total} dòng</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={current === 1}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-40 hover:bg-slate-50">
            <ChevronLeft size={15} />
          </button>
          <span className="text-[12.5px] text-slate-600 px-2">Trang {current}/{pages}</span>
          <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={current === pages}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-40 hover:bg-slate-50">
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

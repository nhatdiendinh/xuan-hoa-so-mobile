import { Check, Minus, ShieldCheck } from "lucide-react";
import { Card, CardHeader, Badge } from "../../components/common/ui";
import { MATRIX, ROLE_LABEL } from "../../services/permissions";
import type { Action, Module, Role } from "../../types";

const MODULES: { key: Module; label: string }[] = [
  { key: "overview", label: "Tổng quan" },
  { key: "tasks", label: "Công việc" },
  { key: "content", label: "Nội dung" },
  { key: "feedback", label: "Phản ánh" },
  { key: "neighborhoods", label: "Khu phố" },
  { key: "waste", label: "Lịch rác" },
  { key: "surveys", label: "Khảo sát" },
  { key: "literacy", label: "Bình dân học vụ số" },
  { key: "media", label: "Thư viện" },
  { key: "utilities", label: "Tiện ích" },
  { key: "preview", label: "Xem trước trang" },
  { key: "reports", label: "Báo cáo" },
  { key: "users", label: "Người dùng" },
  { key: "settings", label: "Cấu hình" },
];

const ACTIONS: { key: Action; label: string }[] = [
  { key: "view", label: "Xem" }, { key: "create", label: "Tạo" }, { key: "edit", label: "Sửa" },
  { key: "delete", label: "Xoá" }, { key: "approve", label: "Duyệt" }, { key: "publish", label: "Xuất bản" },
  { key: "export", label: "Xuất báo cáo" },
];

export default function Roles() {
  const roles = Object.keys(ROLE_LABEL) as Role[];
  return (
    <>
      <Card>
        <CardHeader title="Ma trận phân quyền theo module" icon={<ShieldCheck size={16} className="text-emerald-600" />} />
        <div className="p-5 flex flex-wrap gap-2">
          {roles.map((r) => <Badge key={r} tone="violet">{ROLE_LABEL[r]}</Badge>)}
        </div>
      </Card>

      {roles.map((role) => (
        <Card key={role}>
          <CardHeader title={ROLE_LABEL[role]} />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  <th className="px-4 py-2.5 text-[11.5px] font-semibold uppercase text-slate-500">Module</th>
                  {ACTIONS.map((a) => (
                    <th key={a.key} className="px-3 py-2.5 text-[11.5px] font-semibold uppercase text-slate-500 text-center">{a.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((m) => {
                  const allowed = role === "SUPER_ADMIN" ? ACTIONS.map((a) => a.key) : MATRIX[role]?.[m.key] ?? [];
                  return (
                    <tr key={m.key} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2.5 text-[13px] text-slate-700">{m.label}</td>
                      {ACTIONS.map((a) => (
                        <td key={a.key} className="px-3 py-2.5 text-center">
                          {allowed.includes(a.key)
                            ? <Check size={15} className="inline text-emerald-600" />
                            : <Minus size={15} className="inline text-slate-300" />}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </>
  );
}

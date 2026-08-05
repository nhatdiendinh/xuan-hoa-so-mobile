import { useState } from "react";
import { useNavigate } from "react-router";
import { LayoutDashboard, LogIn } from "lucide-react";
import { Button } from "../../components/common/ui";
import logoXuanHoa from "../../assets/logo-dashboard.png";
import { useAuth } from "../../services/auth";
import { ROLE_LABEL } from "../../services/permissions";
import { useTable } from "../../services/store";

const DEMO = ["superadmin", "phuongadmin", "bientap", "phananh", "kp1", "kp2"];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [users] = useTable("users");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!username.trim()) return setError("Vui lòng nhập tên tài khoản");
    if (!password.trim()) return setError("Vui lòng nhập mật khẩu");
    if (!login(username.trim())) return setError("Tài khoản không tồn tại hoặc đã bị khoá");
    navigate("/dashboard/overview");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4"
      style={{ fontFamily: "'Be Vietnam Pro', Inter, system-ui, sans-serif" }}>
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-7">
          <div className="flex items-center gap-3 mb-6">
            <img src={logoXuanHoa} alt="Logo phường Xuân Hoà" className="w-12 h-12 object-contain" />
            <div>
              <p className="text-[17px] font-semibold text-slate-900 leading-tight">Xuân Hoà Số</p>
              <p className="text-[12.5px] text-slate-500">Dashboard điều hành</p>
            </div>
          </div>

          <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5">Tên tài khoản</label>
          <input value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-blue-500"
            placeholder="Ví dụ: phuongadmin" />

          <label className="block text-[12.5px] font-medium text-slate-700 mb-1.5 mt-4">Mật khẩu</label>
          <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-[13px] outline-none focus:border-blue-500"
            placeholder="Nhập mật khẩu bất kỳ ở bản mô phỏng" />

          {error && <p className="text-[12px] text-red-600 mt-2">{error}</p>}

          <Button className="w-full mt-5" icon={<LogIn size={15} />} onClick={submit}>Đăng nhập</Button>
          <p className="text-[11.5px] text-slate-400 mt-3">
            Bản mô phỏng chưa kết nối máy chủ xác thực, mật khẩu chấp nhận mọi giá trị.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-7">
          <p className="text-[15px] font-semibold text-slate-900">Tài khoản mẫu</p>
          <p className="text-[12.5px] text-slate-500 mt-1">Chọn nhanh một tài khoản để xem quyền tương ứng.</p>
          <div className="mt-4 space-y-2">
            {DEMO.map((u) => {
              const info = users.find((x) => x.username === u);
              if (!info) return null;
              return (
                <button key={u} onClick={() => { setUsername(u); setPassword("123456"); setError(""); }}
                  className="w-full text-left rounded-xl border border-slate-200 px-4 py-3 hover:border-blue-300 hover:bg-blue-50/40">
                  <p className="text-[13px] font-medium text-slate-800">{info.fullName}</p>
                  <p className="text-[12px] text-slate-500">{u} · {ROLE_LABEL[info.role]}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

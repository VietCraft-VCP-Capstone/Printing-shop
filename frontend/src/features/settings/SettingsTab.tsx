import { Settings as SettingsIcon, Database, Printer, Key } from 'lucide-react';

interface SettingsTabProps {
  user: any;
}

export default function SettingsTab({ user }: SettingsTabProps) {
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-violet-50/50 to-white border border-purple-200/80 rounded-2xl p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold uppercase tracking-wider mb-3">
          <SettingsIcon className="w-3.5 h-3.5" /> Trang 5: Cấu Hình System
        </div>
        <h2 className="text-2xl font-black text-slate-900">Cấu Hình & Thiết Lập Xưởng In</h2>
        <p className="text-slate-600 text-sm mt-1">
          Quản lý kết nối API đối tác VietCraft, cấu hình máy in phần cứng, khóa bí mật vận chuyển và phân quyền người dùng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hardware Printers */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Thiết Bị Máy In</h3>
              <p className="text-xs text-slate-500">Kết nối phần cứng máy in xưởng</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
              Chưa có máy in nào được kết nối với hệ thống.
            </div>
          </div>
        </div>

        {/* Courier API Keys */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Cấu Hình Hãng Giao Vận</h3>
              <p className="text-xs text-slate-500">API Token kết nối GHN & GHTK</p>
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 font-bold mb-1 block">Mã Token GHN Express</label>
              <input
                type="password"
                placeholder="Nhập Token GHN..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-slate-600 font-bold mb-1 block">Mã Token GHTK Express</label>
              <input
                type="password"
                placeholder="Nhập Token GHTK..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Server & Webhooks */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Webhook & Server Backend</h3>
              <p className="text-xs text-slate-500">Kết nối MongoDB & Marketplace</p>
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-medium">Port Backend hiện tại</span>
              <span className="font-mono font-bold text-violet-700">Port 8880</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-medium">Phiên đăng nhập</span>
              <span className="font-bold text-emerald-600">{isAdmin ? 'ADMIN (Full Access)' : 'OPERATOR (Limited)'}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-medium">Tự động đồng bộ Webhook</span>
              <span className="text-emerald-600 font-bold">Bật (Active)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

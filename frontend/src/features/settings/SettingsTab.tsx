import { Settings as SettingsIcon, Database, Printer, Key } from 'lucide-react';

interface SettingsTabProps {
  user: any;
}

export default function SettingsTab({ user }: SettingsTabProps) {
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-violet-900/30 to-[#120e33] border border-purple-800/40 rounded-2xl p-6 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-3">
          <SettingsIcon className="w-3.5 h-3.5" /> Trang 5: Cấu Hình System
        </div>
        <h2 className="text-2xl font-black text-white">Cấu Hình & Thiết Lập Xưởng In</h2>
        <p className="text-slate-300 text-sm mt-1">
          Quản lý kết nối API đối tác VietCraft, cấu hình máy in phần cứng, khóa bí mật vận chuyển và phân quyền người dùng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hardware Printers */}
        <div className="bg-[#120e33] border border-[#201955] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-[#201955] pb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Thiết Bị Máy In</h3>
              <p className="text-xs text-slate-400">Kết nối phần cứng máy in xưởng</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#1b1548]/30 border border-[#261f62] text-center text-xs text-slate-400">
              Chưa có máy in nào được kết nối với hệ thống.
            </div>
          </div>
        </div>

        {/* Courier API Keys */}
        <div className="bg-[#120e33] border border-[#201955] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-[#201955] pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cấu Hình Hãng Giao Vận</h3>
              <p className="text-xs text-slate-400">API Token kết nối GHN & GHTK</p>
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium mb-1 block">Mã Token GHN Express</label>
              <input
                type="password"
                placeholder="Nhập Token GHN..."
                className="w-full bg-[#1b1548] border border-[#261f62] rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-slate-400 font-medium mb-1 block">Mã Token GHTK Express</label>
              <input
                type="password"
                placeholder="Nhập Token GHTK..."
                className="w-full bg-[#1b1548] border border-[#261f62] rounded-xl px-3 py-2 text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Server & Webhooks */}
        <div className="bg-[#120e33] border border-[#201955] rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-3 border-b border-[#201955] pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Webhook & Server Backend</h3>
              <p className="text-xs text-slate-400">Kết nối MongoDB & Marketplace</p>
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-[#1b1548]/40 rounded-xl border border-[#261f62]">
              <span className="text-slate-300">Port Backend hiện tại</span>
              <span className="font-mono font-bold text-violet-300">Port 8880</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-[#1b1548]/40 rounded-xl border border-[#261f62]">
              <span className="text-slate-300">Phiên đăng nhập</span>
              <span className="font-semibold text-emerald-400">{isAdmin ? 'ADMIN (Full Access)' : 'OPERATOR (Limited)'}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-[#1b1548]/40 rounded-xl border border-[#261f62]">
              <span className="text-slate-300">Tự động đồng bộ Webhook</span>
              <span className="text-emerald-400 font-bold">Bật (Active)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

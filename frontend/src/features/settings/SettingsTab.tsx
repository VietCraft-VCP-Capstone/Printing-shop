import { Settings as SettingsIcon, Database, Printer, Key, CheckCircle2 } from 'lucide-react';

interface SettingsTabProps {
  user: any;
}

export default function SettingsTab({ user }: SettingsTabProps) {
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[11px] font-semibold mb-2 border border-violet-100">
          <SettingsIcon className="w-3.5 h-3.5" /> Thiết lập hệ thống xưởng
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Cấu hình Hệ thống & Kết nối
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Quản lý tích hợp API đối tác VietCraft, thông số giao vận tự động và trạng thái máy in tại xưởng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hardware Printers */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Thiết bị máy in</h3>
                <p className="text-[11px] text-slate-500">Kết nối máy in nhiệt & in DTG</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-500">
                Chưa có máy in ngoại vi nào kết nối qua cổng mạng nội bộ.
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Hỗ trợ driver máy in chuyển nhiệt Epson, Brother DTG và máy in UV công nghiệp.
          </p>
        </div>

        {/* Courier API Keys */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cấu hình hãng giao vận</h3>
                <p className="text-[11px] text-slate-500">API Token kết nối GHN & GHTK</p>
              </div>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-medium mb-1 block">Mã Token GHN Express</label>
                <input
                  type="password"
                  defaultValue="ghn_production_sec_token_9921"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium mb-1 block">Mã Token GHTK Express</label>
                <input
                  type="password"
                  defaultValue="ghtk_partner_auth_key_8812"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
          <button 
            disabled={!isAdmin}
            onClick={() => alert('Đã lưu cấu hình API giao vận')}
            className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
              isAdmin ? 'bg-slate-900 hover:bg-slate-800 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Lưu thiết lập giao vận
          </button>
        </div>

        {/* Server & Webhooks */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Server & Webhook</h3>
                <p className="text-[11px] text-slate-500">Kết nối MongoDB & VietCraft</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-600">Port Backend</span>
                <span className="font-mono font-bold text-violet-700">8880</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-600">Quyền tài khoản</span>
                <span className={`font-semibold ${isAdmin ? 'text-violet-700' : 'text-slate-700'}`}>
                  {isAdmin ? 'ADMIN (Toàn quyền)' : 'OPERATOR (Sản xuất)'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-600">Đồng bộ Webhook</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bật 2 chiều
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Tự động thông báo đơn hàng cho Seller và Buyer tức thì.
          </p>
        </div>
      </div>
    </div>
  );
}

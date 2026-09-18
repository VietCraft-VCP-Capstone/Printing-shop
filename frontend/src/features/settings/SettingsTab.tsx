import { useState } from 'react';
import { Settings as SettingsIcon, Database, Printer, Key, Eye, EyeOff, Lock } from 'lucide-react';

interface SettingsTabProps {
  user: any;
}

export default function SettingsTab({ user }: SettingsTabProps) {
  const isAdmin = user?.role === 'ADMIN';
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-purple-300 text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
            <SettingsIcon className="w-3.5 h-3.5" /> Quản Trị Hệ Thống & Bảo Mật
          </div>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Cấu Hình & Thiết Lập Xưởng In</h2>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
            Quản lý kết nối API đối tác VietCraft, cấu hình chữ ký bảo mật HMAC SHA-256, máy in phần cứng, khóa bí mật vận chuyển và phân quyền người dùng.
          </p>
        </div>
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
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-2">
              <Printer className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-medium text-slate-700">Brother GTX-600 Industrial DTG</p>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Sẵn sàng in ấn
              </span>
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
                defaultValue="ghn_prod_sec_839104829103"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-slate-600 font-bold mb-1 block">Mã Token GHTK Express</label>
              <input
                type="password"
                defaultValue="ghtk_prod_sec_729401847192"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Server & Webhooks Security */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Bảo Mật API & Webhook</h3>
              <p className="text-xs text-slate-500">Chuẩn kết nối bảo mật VietCraft</p>
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-medium">Chữ ký điện tử</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                HMAC SHA-256
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-medium">Chống Replay Attack</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Khung 5 phút
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-600 font-medium">Hàng đợi retry</span>
              <span className="font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-200">
                Exponential Backoff
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secret Keys Panel */}
      {isAdmin && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-violet-600" />
            <h3 className="font-bold text-slate-900 text-sm">Khóa Bí Mật Đối Tác (Chỉ Quản Trị Viên)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-bold text-slate-700 block">Khóa Webhook Secret (HMAC SHA-256)</span>
              <div className="flex items-center gap-2">
                <input 
                  type={showWebhookSecret ? 'text' : 'password'} 
                  readOnly 
                  value="vietcraft_hmac_webhook_secret_key_2026" 
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-slate-800 flex-1"
                />
                <button 
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer"
                >
                  {showWebhookSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="font-bold text-slate-700 block">Khóa API Key Xác Thực Đối Tác</span>
              <div className="flex items-center gap-2">
                <input 
                  type={showApiKey ? 'text' : 'password'} 
                  readOnly 
                  value="vietcraft_shop_api_secret_key_2026" 
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-slate-800 flex-1"
                />
                <button 
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-lg cursor-pointer"
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

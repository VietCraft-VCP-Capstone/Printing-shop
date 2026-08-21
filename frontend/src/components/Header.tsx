import { Database, LogOut, ShieldCheck, UserCog, Printer } from 'lucide-react';
import type { TabType } from './Sidebar';

interface HeaderProps {
  activeTab: TabType;
  user: any;
  onLogout: () => void;
}

const TAB_LABELS: Record<TabType, { title: string; subtitle: string }> = {
  dashboard: { title: 'Trang 1: Bảng Điều Khiển (Dashboard)', subtitle: 'Tổng quan chỉ số xưởng in & tiến độ công việc' },
  orders:    { title: 'Trang 2: Quản Lý Đơn In Ấn (Orders)', subtitle: 'Danh sách đơn hàng cần xử lý & chuyển giao' },
  logistics: { title: 'Trang 3: Trang Logi (Vận Chuyển & Giao Vận)', subtitle: 'Ủy quyền giao hàng GHN, GHTK, ViettelPost' },
  catalog:   { title: 'Trang 4: Catalog Phôi Sản Phẩm (Catalog)', subtitle: 'Danh mục phôi vật tư cung ứng cho VietCraft' },
  settings:  { title: 'Trang 5: Cấu Hình Hệ Thống (Settings)', subtitle: 'Thiết lập máy in, API Keys & Webhook realtime' },
};

export default function Header({ activeTab, user, onLogout }: HeaderProps) {
  const isAdmin = user?.role === 'ADMIN';
  const currentTab = TAB_LABELS[activeTab] || { title: 'Giao diện Xưởng In', subtitle: 'VietCraft Portal' };

  return (
    <header className="h-[68px] bg-[#0a0720]/90 backdrop-blur-lg border-b border-[#180f3a] px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-40">
      {/* Left: page distinction title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-md">
          <Printer className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white leading-none">{currentTab.title}</h2>
          <p className="text-[11px] text-violet-400 mt-1 leading-none font-medium">{currentTab.subtitle}</p>
        </div>
      </div>

      {/* Right: status + profile */}
      <div className="flex items-center gap-3">
        {/* DB status chip */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#0f0b2a] border border-[#1f1650] rounded-lg px-3 py-1.5 text-[11px] text-slate-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Database className="w-3 h-3 text-violet-400" />
          <span>Database <strong className="text-violet-300">Atlas Live</strong></span>
        </div>

        {/* Profile card */}
        {user && (
          <div className={`flex items-center gap-2.5 border rounded-xl pl-2 pr-1 py-1 transition-all ${
            isAdmin
              ? 'bg-violet-950/20 border-violet-800/40'
              : 'bg-fuchsia-950/20 border-fuchsia-800/40'
          }`}>
            {/* Role badge */}
            <span className={isAdmin ? 'badge-admin' : 'badge-operator'}>
              {isAdmin
                ? <><ShieldCheck className="w-2.5 h-2.5" /> Admin</>
                : <><UserCog  className="w-2.5 h-2.5" /> Operator</>
              }
            </span>

            {/* Name */}
            <span className="text-xs font-semibold text-slate-200 max-w-[110px] truncate">{user.name}</span>

            {/* Avatar */}
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover border border-white/10 flex-shrink-0" />
            ) : (
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[11px] flex-shrink-0 ${
                isAdmin ? 'bg-violet-700' : 'bg-fuchsia-700'
              }`}>
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Đăng xuất khỏi hệ thống"
              className="p-1.5 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}


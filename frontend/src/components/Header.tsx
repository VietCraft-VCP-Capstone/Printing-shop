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
  const currentTab = TAB_LABELS[activeTab] || { title: 'Giao diện Xưởng In', subtitle: 'Printing Shop Portal' };

  return (
    <header className="h-[68px] bg-white/80 backdrop-blur-lg border-b border-slate-200/80 px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-40 shadow-xs">
      {/* Left: page distinction title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Printer className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900 leading-none">{currentTab.title}</h2>
          <p className="text-[11px] text-violet-600 mt-1 leading-none font-semibold">{currentTab.subtitle}</p>
        </div>
      </div>

      {/* Right: status + profile */}
      <div className="flex items-center gap-3">
        {/* DB status chip */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-600">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Database className="w-3 h-3 text-violet-600" />
          <span>Database <strong className="text-violet-700">Atlas Live</strong></span>
        </div>

        {/* Profile card */}
        {user && (
          <div className={`flex items-center gap-2.5 border rounded-xl pl-2 pr-1 py-1 transition-all ${
            isAdmin
              ? 'bg-violet-50 border-violet-200'
              : 'bg-fuchsia-50 border-fuchsia-200'
          }`}>
            {/* Role badge */}
            <span className={isAdmin ? 'badge-admin' : 'badge-operator'}>
              {isAdmin
                ? <><ShieldCheck className="w-2.5 h-2.5" /> Admin</>
                : <><UserCog  className="w-2.5 h-2.5" /> Operator</>
              }
            </span>

            {/* Name */}
            <span className="text-xs font-bold text-slate-800 max-w-[110px] truncate">{user.name}</span>

            {/* Avatar */}
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
            ) : (
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[11px] flex-shrink-0 ${
                isAdmin ? 'bg-violet-600' : 'bg-fuchsia-600'
              }`}>
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Đăng xuất khỏi hệ thống"
              className="p-1.5 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}


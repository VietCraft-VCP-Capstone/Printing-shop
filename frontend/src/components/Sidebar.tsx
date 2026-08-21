import { Printer, LayoutDashboard, Layers, RefreshCw, ShieldCheck, UserCog, Lock, Truck, Settings as SettingsIcon } from 'lucide-react';

export type TabType = 'dashboard' | 'orders' | 'logistics' | 'catalog' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingJobsCount: number;
  onRefresh: () => void;
  userRole: string;
}

export default function Sidebar({ activeTab, setActiveTab, pendingJobsCount, onRefresh, userRole }: SidebarProps) {
  const isAdmin = userRole === 'ADMIN';

  const navItem = (
    tab: TabType,
    icon: React.ReactNode,
    label: string,
    badge?: React.ReactNode,
    locked?: boolean
  ) => {
    const isActive = activeTab === tab;
    return (
      <button
        key={tab}
        onClick={() => !locked && setActiveTab(tab)}
        disabled={locked}
        title={locked ? 'Yêu cầu quyền Admin' : undefined}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
          locked
            ? 'text-slate-600 cursor-not-allowed opacity-50'
            : isActive
            ? 'bg-gradient-to-r from-violet-600/25 to-fuchsia-500/10 border border-violet-500/35 text-white shadow-inner'
            : 'text-slate-400 hover:bg-[#1a1444]/70 hover:text-slate-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            locked
              ? 'bg-slate-800'
              : isActive
              ? 'bg-violet-600/30 text-violet-300'
              : 'bg-white/5'
          }`}>
            {locked ? <Lock className="w-3.5 h-3.5" /> : icon}
          </div>
          <span className="font-medium">{label}</span>
        </div>
        {badge}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-[#0d0926] border-r border-[#180f3a] flex flex-col flex-shrink-0 min-h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-[#180f3a] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0">
          <Printer className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-black text-base leading-tight text-white">VietCraft Print</h1>
          <span className="text-[10px] text-violet-400 font-semibold tracking-widest uppercase">Portal Xưởng In</span>
        </div>
      </div>

      {/* Role indicator strip */}
      <div className={`px-4 py-2.5 border-b border-[#180f3a] flex items-center gap-2 ${
        isAdmin ? 'bg-violet-950/20' : 'bg-fuchsia-950/20'
      }`}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isAdmin ? 'bg-violet-700/40 text-violet-300' : 'bg-fuchsia-700/40 text-fuchsia-300'
        }`}>
          {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserCog className="w-4 h-4" />}
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isAdmin ? 'text-violet-300' : 'text-fuchsia-300'}`}>
            {isAdmin ? 'Quản trị viên (Admin)' : 'Nhân viên vận hành'}
          </p>
          <p className="text-[9px] text-slate-500 leading-none mt-0.5">
            {isAdmin ? 'Toàn quyền hệ thống' : 'Hạn chế chức năng'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest px-3 pt-1 pb-2">Danh sách trang</p>

        {navItem('dashboard', <LayoutDashboard className="w-4 h-4" />, '1. Dashboard (Tổng quan)')}
        
        {navItem(
          'orders',
          <Printer className="w-4 h-4" />,
          '2. Đơn in ấn',
          pendingJobsCount > 0 ? (
            <span className="bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {pendingJobsCount}
            </span>
          ) : undefined
        )}

        {navItem(
          'logistics',
          <Truck className="w-4 h-4" />,
          '3. Logi (Vận chuyển)'
        )}

        {navItem(
          'catalog',
          <Layers className="w-4 h-4" />,
          '4. Catalog Phôi',
          !isAdmin ? (
            <span className="text-[9px] text-slate-600 font-bold uppercase">Admin</span>
          ) : undefined,
          !isAdmin
        )}

        {navItem(
          'settings',
          <SettingsIcon className="w-4 h-4" />,
          '5. Cấu hình System'
        )}
      </nav>

      {/* Footer */}
      <div className="p-3.5 border-t border-[#180f3a] flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
          <span className="text-emerald-400 font-semibold text-[10px] uppercase tracking-wider">Hệ thống sẵn sàng</span>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 hover:bg-[#1e174e] rounded-lg transition-colors text-slate-400 hover:text-white"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}


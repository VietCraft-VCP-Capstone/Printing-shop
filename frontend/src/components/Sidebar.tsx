import { Printer, LayoutDashboard, Layers, RefreshCw, ShieldCheck, UserCog, Lock, Truck, Settings as SettingsIcon, ClipboardList } from 'lucide-react';

export type TabType = 'dashboard' | 'orders' | 'refunds' | 'logistics' | 'catalog' | 'settings';

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
            ? 'text-slate-400 cursor-not-allowed opacity-60'
            : isActive
            ? 'bg-violet-50 border border-violet-200 text-violet-700 font-bold shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            locked
              ? 'bg-slate-100 text-slate-400'
              : isActive
              ? 'bg-violet-600 text-white'
              : 'bg-slate-100 text-slate-500'
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
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col flex-shrink-0 min-h-screen text-slate-800 shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-md shadow-violet-500/20 flex-shrink-0">
          <Printer className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-black text-base leading-tight text-slate-900">Printing Shop</h1>
          <span className="text-[10px] text-violet-600 font-bold tracking-widest uppercase">Portal Xưởng In</span>
        </div>
      </div>

      {/* Role indicator strip */}
      <div className={`px-4 py-2.5 border-b border-slate-100 flex items-center gap-2 ${
        isAdmin ? 'bg-violet-50/50' : 'bg-fuchsia-50/50'
      }`}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-fuchsia-100 text-fuchsia-700'
        }`}>
          {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserCog className="w-4 h-4" />}
        </div>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${isAdmin ? 'text-violet-700' : 'text-fuchsia-700'}`}>
            {isAdmin ? 'Quản trị viên (Admin)' : 'Nhân viên vận hành'}
          </p>
          <p className="text-[9px] text-slate-500 leading-none mt-0.5">
            {isAdmin ? 'Toàn quyền hệ thống' : 'Hạn chế chức năng'}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest px-3 pt-1 pb-2">Danh sách trang</p>

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

        {navItem('refunds', <ClipboardList className="w-4 h-4" />, 'Yêu cầu Refund POD')}

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
            <span className="text-[9px] text-slate-400 font-bold uppercase">Admin</span>
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
      <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
          <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider">Hệ thống sẵn sàng</span>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

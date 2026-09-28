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

  const navItems: Array<{
    tab: TabType;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    badgeCount?: number;
    adminOnly?: boolean;
  }> = [
    { tab: 'dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
    { tab: 'orders', icon: Printer, label: 'Đơn in ấn', badgeCount: pendingJobsCount },
    { tab: 'refunds', icon: ClipboardList, label: 'Yêu cầu Refund POD' },
    { tab: 'logistics', icon: Truck, label: 'Vận chuyển' },
    { tab: 'catalog', icon: Layers, label: 'Kho phôi POD', adminOnly: !isAdmin },
    { tab: 'settings', icon: SettingsIcon, label: 'Cấu hình hệ thống' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col flex-shrink-0 min-h-screen select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-sm shadow-violet-500/25 flex-shrink-0">
          <Printer className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
            Printing Shop
          </h1>
          <p className="text-[11px] text-violet-600 font-medium tracking-tight truncate">
            Đối tác in VietCraft
          </p>
        </div>
      </div>

      {/* Role Profile Indicator */}
      <div className="px-4 py-3 mx-3 my-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-slate-200 text-slate-700'
        }`}>
          {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <UserCog className="w-4 h-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-800 leading-tight truncate">
            {isAdmin ? 'Quản trị viên' : 'Kỹ thuật viên in'}
          </p>
          <span className={`inline-block text-[10px] font-medium leading-tight ${
            isAdmin ? 'text-violet-600' : 'text-slate-500'
          }`}>
            {isAdmin ? 'Quyền Admin toàn phần' : 'Vận hành & đóng gói'}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="px-3 pt-1 pb-1">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3">
          Menu Điều Hành
        </span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ tab, icon: Icon, label, badgeCount, adminOnly }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => !adminOnly && setActiveTab(tab)}
              disabled={adminOnly}
              title={adminOnly ? 'Cần quyền Admin để truy cập' : undefined}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                adminOnly
                  ? 'text-slate-400 opacity-60 cursor-not-allowed'
                  : isActive
                  ? 'bg-violet-600 text-white font-semibold shadow-xs shadow-violet-600/20'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{label}</span>
              </div>

              {adminOnly ? (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              ) : badgeCount !== undefined && badgeCount > 0 ? (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold leading-none ${
                  isActive ? 'bg-white text-violet-700' : 'bg-violet-100 text-violet-700'
                }`}>
                  {badgeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2 px-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-medium text-slate-600">Trực tuyến</span>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 hover:bg-white border border-transparent hover:border-slate-200 rounded-lg transition-all text-slate-400 hover:text-slate-700 shadow-xs hover:shadow-xs"
          title="Làm mới dữ liệu từ server"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

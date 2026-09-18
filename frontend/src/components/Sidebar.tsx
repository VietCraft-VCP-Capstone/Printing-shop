import { Printer, LayoutDashboard, Layers, RefreshCw, Shirt, Settings as SettingsIcon, Palette, ExternalLink } from 'lucide-react';

export type TabType = 'dashboard' | 'orders' | 'logistics' | 'catalog' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingJobsCount: number;
  onRefresh: () => void;
  userRole: string;
}

export default function Sidebar({ activeTab, setActiveTab, pendingJobsCount, onRefresh, userRole }: SidebarProps) {
  const isPod = userRole === 'POD_FACTORY' || userRole === 'OPERATOR' || userRole === 'ADMIN' || !userRole;
  const isGarment = userRole === 'GARMENT_FACTORY' || userRole === 'ADMIN';

  const roleMeta = userRole === 'GARMENT_FACTORY' ? {
    title: 'Xưởng May Mặc',
    sub: 'Cung cấp kho phôi may mặc',
    bg: 'bg-fuchsia-50/70',
    badgeBg: 'bg-fuchsia-100 text-fuchsia-700',
    textColor: 'text-fuchsia-700',
    icon: <Shirt className="w-4 h-4" />
  } : {
    title: 'Xưởng In POD',
    sub: 'In ấn theo yêu cầu',
    bg: 'bg-violet-50/70',
    badgeBg: 'bg-violet-100 text-violet-700',
    textColor: 'text-violet-700',
    icon: <Printer className="w-4 h-4" />
  };

  const navItem = (
    tab: TabType,
    icon: React.ReactNode,
    label: string,
    badge?: React.ReactNode
  ) => {
    const isActive = activeTab === tab;
    return (
      <button
        key={tab}
        type="button"
        onClick={() => setActiveTab(tab)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
          isActive
            ? 'bg-violet-50 border border-violet-200 text-violet-700 font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
            isActive
              ? 'bg-violet-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {icon}
          </div>
          <span className="truncate">{label}</span>
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
          <h1 className="font-black text-base leading-tight text-slate-900">VietCraft Hub</h1>
          <span className="text-[10px] text-violet-600 font-bold tracking-widest uppercase">Cổng Xưởng Đối Tác</span>
        </div>
      </div>

      {/* Role indicator strip */}
      <div className={`px-4 py-2.5 border-b border-slate-100 flex items-center gap-2.5 ${roleMeta.bg}`}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${roleMeta.badgeBg}`}>
          {roleMeta.icon}
        </div>
        <div className="min-w-0">
          <p className={`text-[11px] font-black uppercase tracking-wider leading-none truncate ${roleMeta.textColor}`}>
            {roleMeta.title}
          </p>
          <p className="text-[10px] text-slate-500 leading-none mt-1 truncate">
            {roleMeta.sub}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider px-3 pt-1 pb-2">Chức năng xưởng</p>

        {/* 1. Tổng quan */}
        {navItem('dashboard', <LayoutDashboard className="w-4 h-4" />, 'Tổng quan')}

        {/* 2. Đơn in ấn: Dành cho Xưởng In POD */}
        {isPod && navItem(
          'orders',
          <Printer className="w-4 h-4" />,
          'Đơn in ấn',
          pendingJobsCount > 0 ? (
            <span className="bg-violet-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0">
              {pendingJobsCount}
            </span>
          ) : undefined
        )}

        {/* 3. Kho phôi may mặc: Dành cho Xưởng May Mặc (hoặc cả 2) */}
        {isGarment && navItem(
          'catalog',
          <Layers className="w-4 h-4" />,
          'Kho phôi may mặc'
        )}

        {/* 4. Cấu hình hệ thống & API Key / Webhook */}
        {navItem(
          'settings',
          <SettingsIcon className="w-4 h-4" />,
          'Cấu hình kết nối'
        )}
      </nav>

      {/* Liên kết sang Cổng Designer / Seller */}
      <div className="p-3 mx-3 mb-2 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-1">
        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
          <Palette className="w-3.5 h-3.5 text-amber-600" />
          <span>Designer (Seller)</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-tight">
          Thiết kế & quản lý gian hàng trên sàn VietCraft
        </p>
        <a
          href={import.meta.env.VITE_VIETCRAFT_FE_URL ? `${import.meta.env.VITE_VIETCRAFT_FE_URL}/seller` : "http://localhost:3000/seller"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-[11px] text-amber-700 font-bold hover:text-amber-900 flex items-center gap-1 inline-flex hover:underline cursor-pointer"
        >
          Sang Cổng Seller <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Footer */}
      <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
          <span className="text-emerald-600 font-bold text-[10px] uppercase tracking-wider">Đã kết nối sàn</span>
        </div>
        <button
          onClick={onRefresh}
          type="button"
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
          title="Làm mới dữ liệu"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

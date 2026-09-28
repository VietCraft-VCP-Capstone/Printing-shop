import { Database, LogOut, ShieldCheck, UserCog } from 'lucide-react';
import type { TabType } from './Sidebar';

interface HeaderProps {
  activeTab: TabType;
  user: any;
  onLogout: () => void;
}

const TAB_METADATA: Record<TabType, { title: string; subtitle: string }> = {
  dashboard: { 
    title: 'Tổng quan hệ thống', 
    subtitle: 'Theo dõi tiến độ in ấn & hiệu suất xưởng thời gian thực' 
  },
  orders: { 
    title: 'Quản lý đơn in ấn', 
    subtitle: 'Tiếp nhận file thiết kế, duyệt in và đóng gói sản phẩm' 
  },
  logistics: { 
    title: 'Vận chuyển & Giao vận', 
    subtitle: 'Ủy quyền xuất kho và tích hợp mã vận đơn GHN / GHTK' 
  },
  catalog: { 
    title: 'Kho phôi sản phẩm POD', 
    subtitle: 'Danh mục phôi vật tư, vùng in & đơn giá cung ứng cho sàn VietCraft' 
  },
  settings: { 
    title: 'Cấu hình hệ thống', 
    subtitle: 'Thiết lập máy in phần cứng, API keys & đồng bộ Webhook realtime' 
  },
};

export default function Header({ activeTab, user, onLogout }: HeaderProps) {
  const isAdmin = user?.role === 'ADMIN';
  const meta = TAB_METADATA[activeTab] || { 
    title: 'Bảng điều khiển', 
    subtitle: 'Hệ thống xưởng in đối tác VietCraft' 
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between flex-shrink-0 sticky top-0 z-30 shadow-xs">
      {/* Page Title & Breadcrumb */}
      <div>
        <h2 className="text-base font-bold text-slate-900 leading-tight">
          {meta.title}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 leading-none">
          {meta.subtitle}
        </p>
      </div>

      {/* Right Actions & User Profile */}
      <div className="flex items-center gap-3">
        {/* System live status */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 text-xs text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span>MongoDB <strong className="text-slate-800 font-semibold">Atlas Live</strong></span>
        </div>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl px-2.5 py-1.5 transition-all">
            {/* User Avatar */}
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-7 h-7 rounded-lg object-cover border border-slate-200 flex-shrink-0" 
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}

            {/* Name and Role */}
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 max-w-[120px] truncate leading-tight">
                {user.name}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 leading-tight">
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-2.5 h-2.5 text-violet-600" /> Admin
                  </>
                ) : (
                  <>
                    <UserCog className="w-2.5 h-2.5 text-slate-500" /> Operator
                  </>
                )}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              title="Đăng xuất khỏi hệ thống"
              className="ml-1 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

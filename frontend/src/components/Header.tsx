import { Database, LogOut, Printer, Shirt } from 'lucide-react';
import type { TabType } from './Sidebar';

interface HeaderProps {
  activeTab: TabType;
  user: any;
  onLogout: () => void;
}

const TAB_LABELS: Record<TabType, { title: string; subtitle: string }> = {
  dashboard: { title: 'Tổng Quan Hệ Thống', subtitle: 'Theo dõi chỉ số vận hành và tiến độ công việc' },
  orders:    { title: 'Quản Lý Đơn In Ấn', subtitle: 'Danh sách đơn hàng cần xử lý và in ấn sản phẩm' },
  logistics: { title: 'Quản Lý Giao Vận', subtitle: 'Đóng gói bưu phẩm và ủy quyền hãng vận chuyển GHN, GHTK' },
  catalog:   { title: 'Danh Mục Phôi Sản Phẩm', subtitle: 'Bảng giá và kho phôi vật tư cung ứng cho sàn VietCraft' },
  settings:  { title: 'Cấu Hình Hệ Thống', subtitle: 'Thiết lập máy in phần cứng, API Keys và Webhook sàn VietCraft' },
};

export default function Header({ activeTab, user, onLogout }: HeaderProps) {
  const role = user?.role;
  const isGarment = role === 'GARMENT_FACTORY';

  const currentTab = TAB_LABELS[activeTab] || { title: 'Hệ Thống Xưởng In', subtitle: 'VietCraft Printing Portal' };

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
          <span>Sàn VietCraft: <strong className="text-emerald-700">Đã đồng bộ</strong></span>
        </div>

        {/* Profile card */}
        {user && (
          <div className={`flex items-center gap-2.5 border rounded-xl pl-2 pr-1.5 py-1 transition-all ${
            isGarment
              ? 'bg-fuchsia-50 border-fuchsia-200'
              : 'bg-violet-50 border-violet-200'
          }`}>
            {/* Role badge */}
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
              isGarment
                ? 'bg-fuchsia-100 text-fuchsia-800'
                : 'bg-violet-100 text-violet-800'
            }`}>
              {isGarment ? <><Shirt className="w-3 h-3" /> Xưởng May Mặc</> : <><Printer className="w-3 h-3" /> Xưởng In POD</>}
            </span>

            {/* Name */}
            <span className="text-xs font-bold text-slate-800 max-w-[120px] truncate">{user.name}</span>

            {/* Avatar */}
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
            ) : (
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-[11px] flex-shrink-0 ${
                isGarment ? 'bg-fuchsia-600' : 'bg-violet-600'
              }`}>
                {user.name?.[0]?.toUpperCase()}
              </div>
            )}

            {/* Logout */}
            <button
              onClick={onLogout}
              type="button"
              title="Đăng xuất khỏi hệ thống"
              className="p-1.5 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

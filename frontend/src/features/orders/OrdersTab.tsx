import { useState } from 'react';
import { Search, RefreshCw, Layers } from 'lucide-react';
import OrderRow from './components/OrderRow';

interface OrdersTabProps {
  orders: any[];
  loadingOrders: boolean;
  onUpdateStatus: (orderId: string, currentStatus: string, rejectionReason?: string) => void;
  onOpenShipModal: (order: any) => void;
  onRefresh: () => void;
  userRole: string;
}

type StatusFilter = 'ALL' | 'RECEIVED' | 'PRINTING' | 'PACKAGED' | 'SHIPPED' | 'REJECTED';

export default function OrdersTab({
  orders,
  loadingOrders,
  onUpdateStatus,
  onOpenShipModal,
  onRefresh,
  userRole
}: OrdersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchSearch = !searchQuery || 
      o.order_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shipping_address?.recipient_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filterTabs: Array<{ id: StatusFilter; label: string; count: number }> = [
    { id: 'ALL', label: 'Tất cả đơn', count: orders.length },
    { id: 'RECEIVED', label: 'Chờ duyệt', count: orders.filter(o => o.status === 'RECEIVED').length },
    { id: 'PRINTING', label: 'Đang in', count: orders.filter(o => o.status === 'PRINTING').length },
    { id: 'PACKAGED', label: 'Đã đóng gói', count: orders.filter(o => o.status === 'PACKAGED').length },
    { id: 'SHIPPED', label: 'Đã xuất kho', count: orders.filter(o => o.status === 'SHIPPED').length },
    { id: 'REJECTED', label: 'Báo lỗi / Từ chối', count: orders.filter(o => o.status === 'REJECTED').length },
  ];

  return (
    <div className="space-y-4 animate-fade-in text-slate-800">
      {/* Top Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Search & Refresh Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo mã đơn, gian hàng, tên khách hàng..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium transition-all"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            <span className="text-xs text-slate-500">
              Hiển thị <strong className="text-slate-800 font-bold">{filteredOrders.length}</strong> đơn
            </span>
            <button 
              onClick={onRefresh} 
              className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Tải lại
            </button>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-xs">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-violet-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === tab.id ? 'bg-violet-800/60 text-white' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Order List Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3.5">Mã đơn / Ngày nhận</th>
                <th className="px-5 py-3.5">Người nhận / Địa chỉ</th>
                <th className="px-5 py-3.5">Chi tiết in ấn (Sản phẩm / File)</th>
                <th className="px-5 py-3.5 text-center">SL</th>
                <th className="px-5 py-3.5 text-center">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Thao tác sản xuất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loadingOrders ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    Đang tải danh sách công việc in ấn...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <div className="max-w-xs mx-auto text-center">
                      <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">Không tìm thấy đơn in nào</p>
                      <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <OrderRow 
                    key={o._id}
                    order={o}
                    onUpdateStatus={onUpdateStatus}
                    onOpenShipModal={onOpenShipModal}
                    userRole={userRole}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

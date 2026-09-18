import { useState } from 'react';
import { Search, RefreshCw, Layers, Printer, Package, Truck, Filter, AlertCircle } from 'lucide-react';
import OrderRow from './components/OrderRow';

interface OrdersTabProps {
  orders: any[];
  loadingOrders: boolean;
  onUpdateStatus: (orderId: string, currentStatus: string) => void;
  onOpenShipModal: (order: any) => void;
  onRefresh: () => void;
  userRole: string;
}

type StatusFilter = 'ALL' | 'RECEIVED' | 'PRINTING' | 'PACKAGED' | 'SHIPPED';

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

  // Counters
  const receivedCount = orders.filter(o => o.status === 'RECEIVED').length;
  const printingCount = orders.filter(o => o.status === 'PRINTING').length;
  const packagedCount = orders.filter(o => o.status === 'PACKAGED').length;
  const shippedCount = orders.filter(o => o.status === 'SHIPPED').length;

  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchQuery = !searchQuery || 
      o.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items?.some((it: any) => it.title?.toLowerCase().includes(searchQuery.toLowerCase()) || it.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Top Banner & Quick KPI */}
      <div className="bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-violet-300 text-xs font-bold mb-2 border border-white/10">
              <Printer className="w-3.5 h-3.5" /> Quản Lý Đơn In Ấn Theo Yêu Cầu
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Danh Sách Công Việc Sản Xuất</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Theo dõi tiến độ từ tiếp nhận file thiết kế từ sàn VietCraft, vận hành máy in cho tới đóng gói và xuất kho giao hàng.
            </p>
          </div>

          {/* Mini Counter Cards */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 px-4 text-center min-w-[90px]">
              <span className="text-[10px] text-amber-300 uppercase font-black block">Chờ in</span>
              <span className="text-xl font-black text-white">{receivedCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 px-4 text-center min-w-[90px]">
              <span className="text-[10px] text-fuchsia-300 uppercase font-black block">Đang in</span>
              <span className="text-xl font-black text-white">{printingCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 px-4 text-center min-w-[90px]">
              <span className="text-[10px] text-blue-300 uppercase font-black block">Đã đóng gói</span>
              <span className="text-xl font-black text-white">{packagedCount}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 px-4 text-center min-w-[90px]">
              <span className="text-[10px] text-emerald-300 uppercase font-black block">Đã xuất</span>
              <span className="text-xl font-black text-white">{shippedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm mã đơn, tên khách, tên sản phẩm, SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10 font-medium transition-all"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <span className="text-xs text-slate-500 font-medium">
              Đơn hiển thị: <strong className="text-slate-900 font-bold">{filteredOrders.length}</strong> / {orders.length}
            </span>
            <button 
              onClick={onRefresh} 
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Tải lại
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 text-xs font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Tất cả</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('RECEIVED')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'RECEIVED'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            <span>Chờ in ấn</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'RECEIVED' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'}`}>
              {receivedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('PRINTING')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'PRINTING'
                ? 'bg-fuchsia-600 text-white shadow-sm'
                : 'bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200/60 hover:bg-fuchsia-100'
            }`}
          >
            <Printer className="w-3 h-3" />
            <span>Đang in ấn</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'PRINTING' ? 'bg-white/20 text-white' : 'bg-fuchsia-200 text-fuchsia-900'}`}>
              {printingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('PACKAGED')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'PACKAGED'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-blue-50 text-blue-800 border border-blue-200/60 hover:bg-blue-100'
            }`}
          >
            <Package className="w-3 h-3" />
            <span>Đã đóng gói</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'PACKAGED' ? 'bg-white/20 text-white' : 'bg-blue-200 text-blue-900'}`}>
              {packagedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('SHIPPED')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              statusFilter === 'SHIPPED'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Đã giao vận</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'SHIPPED' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
              {shippedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Order List Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Mã đơn / Ngày nhận</th>
                <th className="px-6 py-4">Khách nhận / Địa chỉ</th>
                <th className="px-6 py-4">Thông tin in ấn (Sản phẩm / File)</th>
                <th className="px-6 py-4 text-center">Số lượng</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loadingOrders ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
                      <span className="font-medium text-xs">Đang tải danh sách công việc in ấn...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                        <Layers className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-slate-700 text-sm">Không có đơn hàng nào</span>
                      <p className="text-[11px] text-slate-400">
                        {searchQuery ? 'Không tìm thấy đơn hàng nào khớp với từ khóa tìm kiếm.' : 'Chưa có đơn hàng nào ở trạng thái này.'}
                      </p>
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

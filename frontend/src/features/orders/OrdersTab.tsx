import { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import OrderRow from './components/OrderRow';

interface OrdersTabProps {
  orders: any[];
  loadingOrders: boolean;
  onUpdateStatus: (orderId: string, currentStatus: string) => void;
  onOpenShipModal: (order: any) => void;
  onRefresh: () => void;
  userRole: string;
}

export default function OrdersTab({
  orders,
  loadingOrders,
  onUpdateStatus,
  onOpenShipModal,
  onRefresh,
  userRole
}: OrdersTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(o => 
    o.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.buyer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Search and control bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Tìm mã đơn hàng, tên khách..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium transition-all"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-slate-500 font-medium">Đơn đã lọc: <strong className="text-slate-900 font-bold">{filteredOrders.length}</strong></span>
          <button onClick={onRefresh} className="text-xs bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Tải lại
          </button>
        </div>
      </div>

      {/* Order List Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Mã đơn / Ngày nhận</th>
                <th className="px-6 py-4">Khách nhận / Địa chỉ</th>
                <th className="px-6 py-4">Thông tin in ấn (Sản phẩm / File)</th>
                <th className="px-6 py-4 text-center">Số lượng</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loadingOrders ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">Đang tải danh sách công việc in ấn...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">Không tìm thấy đơn hàng in ấn nào phù hợp.</td>
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

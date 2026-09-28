import { useState } from 'react';
import { Truck, PackageCheck, Search, ExternalLink } from 'lucide-react';

interface LogisticsTabProps {
  orders: any[];
  userRole: string;
  onOpenShipModal: (order: any) => void;
}

export default function LogisticsTab({ orders, userRole, onOpenShipModal }: LogisticsTabProps) {
  const [carrierFilter, setCarrierFilter] = useState<'ALL' | 'GHN' | 'GHTK'>('ALL');
  const [searchCode, setSearchCode] = useState('');

  const shippedOrders = orders.filter(o => o.status === 'SHIPPED');
  const readyToShipOrders = orders.filter(o => o.status === 'PACKAGED');

  const getCarrier = (o: any) => o.carrier || o.tracking_info?.carrier || 'GHN';
  const getTrackingNumber = (o: any) => o.tracking_number || o.tracking_info?.tracking_code || '---';

  const filteredShipped = shippedOrders.filter(o => {
    const carrier = getCarrier(o);
    const tracking = getTrackingNumber(o);
    const matchCarrier = carrierFilter === 'ALL' || carrier === carrierFilter;
    const matchSearch = !searchCode || 
      o.order_code?.toLowerCase().includes(searchCode.toLowerCase()) ||
      tracking.toLowerCase().includes(searchCode.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(searchCode.toLowerCase());
    return matchCarrier && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold mb-2 border border-blue-100">
            <Truck className="w-3.5 h-3.5" /> Điều phối vận tải đối tác
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Quản lý Giao Vận & Xuất Kho
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Xuất đơn vận chuyển trực tiếp qua cổng kết nối <strong className="text-slate-700">GHN (Giao Hàng Nhanh)</strong> và <strong className="text-slate-700">GHTK (Giao Hàng Tiết Kiệm)</strong>, đồng bộ tự động cho người mua theo dõi.
          </p>
        </div>

        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl px-4 py-3 text-right flex-shrink-0">
          <span className="text-[11px] text-amber-800 font-semibold block">Chờ bàn giao vận chuyển</span>
          <span className="text-xl font-bold text-amber-900">{readyToShipOrders.length} đơn</span>
        </div>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Tổng vận đơn xuất</span>
          <p className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{shippedOrders.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Tất cả hãng giao</span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">GHN Express</span>
          <p className="text-2xl font-bold text-orange-600 tracking-tight mt-1">
            {shippedOrders.filter(o => getCarrier(o) === 'GHN').length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Giao nhanh 1-2 ngày</span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">GHTK Express</span>
          <p className="text-2xl font-bold text-emerald-600 tracking-tight mt-1">
            {shippedOrders.filter(o => getCarrier(o) === 'GHTK').length}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Tiết kiệm 2-3 ngày</span>
        </div>
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Tỷ lệ xuất kho</span>
          <p className="text-2xl font-bold text-violet-600 tracking-tight mt-1">
            {orders.length > 0 ? Math.round((shippedOrders.length / orders.length) * 100) : 0}%
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Hoàn tất quy trình</span>
        </div>
      </div>

      {/* Ready to ship alert block */}
      {readyToShipOrders.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2 mb-3">
            <PackageCheck className="w-4 h-4 text-amber-700" />
            Đơn đã in & đóng gói — Chờ chọn đơn vị vận chuyển ({readyToShipOrders.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {readyToShipOrders.map(order => (
              <div key={order._id} className="bg-white border border-amber-200/70 rounded-xl p-3.5 flex justify-between items-center shadow-xs">
                <div className="min-w-0 pr-2">
                  <span className="font-mono font-bold text-xs text-slate-900 block truncate">{order.order_code}</span>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {order.buyer_name} • {order.shipping_address?.province_id || order.shipping_address?.address_detail || 'VN'}
                  </p>
                </div>
                <button
                  onClick={() => onOpenShipModal(order)}
                  disabled={userRole !== 'ADMIN'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 flex-shrink-0 transition-all ${
                    userRole === 'ADMIN' 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" /> Giao hàng
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logistics tracking list */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2 tracking-tight">
            <Truck className="w-4 h-4 text-blue-600" />
            Danh sách vận đơn đang lưu thông
          </h3>

          {/* Search & Filters */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã vận đơn..."
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
            <div className="flex bg-slate-100 border border-slate-200/80 rounded-xl p-0.5 text-xs font-medium">
              {(['ALL', 'GHN', 'GHTK'] as const).map(carrier => (
                <button
                  key={carrier}
                  onClick={() => setCarrierFilter(carrier)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    carrierFilter === carrier ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {carrier === 'ALL' ? 'Tất cả' : carrier}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table of shipments */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Mã đơn in</th>
                <th className="py-3 px-4">Đơn vị giao</th>
                <th className="py-3 px-4">Mã Vận Đơn</th>
                <th className="py-3 px-4">Người nhận & Địa chỉ</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipped.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Chưa có đơn vận chuyển nào phù hợp trong danh sách.
                  </td>
                </tr>
              ) : (
                filteredShipped.map(o => {
                  const carrier = getCarrier(o);
                  const tracking = getTrackingNumber(o);
                  return (
                    <tr key={o._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{o.order_code}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                          carrier === 'GHN' 
                            ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {carrier} Express
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-blue-700 font-semibold">
                        {tracking}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">{o.buyer_name}</span>
                        <span className="text-slate-500 text-[11px] truncate max-w-[200px] block">
                          {o.shipping_address?.address_detail || o.shipping_address?.full_address || 'Địa chỉ nhận'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Đang vận chuyển
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`Tra cứu hành trình vận đơn ${tracking}`)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                        >
                          Tra cứu <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

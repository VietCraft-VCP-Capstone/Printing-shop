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

  const filteredShipped = shippedOrders.filter(o => {
    const matchCarrier = carrierFilter === 'ALL' || o.tracking_info?.carrier === carrierFilter;
    const matchSearch = !searchCode || 
      o.order_code.toLowerCase().includes(searchCode.toLowerCase()) ||
      o.tracking_info?.tracking_code?.toLowerCase().includes(searchCode.toLowerCase()) ||
      o.buyer_name.toLowerCase().includes(searchCode.toLowerCase());
    return matchCarrier && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      {/* Distinction Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-indigo-900/30 to-[#120e33] border border-blue-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Truck className="w-3.5 h-3.5" /> Trang 3: Logi & Giao Vận
            </div>
            <h2 className="text-2xl font-black text-white">Quản Lý Vận Chuyển (Logistics)</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Trang chuyên trách theo dõi hành trình đơn hàng, tạo đơn vận chuyển trực tiếp qua cổng kết nối <strong>GHN (Giao Hàng Nhanh)</strong> và <strong>GHTK (Giao Hàng Tiết Kiệm)</strong>.
            </p>
          </div>
          <div className="bg-[#0c0826]/80 border border-[#231a5c] rounded-xl p-4 text-right">
            <span className="text-xs text-slate-400 block">Đơn chờ bàn giao vận chuyển</span>
            <span className="text-2xl font-black text-amber-400">{readyToShipOrders.length} đơn</span>
          </div>
        </div>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#120e33] border border-[#201955] rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Tổng vận đơn đã xuất</span>
          <p className="text-xl font-bold text-white mt-1">{shippedOrders.length} vận đơn</p>
        </div>
        <div className="bg-[#120e33] border border-[#201955] rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Hợp tác GHN Express</span>
          <p className="text-xl font-bold text-orange-400 mt-1">
            {shippedOrders.filter(o => o.tracking_info?.carrier === 'GHN').length} đơn
          </p>
        </div>
        <div className="bg-[#120e33] border border-[#201955] rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Hợp tác GHTK Express</span>
          <p className="text-xl font-bold text-emerald-400 mt-1">
            {shippedOrders.filter(o => o.tracking_info?.carrier === 'GHTK').length} đơn
          </p>
        </div>
        <div className="bg-[#120e33] border border-[#201955] rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Đơn đang lưu thông</span>
          <p className="text-xl font-bold text-violet-400 mt-1">
            {shippedOrders.length > 0 ? `${shippedOrders.length} đơn` : '--'}
          </p>
        </div>
      </div>

      {/* Ready to ship alert block */}
      {readyToShipOrders.length > 0 && (
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-3">
            <PackageCheck className="w-4 h-4" />
            Đơn hàng in xong đã đóng gói - Chờ chọn hãng vận chuyển ({readyToShipOrders.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {readyToShipOrders.map(order => (
              <div key={order._id} className="bg-[#16103c] border border-[#2d2274] rounded-xl p-3.5 flex justify-between items-center">
                <div>
                  <span className="font-bold text-sm text-white">{order.order_code}</span>
                  <p className="text-xs text-slate-400">{order.buyer_name} • {order.shipping_address?.province || 'VN'}</p>
                </div>
                <button
                  onClick={() => onOpenShipModal(order)}
                  disabled={userRole !== 'ADMIN'}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white flex items-center gap-1 ${
                    userRole === 'ADMIN' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" /> Gửi Logi
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logistics tracking list */}
      <div className="bg-[#120e33] border border-[#201955] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            Danh sách đơn vận chuyển đang lưu thông
          </h3>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm mã vận đơn, mã đơn..."
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                className="w-full bg-[#1b1548] border border-[#2e2671] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex bg-[#16103c] border border-[#2d2274] rounded-xl p-1 text-xs">
              {(['ALL', 'GHN', 'GHTK'] as const).map(carrier => (
                <button
                  key={carrier}
                  onClick={() => setCarrierFilter(carrier)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    carrierFilter === carrier ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
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
              <tr className="bg-[#191444]/60 border-b border-[#201955] text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Mã đơn in</th>
                <th className="py-3 px-4">Đơn vị giao hàng</th>
                <th className="py-3 px-4">Mã Vận Đơn (Tracking Code)</th>
                <th className="py-3 px-4">Người nhận & Địa chỉ</th>
                <th className="py-3 px-4 text-center">Trạng thái Logi</th>
                <th className="py-3 px-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#201955]">
              {filteredShipped.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500">
                    Chưa có đơn vận chuyển nào phù hợp trong danh sách Logi.
                  </td>
                </tr>
              ) : (
                filteredShipped.map(o => (
                  <tr key={o._id} className="hover:bg-[#1b1548]/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{o.order_code}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] ${
                        o.tracking_info?.carrier === 'GHN' 
                          ? 'bg-orange-950 text-orange-400 border border-orange-800' 
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {o.tracking_info?.carrier || 'GHN'} EXPRESS
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-300 font-bold">
                      {o.tracking_info?.tracking_code || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200 block">{o.buyer_name}</span>
                      <span className="text-slate-400 text-[11px] truncate max-w-[200px] block">{o.shipping_address?.full_address || 'Địa chỉ khách'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Đang trung chuyển
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Tra cứu hành trình vận đơn ${o.tracking_info?.tracking_code || o.order_code}`)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
                      >
                        Tra cứu <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

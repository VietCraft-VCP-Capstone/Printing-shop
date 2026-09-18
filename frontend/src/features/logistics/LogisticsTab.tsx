import { useState } from 'react';
import { Truck, PackageCheck, Search, ExternalLink, Copy, Check, MapPin } from 'lucide-react';

interface LogisticsTabProps {
  orders: any[];
  userRole: string;
  onOpenShipModal: (order: any) => void;
}

export default function LogisticsTab({ orders, userRole, onOpenShipModal }: LogisticsTabProps) {
  const [carrierFilter, setCarrierFilter] = useState<'ALL' | 'GHN' | 'GHTK'>('ALL');
  const [searchCode, setSearchCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const canShip = userRole === 'ADMIN' || userRole === 'LOGISTICS';

  const shippedOrders = orders.filter(o => o.status === 'SHIPPED');
  const readyToShipOrders = orders.filter(o => o.status === 'PACKAGED');

  const getOrderCarrier = (o: any) => (o.carrier || o.tracking_info?.carrier || 'GHN').toUpperCase();
  const getOrderTracking = (o: any) => o.tracking_number || o.tracking_info?.tracking_code || 'Chưa có mã';

  const ghnCount = shippedOrders.filter(o => getOrderCarrier(o) === 'GHN').length;
  const ghtkCount = shippedOrders.filter(o => getOrderCarrier(o) === 'GHTK').length;

  const filteredShipped = shippedOrders.filter(o => {
    const carrier = getOrderCarrier(o);
    const tracking = getOrderTracking(o);
    const matchCarrier = carrierFilter === 'ALL' || carrier === carrierFilter;
    const matchSearch = !searchCode || 
      o.order_code.toLowerCase().includes(searchCode.toLowerCase()) ||
      tracking.toLowerCase().includes(searchCode.toLowerCase()) ||
      o.buyer_name.toLowerCase().includes(searchCode.toLowerCase());
    return matchCarrier && matchSearch;
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Distinction Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-300 text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
              <Truck className="w-3.5 h-3.5" /> Điều Phối Giao Vận & Kho Xuất Hàng
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Quản Lý Giao Hàng & Bàn Giao Vận Chuyển</h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Theo dõi bưu phẩm, kết nối trực tiếp với 2 đơn vị vận chuyển đối tác <strong className="text-orange-400">GHN Express</strong> và <strong className="text-emerald-400">GHTK Express</strong>. Tự động bắn Webhook về sàn VietCraft.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-center md:text-right min-w-[160px]">
            <span className="text-[11px] text-amber-300 uppercase font-black block">Chờ bàn giao hãng</span>
            <span className="text-3xl font-black text-white">{readyToShipOrders.length}</span>
            <span className="text-[10px] text-slate-300 block">đơn đã đóng gói</span>
          </div>
        </div>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Tổng đơn đã xuất kho</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{shippedOrders.length}</p>
          <span className="text-[10px] text-slate-400">Đã bàn giao vận chuyển</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Giao Hàng Nhanh (GHN)</span>
          <p className="text-2xl font-black text-orange-600 mt-1">{ghnCount}</p>
          <span className="text-[10px] text-orange-600/70 font-medium">Đối tác GHN Express</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Giao Hàng Tiết Kiệm (GHTK)</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{ghtkCount}</p>
          <span className="text-[10px] text-emerald-600/70 font-medium">Đối tác GHTK Express</span>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Quyền xử lý Logi</span>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${canShip ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
              {canShip ? '✓ Đã kích hoạt' : 'Chỉ xem'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">{userRole}</span>
        </div>
      </div>

      {/* Ready to ship alert block */}
      {readyToShipOrders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-amber-600" />
              Đơn hàng in xong đã đóng gói - Chờ bàn giao shipper ({readyToShipOrders.length})
            </h3>
            <span className="text-[11px] text-amber-800 font-medium bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300/60">
              Cần chọn GHN hoặc GHTK
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {readyToShipOrders.map(order => (
              <div key={order._id} className="bg-white border border-amber-200 rounded-xl p-3.5 flex justify-between items-center shadow-xs hover:border-amber-400 transition-all">
                <div className="min-w-0 pr-2">
                  <span className="font-extrabold text-sm text-slate-900 block truncate">{order.order_code}</span>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {order.buyer_name} • {order.shipping_address?.address_detail || order.shipping_address?.province_id || 'VN'}
                  </p>
                </div>
                <button
                  onClick={() => onOpenShipModal(order)}
                  disabled={!canShip}
                  title={!canShip ? 'Yêu cầu quyền Admin hoặc Giao vận để giao hàng' : ''}
                  className={`px-3 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-xs flex-shrink-0 cursor-pointer transition-all active:scale-95 ${
                    canShip 
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' 
                      : 'bg-slate-300 text-slate-500 opacity-60 cursor-not-allowed'
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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              Danh sách bưu phẩm đang lưu thông ({filteredShipped.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Bao gồm mã tracking đối soát và link tra cứu trực tiếp</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm mã vận đơn, mã đơn..."
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
            <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs font-bold">
              {(['ALL', 'GHN', 'GHTK'] as const).map(carrier => (
                <button
                  key={carrier}
                  onClick={() => setCarrierFilter(carrier)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    carrierFilter === carrier 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
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
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã đơn VietCraft</th>
                <th className="py-3.5 px-4">Hãng vận chuyển</th>
                <th className="py-3.5 px-4">Mã vận đơn (Tracking)</th>
                <th className="py-3.5 px-4">Người nhận & Địa chỉ</th>
                <th className="py-3.5 px-4 text-center">Trạng thái bưu phẩm</th>
                <th className="py-3.5 px-4 text-right">Tra cứu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredShipped.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    Chưa có đơn vận chuyển nào phù hợp trong danh sách Logi.
                  </td>
                </tr>
              ) : (
                filteredShipped.map(o => {
                  const carrier = getOrderCarrier(o);
                  const tracking = getOrderTracking(o);
                  return (
                    <tr key={o._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">{o.order_code}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] inline-flex items-center gap-1 ${
                          carrier === 'GHN' 
                            ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <Truck className="w-3 h-3" />
                          {carrier} EXPRESS
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-xs">
                            {tracking}
                          </span>
                          <button
                            onClick={() => handleCopy(tracking)}
                            title="Sao chép mã vận đơn"
                            className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-md transition-all cursor-pointer"
                          >
                            {copiedCode === tracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{o.buyer_name}</span>
                        <span className="text-slate-500 text-[11px] truncate max-w-[220px] block" title={o.shipping_address?.address_detail}>
                          <MapPin className="w-3 h-3 inline mr-1 text-slate-400" />
                          {o.shipping_address?.address_detail || 'Địa chỉ khách'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" /> Đang giao hàng
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={carrier === 'GHN' ? `https://donhang.ghn.vn/?order_code=${tracking}` : `https://i.ghtk.vn/${tracking}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          Theo dõi <ExternalLink className="w-3 h-3" />
                        </a>
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

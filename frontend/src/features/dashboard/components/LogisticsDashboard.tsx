import {
  Truck,
  Package,
  MapPin,
  Phone,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import StatCard from './StatCard';

interface LogisticsDashboardProps {
  orders: any[];
  stats: {
    packaged: number;
    shipped: number;
  };
  loadingOrders: boolean;
  onOpenShipModal: (order: any) => void;
  onNavigateToLogistics: () => void;
}

export default function LogisticsDashboard({
  orders,
  stats,
  loadingOrders,
  onOpenShipModal,
  onNavigateToLogistics
}: LogisticsDashboardProps) {
  const readyToShip = orders.filter(o => o.status === 'PACKAGED');
  const shippedOrders = orders.filter(o => o.status === 'SHIPPED');
  const ghnCount = orders.filter(o => o.carrier === 'GHN').length;
  const ghtkCount = orders.filter(o => o.carrier === 'GHTK').length;

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Logistics Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-700 text-white rounded-3xl p-6 md:p-8 shadow-lg shadow-blue-500/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3">
              <Truck className="w-3.5 h-3.5 text-blue-200" /> Bảng Điều Khiển Giao Vận
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Khu Vực Đóng Gói & Xuất Kho Vận Chuyển</h2>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Ủy quyền bưu phẩm cho đối tác GHN / GHTK, cấp phát mã tracking tự động và đồng bộ trạng thái giao hàng về sàn VietCraft.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-blue-100 block font-medium">Đơn chờ xuất kho</span>
              <span className="text-3xl font-black">{readyToShip.length}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-blue-100 block font-medium">Đã giao bưu tá</span>
              <span className="text-3xl font-black">{shippedOrders.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logistics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Đơn đã in xong chờ đóng gói"
          value={stats.packaged}
          unit="đơn"
          icon={<Package className="w-3.5 h-3.5 text-amber-600" />}
          statusText="Cần xuất vận đơn"
          hoverColorClass="hover:border-amber-300"
          glowColorClass="bg-amber-100"
          statusBgClass="text-amber-700 bg-amber-50 border border-amber-200"
        />

        <StatCard
          title="Tổng đơn đã xuất bưu tá"
          value={stats.shipped}
          unit="vận đơn"
          icon={<Truck className="w-3.5 h-3.5 text-blue-600" />}
          statusText="Đang trên đường giao"
          hoverColorClass="hover:border-blue-300"
          glowColorClass="bg-blue-100"
          statusBgClass="text-blue-700 bg-blue-50 border border-blue-200"
        />

        <StatCard
          title="Đối tác GHN Express"
          value={ghnCount}
          unit="kiện"
          icon={<Truck className="w-3.5 h-3.5 text-orange-600" />}
          statusText="Giao hàng nhanh"
          hoverColorClass="hover:border-orange-300"
          glowColorClass="bg-orange-100"
          statusBgClass="text-orange-700 bg-orange-50 border border-orange-200"
        />

        <StatCard
          title="Đối tác GHTK Express"
          value={ghtkCount}
          unit="kiện"
          icon={<Truck className="w-3.5 h-3.5 text-emerald-600" />}
          statusText="Tiết kiệm chuẩn"
          hoverColorClass="hover:border-emerald-300"
          glowColorClass="bg-emerald-100"
          statusBgClass="text-emerald-700 bg-emerald-50 border border-emerald-200"
        />
      </div>

      {/* Ready to Ship Section */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" /> Đơn Chờ Ủy Quyền Vận Chuyển (Ready to Ship)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các đơn hàng đã hoàn tất in ấn, cần dán mã vận đơn và bàn giao cho tài xế GHN / GHTK
            </p>
          </div>
          <button
            onClick={onNavigateToLogistics}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1"
          >
            Quản lý Logistics chi tiết <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center text-slate-400 text-xs">Đang tải danh sách kiện hàng...</div>
        ) : readyToShip.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            Không có đơn hàng nào tồn kho chờ đóng gói. Tất cả đơn đã được xuất vận đơn!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyToShip.map((order) => {
              const addr = order.shipping_address;
              const fullAddr = addr ? `${addr.address_detail || ''}, ${addr.province_id || ''}` : 'Chưa có địa chỉ';

              return (
                <div key={order._id} className="border border-blue-100 bg-blue-50/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono font-black text-sm text-blue-700">{order.order_code}</span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                        ĐÃ ĐÓNG GÓI
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                      <p className="font-bold text-slate-900 text-sm">{order.buyer_name}</p>
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Phone className="w-3 h-3 text-slate-400" /> {order.recipient_phone}
                      </p>
                      <p className="flex items-start gap-1.5 text-[11px] text-slate-500 line-clamp-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" /> {fullAddr}
                      </p>
                    </div>

                    <div className="border-t border-blue-100/80 pt-3 text-[11px] text-slate-500">
                      <span>Sản phẩm: </span>
                      <strong className="text-slate-800">
                        {order.items?.map((it: any) => `${it.title} (x${it.quantity})`).join(', ')}
                      </strong>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-blue-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Chọn hãng để phát hành vận đơn:</span>
                    <button
                      onClick={() => onOpenShipModal(order)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
                    >
                      <Truck className="w-3.5 h-3.5" /> Bàn giao GHN / GHTK
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Shipments Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600" /> Lịch Sử Xuất Kho Gần Đây
        </h3>
        {shippedOrders.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">Chưa có kiện hàng nào xuất kho.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold">
                  <th className="pb-2.5 pl-2">Mã Đơn</th>
                  <th className="pb-2.5">Người nhận</th>
                  <th className="pb-2.5">Hãng vận chuyển</th>
                  <th className="pb-2.5">Mã Vận Đơn (Tracking)</th>
                  <th className="pb-2.5 pr-2 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shippedOrders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 pl-2 font-mono font-bold text-blue-700">{order.order_code}</td>
                    <td className="py-2.5 font-medium text-slate-800">{order.buyer_name}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${order.carrier === 'GHN' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                        {order.carrier || 'GHN'}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono font-bold text-slate-700">{order.tracking_number}</td>
                    <td className="py-2.5 pr-2 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Đã bàn giao
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

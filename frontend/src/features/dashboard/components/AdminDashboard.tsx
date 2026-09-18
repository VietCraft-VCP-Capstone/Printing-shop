import { 
  Clock, 
  Activity, 
  Package, 
  Truck, 
  TrendingUp, 
  ChevronRight, 
  ShieldCheck,
  Layers,
  ExternalLink
} from 'lucide-react';
import StatCard from './StatCard';

interface AdminDashboardProps {
  orders: any[];
  blanks: any[];
  stats: {
    received: number;
    printing: number;
    packaged: number;
    shipped: number;
    totalRevenue: number;
  };
  loadingOrders: boolean;
  onUpdateStatus: (orderId: string, currentStatus: string) => void;
  onOpenShipModal: (order: any) => void;
  onNavigateToOrders: () => void;
}

export default function AdminDashboard({
  orders,
  blanks,
  stats,
  loadingOrders,
  onUpdateStatus,
  onOpenShipModal,
  onNavigateToOrders
}: AdminDashboardProps) {
  const activeJobs = orders.filter(o => o.status !== 'SHIPPED');
  const ghnCount = orders.filter(o => o.carrier === 'GHN').length;
  const ghtkCount = orders.filter(o => o.carrier === 'GHTK').length;

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 md:p-8 shadow-lg shadow-violet-500/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-200" /> Bảng Điều Khiển Quản Trị (Admin)
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Tổng Quan Vận Hành Xưởng In</h2>
            <p className="text-violet-100 text-sm mt-1 max-w-xl">
              Giám sát toàn diện doanh thu phôi in, năng suất xưởng, phân bổ hãng vận chuyển và kiểm soát vòng đời đơn hàng.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-violet-200 block font-medium">Tổng việc đang xử lý</span>
              <span className="text-2xl font-black">{activeJobs.length} đơn</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-violet-200 block font-medium">Mẫu phôi trong kho</span>
              <span className="text-2xl font-black">{blanks.length} phôi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Đã nhận file (New)"
          value={stats.received}
          unit="jobs"
          icon={<Clock className="w-3 h-3 text-violet-600" />}
          statusText="Chờ duyệt file"
          hoverColorClass="hover:border-violet-300"
          glowColorClass="bg-violet-100"
          statusBgClass="text-violet-700 bg-violet-50 border border-violet-200"
        />

        <StatCard
          title="Đang in (Printing)"
          value={stats.printing}
          unit="jobs"
          icon={<Activity className="w-3 h-3 text-amber-600 animate-spin" />}
          statusText="Đang chạy máy"
          hoverColorClass="hover:border-amber-300"
          glowColorClass="bg-amber-100"
          statusBgClass="text-amber-700 bg-amber-50 border border-amber-200"
        />

        <StatCard
          title="Đã đóng gói (Packaged)"
          value={stats.packaged}
          unit="jobs"
          icon={<Package className="w-3 h-3 text-emerald-600" />}
          statusText="Chờ giao vận"
          hoverColorClass="hover:border-emerald-300"
          glowColorClass="bg-emerald-100"
          statusBgClass="text-emerald-700 bg-emerald-50 border border-emerald-200"
        />

        <StatCard
          title="Đã giao (Shipped)"
          value={stats.shipped}
          unit="jobs"
          icon={<Truck className="w-3 h-3 text-blue-600" />}
          statusText="Bàn giao hãng"
          hoverColorClass="hover:border-blue-300"
          glowColorClass="bg-blue-100"
          statusBgClass="text-blue-700 bg-blue-50 border border-blue-200"
        />

        <StatCard
          title="Doanh thu phôi"
          value={stats.totalRevenue.toLocaleString()}
          unit="đ"
          icon={<TrendingUp className="w-3 h-3 text-fuchsia-600" />}
          statusText="Doanh thu tạm tính"
          hoverColorClass="hover:border-fuchsia-300"
          glowColorClass="bg-fuchsia-100"
          statusBgClass="text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200"
        />
      </div>

      {/* Logistics & Blank distribution stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-600" /> Phân Bổ Hãng Vận Chuyển
            </h3>
            <span className="text-xs text-slate-500">Tổng đã xuất: {stats.shipped}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <span className="text-xs font-bold text-orange-700 uppercase">GHN Express</span>
              <p className="text-2xl font-black text-orange-950 mt-1">{ghnCount} đơn</p>
              <span className="text-[11px] text-orange-600">Giao nhanh toàn quốc</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <span className="text-xs font-bold text-emerald-700 uppercase">GHTK Express</span>
              <p className="text-2xl font-black text-emerald-950 mt-1">{ghtkCount} đơn</p>
              <span className="text-[11px] text-emerald-600">Tiết kiệm nội tỉnh & liên tỉnh</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-600" /> Tồn Kho Phôi Sẵn Sàng
            </h3>
            <span className="text-xs text-slate-500">Catalog tích hợp Sàn</span>
          </div>
          <div className="space-y-2.5">
            {blanks.slice(0, 3).map((blank: any) => (
              <div key={blank._id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                    {blank.default_image ? (
                      <img src={blank.default_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{blank.title || blank.name}</p>
                    <p className="text-[10px] text-slate-500">{blank.category} · {blank.variations?.length || 0} biến thể</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-violet-700">
                  {blank.variations?.[0]?.base_cost?.toLocaleString()} đ
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Jobs Main Panel */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Danh Sách Lệnh In Đang Chạy</h3>
            <p className="text-xs text-slate-500 mt-0.5">Các đơn hàng đang trong chu trình sản xuất và đóng gói</p>
          </div>
          <button
            onClick={onNavigateToOrders}
            className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 group bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-xl transition-all"
          >
            Xem tất cả đơn hàng <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 animate-spin text-violet-600" /> Đang đồng bộ danh sách đơn hàng...
          </div>
        ) : activeJobs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Hiện không có lệnh in nào đang chạy. Tất cả đơn đã được xuất kho hoặc chưa có đơn mới.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="pb-3 pl-2">Mã Đơn</th>
                  <th className="pb-3">Khách hàng</th>
                  <th className="pb-3">Sản phẩm in</th>
                  <th className="pb-3">File in</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3 pr-2 text-right">Thao tác Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeJobs.map((order) => {
                  const firstItem = order.items?.[0];
                  return (
                    <tr key={order._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-2 font-mono font-bold text-violet-700">
                        {order.order_code}
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-slate-800 block">{order.buyer_name}</span>
                        <span className="text-[10px] text-slate-400">{order.recipient_phone}</span>
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-slate-700 block max-w-xs truncate">
                          {firstItem?.title || 'Sản phẩm in ấn'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {firstItem?.color} / {firstItem?.size} · SL: {firstItem?.quantity}
                        </span>
                      </td>
                      <td className="py-3">
                        {firstItem?.artwork_url ? (
                          <a
                            href={firstItem.artwork_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-700 bg-violet-50 px-2 py-1 rounded-lg"
                          >
                            File in <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[10px]">Chưa có</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          order.status === 'RECEIVED' ? 'bg-violet-100 text-violet-700' :
                          order.status === 'PRINTING' ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {order.status === 'RECEIVED' ? 'Đã nhận file' :
                           order.status === 'PRINTING' ? 'Đang in' : 'Đã đóng gói'}
                        </span>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        {order.status === 'RECEIVED' && (
                          <button
                            onClick={() => onUpdateStatus(order._id, 'RECEIVED')}
                            className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] shadow-sm shadow-violet-600/20"
                          >
                            Bắt đầu in
                          </button>
                        )}
                        {order.status === 'PRINTING' && (
                          <button
                            onClick={() => onUpdateStatus(order._id, 'PRINTING')}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm shadow-emerald-600/20"
                          >
                            Đã in xong
                          </button>
                        )}
                        {order.status === 'PACKAGED' && (
                          <button
                            onClick={() => onOpenShipModal(order)}
                            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm shadow-blue-600/20"
                          >
                            Ủy quyền ship
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

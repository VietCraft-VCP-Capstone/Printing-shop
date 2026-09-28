import { useState } from 'react';
import { 
  Clock, 
  Package, 
  Truck, 
  TrendingUp, 
  ChevronRight, 
  Printer,
  CheckCircle2,
  Radio
} from 'lucide-react';
import StatCard from './components/StatCard';

interface DashboardTabProps {
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
  userRole: string;
}

function ArtworkThumbnail({ url }: { url?: string }) {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return (
      <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
        <Printer className="w-5 h-5 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden flex-shrink-0 relative group shadow-xs">
      <img
        src={url}
        alt="file in"
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default function DashboardTab({
  orders,
  stats,
  loadingOrders,
  onUpdateStatus,
  onOpenShipModal,
  onNavigateToOrders,
  userRole
}: DashboardTabProps) {
  const activeJobs = orders.filter(o => o.status !== 'SHIPPED');

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Top 5 Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <StatCard
          title="Đã nhận file"
          value={stats.received}
          unit="đơn"
          icon={<Clock className="w-4 h-4 text-violet-600" />}
          iconContainerClass="bg-violet-50 text-violet-600"
          statusText="Chờ kỹ thuật duyệt"
          badgeClass="bg-violet-50 text-violet-700 border-violet-200/80"
        />

        <StatCard
          title="Đang in ấn"
          value={stats.printing}
          unit="đơn"
          icon={<Printer className="w-4 h-4 text-amber-600" />}
          iconContainerClass="bg-amber-50 text-amber-600"
          statusText="Đang chạy máy in"
          badgeClass="bg-amber-50 text-amber-700 border-amber-200/80"
        />

        <StatCard
          title="Đã đóng gói"
          value={stats.packaged}
          unit="đơn"
          icon={<Package className="w-4 h-4 text-emerald-600" />}
          iconContainerClass="bg-emerald-50 text-emerald-600"
          statusText="Chờ xuất đơn vận"
          badgeClass="bg-emerald-50 text-emerald-700 border-emerald-200/80"
        />

        <StatCard
          title="Đã xuất kho"
          value={stats.shipped}
          unit="đơn"
          icon={<Truck className="w-4 h-4 text-blue-600" />}
          iconContainerClass="bg-blue-50 text-blue-600"
          statusText="Đang lưu thông"
          badgeClass="bg-blue-50 text-blue-700 border-blue-200/80"
        />

        <div className="col-span-2 sm:col-span-1">
          <StatCard
            title="Doanh thu phôi tạm tính"
            value={stats.totalRevenue.toLocaleString('vi-VN')}
            unit="₫"
            icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
            iconContainerClass="bg-indigo-50 text-indigo-600"
            statusText="Chi phí vật tư xưởng"
            badgeClass="bg-indigo-50 text-indigo-700 border-indigo-200/80"
          />
        </div>
      </div>

      {/* Main Grid: Active Jobs & Live Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Jobs Card (2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-2">
                  <Printer className="w-4 h-4 text-violet-600" />
                  Tiến độ in ấn hiện hành ({activeJobs.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Các đơn hàng đang trong dây chuyền sản xuất & chuẩn bị xuất kho
                </p>
              </div>
              <button 
                onClick={onNavigateToOrders} 
                className="text-xs text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1 hover:underline transition-all"
              >
                Xem tất cả đơn <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {loadingOrders ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  Đang đồng bộ danh sách đơn từ xưởng...
                </div>
              ) : activeJobs.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Dây chuyền in đang trống việc</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tất cả đơn đã được in và bàn giao thành công.</p>
                </div>
              ) : (
                activeJobs.slice(0, 4).map((o) => (
                  <div 
                    key={o._id} 
                    className="bg-slate-50/80 border border-slate-200/80 hover:border-violet-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ArtworkThumbnail url={o.items[0]?.artwork_url} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
                            {o.order_code}
                          </span>
                          {o.shop_name && (
                            <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-medium rounded-md truncate max-w-[140px]">
                              {o.shop_name}
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-wider ${
                            o.status === 'RECEIVED' ? 'bg-violet-50 text-violet-700 border border-violet-200/80' :
                            o.status === 'PRINTING' ? 'bg-amber-50 text-amber-700 border border-amber-200/80' :
                            o.status === 'PACKAGED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' :
                            'bg-rose-50 text-rose-700 border border-rose-200/80'
                          }`}>
                            {o.status === 'RECEIVED' && 'Chờ duyệt in'}
                            {o.status === 'PRINTING' && 'Đang in'}
                            {o.status === 'PACKAGED' && 'Đã đóng gói'}
                            {o.status === 'REJECTED' && 'Từ chối / Lỗi in'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 truncate">
                          <span className="truncate">{o.items[0]?.title}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-700">SL: {o.items[0]?.quantity || 1}</span>
                          <span className="hidden md:inline">•</span>
                          <span className="hidden md:inline text-[11px] text-slate-400">
                            Khách: {o.buyer_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
                      {o.status === 'RECEIVED' && (
                        <button 
                          onClick={() => onUpdateStatus(o._id, o.status)}
                          className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all shadow-xs"
                        >
                          Duyệt in
                        </button>
                      )}
                      {o.status === 'PRINTING' && (
                        <button 
                          onClick={() => onUpdateStatus(o._id, o.status)}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all shadow-xs"
                        >
                          Hoàn thành in
                        </button>
                      )}
                      {o.status === 'PACKAGED' && (
                        <button 
                          onClick={() => onOpenShipModal(o)}
                          disabled={userRole !== 'ADMIN'}
                          title={userRole !== 'ADMIN' ? 'Cần quyền Admin để ủy quyền giao hàng' : ''}
                          className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shadow-xs ${
                            userRole === 'ADMIN' 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" /> Giao hàng
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tự động đồng bộ mỗi 10 giây</span>
            <span className="text-violet-600 font-medium">Xưởng in hoạt động 24/7</span>
          </div>
        </div>

        {/* System Integration Status (1 column) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                Kết nối sàn VietCraft
              </h3>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md uppercase">
                Active Live
              </span>
            </div>

            <div className="space-y-3">
              {/* VietCraft BE Connection */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">VietCraft Platform</span>
                  <span className="font-mono text-[11px] text-emerald-600 font-bold">Port 8080</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Nhận đơn POD và gửi Webhook trạng thái tự động
                </p>
              </div>

              {/* MongoDB Atlas */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">MongoDB Atlas</span>
                  <span className="font-mono text-[11px] text-emerald-600 font-bold">Cloud Live</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Lưu trữ database phôi sản phẩm & tiến độ in ấn
                </p>
              </div>

              {/* Courier integration */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">Cổng giao vận đối tác</span>
                  <span className="text-[11px] text-slate-600 font-semibold">GHN / GHTK</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tự động sinh mã vận đơn khi xuất kho đóng gói
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="bg-violet-50/70 border border-violet-100 rounded-xl p-3 text-[11px] text-violet-900 leading-relaxed">
              💡 <strong>Lưu ý kỹ thuật:</strong> Khi bấm duyệt in, hoàn thành in hoặc báo lỗi, thông báo tức thì sẽ được bắn về cho cả Seller và Buyer trên sàn VietCraft.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

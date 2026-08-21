import { 
  Clock, 
  Activity, 
  Package, 
  Truck, 
  TrendingUp, 
  ChevronRight, 
  Printer 
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
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5">
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
          title="Đang in ấn (Printing)"
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
          statusText="Chờ hãng nhận"
          hoverColorClass="hover:border-emerald-300"
          glowColorClass="bg-emerald-100"
          statusBgClass="text-emerald-700 bg-emerald-50 border border-emerald-200"
        />

        <StatCard
          title="Đã giao đi (Shipped)"
          value={stats.shipped}
          unit="jobs"
          icon={<Truck className="w-3 h-3 text-blue-600" />}
          statusText="Đang trên xe"
          hoverColorClass="hover:border-blue-300"
          glowColorClass="bg-blue-100"
          statusBgClass="text-blue-700 bg-blue-50 border border-blue-200"
        />

        <StatCard
          title="Doanh thu tạm tính"
          value={stats.totalRevenue.toLocaleString()}
          unit="đ"
          icon={<TrendingUp className="w-3 h-3 text-fuchsia-600" />}
          statusText="Doanh thu phôi in"
          hoverColorClass="hover:border-fuchsia-300"
          glowColorClass="bg-fuchsia-100"
          statusBgClass="text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200"
        />
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Jobs Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="font-bold text-base tracking-wide flex items-center gap-2 text-slate-900">
              <Clock className="w-4 h-4 text-violet-600" />
              Công việc in ấn mới nhận
            </h3>
            <button onClick={onNavigateToOrders} className="text-xs text-violet-600 hover:text-violet-700 font-bold flex items-center gap-1">
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {loadingOrders ? (
              <div className="text-center py-8 text-xs text-slate-400">Đang tải danh sách đơn hàng...</div>
            ) : activeJobs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">Không có đơn in ấn nào đang xử lý.</div>
            ) : (
              activeJobs.slice(0, 4).map((o) => (
                <div key={o._id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-100/70 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white overflow-hidden border border-slate-200 flex items-center justify-center text-xs shadow-xs">
                      {o.items[0]?.artwork_url ? (
                        <img src={o.items[0].artwork_url} alt="artwork" className="w-full h-full object-cover" />
                      ) : (
                        <Printer className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{o.order_code}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          o.status === 'RECEIVED' ? 'bg-violet-50 text-violet-700 border border-violet-200' :
                          o.status === 'PRINTING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {o.status === 'RECEIVED' ? 'Chờ in' : o.status === 'PRINTING' ? 'Đang in' : 'Đã đóng gói'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-1">{o.items[0]?.title} • Qty: {o.items[0]?.quantity}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 hidden sm:inline">Khách: <strong className="text-slate-800">{o.buyer_name}</strong></span>
                    {o.status === 'RECEIVED' && (
                      <button 
                        onClick={() => onUpdateStatus(o._id, o.status)}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-xs"
                      >
                        Bắt đầu in
                      </button>
                    )}
                    {o.status === 'PRINTING' && (
                      <button 
                        onClick={() => onUpdateStatus(o._id, o.status)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all shadow-xs"
                      >
                        Đóng gói
                      </button>
                    )}
                    {o.status === 'PACKAGED' && (
                      <button 
                        onClick={() => onOpenShipModal(o)}
                        disabled={userRole !== 'ADMIN'}
                        title={userRole !== 'ADMIN' ? 'Yêu cầu quyền Admin để giao hàng' : ''}
                        className={`text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 shadow-xs ${
                          userRole === 'ADMIN' 
                            ? 'bg-emerald-600 hover:bg-emerald-700' 
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
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

        {/* Integration Status Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base tracking-wide flex items-center gap-2 mb-4 text-slate-900 pb-3 border-b border-slate-100">
              <Activity className="w-4 h-4 text-violet-600" />
              Trạng thái kết nối
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-semibold text-slate-800">VietCraft Partner API</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">Port 8080</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-semibold text-slate-800">MongoDB Database</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">printing db</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6 text-xs text-slate-500">
            <p className="leading-relaxed">
              Thông tin trạng thái đơn hàng và mã vận tải được truyền tải trực tiếp thông qua cơ chế <strong className="text-slate-700">Webhook Realtime</strong> giữa 2 server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

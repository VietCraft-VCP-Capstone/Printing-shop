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
    <div className="space-y-8 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-5">
        <StatCard
          title="Đã nhận file (New)"
          value={stats.received}
          unit="jobs"
          icon={<Clock className="w-3 h-3" />}
          statusText="Chờ duyệt file"
          hoverColorClass="hover:border-violet-500/50"
          glowColorClass="bg-violet-600/10 group-hover:bg-violet-600/20"
          statusBgClass="text-violet-400 bg-violet-950/40"
        />

        <StatCard
          title="Đang in ấn (Printing)"
          value={stats.printing}
          unit="jobs"
          icon={<Activity className="w-3 h-3 animate-spin" />}
          statusText="Đang chạy máy"
          hoverColorClass="hover:border-amber-500/50"
          glowColorClass="bg-amber-600/10 group-hover:bg-amber-600/20"
          statusBgClass="text-amber-400 bg-amber-950/40"
        />

        <StatCard
          title="Đã đóng gói (Packaged)"
          value={stats.packaged}
          unit="jobs"
          icon={<Package className="w-3 h-3" />}
          statusText="Chờ hãng nhận"
          hoverColorClass="hover:border-emerald-500/50"
          glowColorClass="bg-emerald-600/10 group-hover:bg-emerald-600/20"
          statusBgClass="text-emerald-400 bg-emerald-950/40"
        />

        <StatCard
          title="Đã giao đi (Shipped)"
          value={stats.shipped}
          unit="jobs"
          icon={<Truck className="w-3 h-3" />}
          statusText="Đang trên xe"
          hoverColorClass="hover:border-blue-500/50"
          glowColorClass="bg-blue-600/10 group-hover:bg-blue-600/20"
          statusBgClass="text-blue-400 bg-blue-950/40"
        />

        <StatCard
          title="Doanh thu tạm tính"
          value={stats.totalRevenue.toLocaleString()}
          unit="đ"
          icon={<TrendingUp className="w-3 h-3" />}
          statusText="Doanh thu phôi in"
          hoverColorClass="hover:border-fuchsia-500/50"
          glowColorClass="bg-fuchsia-600/15 group-hover:bg-fuchsia-600/25"
          statusBgClass="text-fuchsia-400 bg-fuchsia-950/40"
        />
      </div>

      {/* Main Panel */}
      <div className="grid grid-cols-3 gap-6">
        {/* Active Jobs Card */}
        <div className="col-span-2 bg-[#120e33] border border-[#201955] rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-base tracking-wide flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-400" />
              Công việc in ấn mới nhận
            </h3>
            <button onClick={onNavigateToOrders} className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1">
              Xem tất cả <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {loadingOrders ? (
              <div className="text-center py-8 text-xs text-slate-500">Đang tải danh sách đơn hàng...</div>
            ) : activeJobs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">Không có đơn in ấn nào đang xử lý.</div>
            ) : (
              activeJobs.slice(0, 4).map((o) => (
                <div key={o._id} className="bg-[#1b1548]/40 border border-[#261f62] rounded-xl p-4 flex items-center justify-between hover:bg-[#1b1548]/70 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#0e0a29] overflow-hidden border border-[#3b328a] flex items-center justify-center text-xs">
                      {o.items[0]?.artwork_url ? (
                        <img src={o.items[0].artwork_url} alt="artwork" className="w-full h-full object-cover" />
                      ) : (
                        <Printer className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{o.order_code}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          o.status === 'RECEIVED' ? 'bg-violet-950 text-violet-300 border border-violet-800' :
                          o.status === 'PRINTING' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {o.status === 'RECEIVED' ? 'Chờ in' : o.status === 'PRINTING' ? 'Đang in' : 'Đã đóng gói'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block mt-1">{o.items[0]?.title} • Qty: {o.items[0]?.quantity}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">Khách: <strong>{o.buyer_name}</strong></span>
                    {o.status === 'RECEIVED' && (
                      <button 
                        onClick={() => onUpdateStatus(o._id, o.status)}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all"
                      >
                        Bắt đầu in
                      </button>
                    )}
                    {o.status === 'PRINTING' && (
                      <button 
                        onClick={() => onUpdateStatus(o._id, o.status)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all"
                      >
                        Đóng gói
                      </button>
                    )}
                    {o.status === 'PACKAGED' && (
                      <button 
                        onClick={() => onOpenShipModal(o)}
                        disabled={userRole !== 'ADMIN'}
                        title={userRole !== 'ADMIN' ? 'Yêu cầu quyền Admin để giao hàng' : ''}
                        className={`text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                          userRole === 'ADMIN' 
                            ? 'bg-emerald-600 hover:bg-emerald-700' 
                            : 'bg-stone-700 cursor-not-allowed opacity-50'
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
        <div className="bg-[#120e33] border border-[#201955] rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base tracking-wide flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-violet-400" />
              Trạng thái kết nối
            </h3>
            <div className="space-y-4">
              <div className="bg-[#1b1548]/40 border border-[#261f62] rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-semibold">VietCraft Partner API</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">Port 8080</span>
              </div>
              <div className="bg-[#1b1548]/40 border border-[#261f62] rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-sm font-semibold">MongoDB Database</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">printing db</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#201955] pt-4 mt-6 text-xs text-slate-400">
            <p className="leading-relaxed">
              Thông tin trạng thái đơn hàng và mã vận tải được truyền tải trực tiếp thông qua cơ chế <strong>Webhook Realtime</strong> giữa 2 server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

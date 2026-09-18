import { 
  Printer, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Eye
} from 'lucide-react';
import StatCard from './StatCard';
import ArtworkImage from '../../../components/ArtworkImage';
import { resolveArtworkUrl } from '../../../services/api';

interface OperatorDashboardProps {
  orders: any[];
  stats: {
    received: number;
    printing: number;
    packaged: number;
  };
  loadingOrders: boolean;
  onUpdateStatus: (orderId: string, currentStatus: string) => void;
  onNavigateToOrders: () => void;
}

export default function OperatorDashboard({
  orders,
  stats,
  loadingOrders,
  onUpdateStatus,
  onNavigateToOrders
}: OperatorDashboardProps) {
  // Operator only focuses on RECEIVED and PRINTING jobs
  const printJobs = orders.filter(o => o.status === 'RECEIVED' || o.status === 'PRINTING');
  const finishedJobs = orders.filter(o => o.status === 'PACKAGED');

  return (
    <div className="space-y-8 animate-fade-in text-slate-800">
      {/* Operator Banner */}
      <div className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 text-white rounded-3xl p-6 md:p-8 shadow-lg shadow-fuchsia-500/15 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-3">
              <Printer className="w-3.5 h-3.5 text-pink-200" /> Bảng Điều Khiển Thợ In (Operator Portal)
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Khu Vực Sản Xuất & Chạy Máy In</h2>
            <p className="text-pink-100 text-sm mt-1 max-w-xl">
              Kiểm tra artwork, cấu hình phôi sản phẩm, khởi động in ấn và hoàn tất đóng gói bàn giao cho kho vận.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-pink-100 block font-medium">Lệnh in đang chờ</span>
              <span className="text-3xl font-black">{printJobs.length}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center">
              <span className="text-[11px] text-pink-100 block font-medium">Đã hoàn thành in</span>
              <span className="text-3xl font-black">{finishedJobs.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Production KPIs (No financials) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Chờ duyệt file & máy trống"
          value={stats.received}
          unit="lệnh"
          icon={<Clock className="w-3.5 h-3.5 text-fuchsia-600" />}
          statusText="Cần kiểm tra file"
          hoverColorClass="hover:border-fuchsia-300"
          glowColorClass="bg-fuchsia-100"
          statusBgClass="text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200"
        />

        <StatCard
          title="Máy đang chạy in (In-Progress)"
          value={stats.printing}
          unit="máy"
          icon={<Activity className="w-3.5 h-3.5 text-amber-600 animate-spin" />}
          statusText="Đang phun mực/nhiệt"
          hoverColorClass="hover:border-amber-300"
          glowColorClass="bg-amber-100"
          statusBgClass="text-amber-700 bg-amber-50 border border-amber-200"
        />

        <StatCard
          title="In xong & Sẵn sàng đóng gói"
          value={stats.packaged}
          unit="sản phẩm"
          icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          statusText="Chuyển sang Logistics"
          hoverColorClass="hover:border-emerald-300"
          glowColorClass="bg-emerald-100"
          statusBgClass="text-emerald-700 bg-emerald-50 border border-emerald-200"
        />
      </div>

      {/* Print Queue Cards */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-fuchsia-600" /> Hàng Đợi Sản Xuất (Live Print Queue)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách chi tiết file thiết kế, thông số phôi và nút bấm thao tác nhanh tại bàn máy in
            </p>
          </div>
          <button
            onClick={onNavigateToOrders}
            className="text-xs font-bold text-fuchsia-600 hover:text-fuchsia-700 bg-fuchsia-50 hover:bg-fuchsia-100 px-3 py-1.5 rounded-xl transition-all"
          >
            Mở toàn bộ danh sách đơn
          </button>
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <Activity className="w-4 h-4 animate-spin text-fuchsia-600" /> Đang cập nhật hàng đợi in...
          </div>
        ) : printJobs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            Tuyệt vời! Toàn bộ lệnh in trong hàng đợi đã được xử lý xong.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {printJobs.map((order) => {
              const item = order.items?.[0];
              const isPrinting = order.status === 'PRINTING';

              return (
                <div
                  key={order._id}
                  className={`border rounded-2xl p-5 transition-all relative overflow-hidden ${
                    isPrinting
                      ? 'bg-amber-50/40 border-amber-200 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-fuchsia-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          {order.order_code}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isPrinting ? 'bg-amber-100 text-amber-800' : 'bg-fuchsia-100 text-fuchsia-800'
                        }`}>
                          {isPrinting ? 'ĐANG CHẠY MÁY' : 'CHỜ IN'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Khách: <strong className="text-slate-700">{order.buyer_name}</strong> · SĐT: {order.recipient_phone}
                      </p>
                    </div>

                    {/* Action Button */}
                    {order.status === 'RECEIVED' ? (
                      <button
                        onClick={() => onUpdateStatus(order._id, 'RECEIVED')}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-fuchsia-500/20 flex items-center gap-1.5 transition-all shrink-0"
                      >
                        <Printer className="w-3.5 h-3.5" /> Bắt đầu in
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateStatus(order._id, 'PRINTING')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn thành in
                      </button>
                    )}
                  </div>

                  {/* Artwork & Specs Section */}
                  <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    {/* Artwork preview box */}
                    <div className="w-24 h-24 bg-white border border-slate-200 rounded-xl flex-shrink-0 flex items-center justify-center p-1 relative group overflow-hidden">
                      <ArtworkImage
                        src={item?.artwork_url}
                        alt={item?.title || 'Bản vẽ in'}
                        className="w-full h-full object-contain"
                      />
                      {item?.artwork_url && (
                        <a
                          href={resolveArtworkUrl(item.artwork_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity"
                        >
                          <Eye className="w-4 h-4 mr-1" /> Xem gốc
                        </a>
                      )}
                    </div>

                    {/* Specs info */}
                    <div className="flex-1 text-xs space-y-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item?.title || 'Sản phẩm in ấn'}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
                          Màu: <strong className="text-slate-800">{item?.color || 'N/A'}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
                          Size: <strong className="text-slate-800">{item?.size || 'N/A'}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold text-slate-600">
                          SL: <strong className="text-fuchsia-700">{item?.quantity || 1}</strong>
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono pt-1 truncate">
                        SKU: {item?.sku || 'SKU-NONE'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

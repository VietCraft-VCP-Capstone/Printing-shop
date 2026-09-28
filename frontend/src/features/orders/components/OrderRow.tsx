import { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Printer, 
  ExternalLink, 
  CheckCircle, 
  Truck,
  AlertTriangle 
} from 'lucide-react';

interface OrderRowProps {
  order: any;
  onUpdateStatus: (orderId: string, currentStatus: string, rejectionReason?: string) => void;
  onOpenShipModal: (order: any) => void;
  userRole: string;
}

export default function OrderRow({ order, onUpdateStatus, onOpenShipModal, userRole }: OrderRowProps) {
  const item = order.items[0];
  const [imgError, setImgError] = useState(false);

  const handleReject = () => {
    const reason = window.prompt(
      'Nhập lý do từ chối / báo lỗi đơn in (gửi về sàn VietCraft):', 
      'File in bị vỡ nét / Không đạt tiêu chuẩn chất lượng'
    );
    if (reason && reason.trim()) {
      onUpdateStatus(order._id, order.status, reason.trim());
    }
  };

  return (
    <tr className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0">
      {/* 1. Mã đơn & Gian hàng */}
      <td className="px-5 py-4 align-top">
        <span className="font-mono font-bold text-xs text-slate-900 block tracking-tight">
          {order.order_code}
        </span>
        {order.shop_name && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 border border-slate-200/80 text-slate-600 rounded text-[10px] font-medium truncate max-w-[150px]">
            {order.shop_name}
          </span>
        )}
        <span className="text-[11px] text-slate-400 font-normal mt-1 block">
          {new Date(order.createdAt).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </span>
      </td>

      {/* 2. Người nhận & Địa chỉ */}
      <td className="px-5 py-4 align-top">
        <span className="font-semibold text-xs text-slate-800 block">
          {order.shipping_address?.recipient_name || order.buyer_name}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="font-mono">{order.shipping_address?.phone || order.recipient_phone || '---'}</span>
        </div>
        <div className="flex items-start gap-1 text-[11px] text-slate-500 mt-1 max-w-[210px]" title={order.shipping_address?.address_detail}>
          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="truncate">{order.shipping_address?.address_detail || 'Địa chỉ tiêu chuẩn'}</span>
        </div>
      </td>

      {/* 3. Sản phẩm in & File Artwork */}
      <td className="px-5 py-4 align-top">
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden flex-shrink-0 relative group shadow-xs flex items-center justify-center">
            {item?.artwork_url && !imgError ? (
              <>
                <img 
                  src={item.artwork_url} 
                  alt="design" 
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover" 
                />
                <a 
                  href={item.artwork_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white"
                  title="Mở file gốc độ phân giải cao"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            ) : (
              <Printer className="w-5 h-5 text-slate-400" />
            )}
          </div>

          <div className="min-w-0">
            <span className="font-semibold text-xs text-slate-900 block max-w-[190px] truncate leading-tight">
              {item?.title}
            </span>
            <span className="text-[11px] text-slate-500 font-mono block mt-1">
              SKU: {item?.sku}
            </span>
            {(item?.color || item?.size) && (
              <span className="inline-block text-[10px] text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded font-medium border border-violet-100 mt-1">
                {[item?.color, item?.size].filter(Boolean).join(' • ')}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* 4. Số lượng */}
      <td className="px-5 py-4 text-center font-bold text-xs text-slate-900 align-middle">
        {item?.quantity || 1}
      </td>

      {/* 5. Trạng thái */}
      <td className="px-5 py-4 text-center align-middle">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
          order.status === 'RECEIVED' ? 'bg-violet-50 text-violet-700 border-violet-200' :
          order.status === 'PRINTING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          order.status === 'PACKAGED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          order.status === 'SHIPPED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {order.status === 'RECEIVED' && 'Đã nhận file'}
          {order.status === 'PRINTING' && 'Đang in ấn'}
          {order.status === 'PACKAGED' && 'Đã đóng gói'}
          {order.status === 'SHIPPED' && 'Đang giao hàng'}
          {order.status === 'DELIVERED' && 'Giao thành công'}
          {order.status === 'REJECTED' && 'Từ chối / Lỗi in'}
        </span>

        {order.status === 'REJECTED' && order.rejection_reason && (
          <div 
            className="text-[10px] text-rose-600 font-medium mt-1 max-w-[140px] mx-auto truncate" 
            title={order.rejection_reason}
          >
            Lý do: {order.rejection_reason}
          </div>
        )}

        {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && order.tracking_number && (
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            <strong>{order.carrier}</strong>: {order.tracking_number}
          </div>
        )}
      </td>

      {/* 6. Thao tác */}
      <td className="px-5 py-4 text-right align-middle">
        {order.status === 'RECEIVED' && (
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={handleReject}
              className="border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1"
              title="Báo lỗi nếu file hỏng hoặc hết phôi"
            >
              <AlertTriangle className="w-3 h-3" /> Báo lỗi
            </button>
            <button 
              onClick={() => onUpdateStatus(order._id, order.status)}
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-all shadow-xs"
            >
              Duyệt in
            </button>
          </div>
        )}

        {order.status === 'PRINTING' && (
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={handleReject}
              className="border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1"
              title="Báo sự cố in ấn"
            >
              <AlertTriangle className="w-3 h-3" /> Báo lỗi
            </button>
            <button 
              onClick={() => onUpdateStatus(order._id, order.status)}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-all shadow-xs"
            >
              Hoàn thành in
            </button>
          </div>
        )}

        {order.status === 'PACKAGED' && (
          <button 
            onClick={() => onOpenShipModal(order)}
            disabled={userRole !== 'ADMIN'}
            title={userRole !== 'ADMIN' ? 'Cần quyền Admin để giao hàng' : ''}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ml-auto shadow-xs ${
              userRole === 'ADMIN' 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> Giao hàng
          </button>
        )}

        {order.status === 'SHIPPED' && (
          <div className="flex items-center justify-end gap-2">
            <span className="text-blue-600 font-semibold text-xs flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-600" /> Đang giao
            </span>
            <button
              onClick={() => onUpdateStatus(order._id, order.status)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all shadow-xs"
              title="Xác nhận shipper đã phát hàng thành công"
            >
              Giao thành công
            </button>
          </div>
        )}

        {order.status === 'DELIVERED' && (
          <div className="text-emerald-700 font-semibold text-xs flex items-center justify-end gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Đã giao xong
          </div>
        )}

        {order.status === 'REJECTED' && (
          <span className="text-rose-500 text-xs font-medium">
            Đã báo lỗi
          </span>
        )}
      </td>
    </tr>
  );
}

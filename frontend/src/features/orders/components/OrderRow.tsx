import { 
  Phone, 
  MapPin, 
  Printer, 
  ExternalLink, 
  CheckCircle, 
  Truck 
} from 'lucide-react';

interface OrderRowProps {
  order: any;
  onUpdateStatus: (orderId: string, currentStatus: string) => void;
  onOpenShipModal: (order: any) => void;
  userRole: string;
}

export default function OrderRow({ order, onUpdateStatus, onOpenShipModal, userRole }: OrderRowProps) {
  const item = order.items[0];

  return (
    <tr className="hover:bg-[#1a1444]/40 transition-colors">
      <td className="px-6 py-4">
        <span className="font-extrabold text-white block">{order.order_code}</span>
        <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
          {new Date(order.createdAt).toLocaleString('vi-VN')}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="font-semibold block text-slate-200">{order.shipping_address?.recipient_name || order.buyer_name}</span>
        <span className="text-xs text-slate-400 block mt-1 flex items-center gap-1">
          <Phone className="w-3 h-3 text-violet-400 flex-shrink-0" />
          {order.shipping_address?.phone || order.recipient_phone}
        </span>
        <span className="text-xs text-slate-400 block mt-0.5 max-w-[200px] truncate" title={order.shipping_address?.address_detail}>
          <MapPin className="w-3 h-3 text-violet-400 inline-block mr-1 flex-shrink-0" />
          {order.shipping_address?.address_detail}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg bg-[#0e0a29] border border-[#2e2671] overflow-hidden flex-shrink-0 relative group">
            {item?.artwork_url ? (
              <>
                <img src={item.artwork_url} alt="design" className="w-full h-full object-cover" />
                <a 
                  href={item.artwork_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  title="Mở file gốc"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                </a>
              </>
            ) : (
              <Printer className="w-6 h-6 text-slate-600" />
            )}
          </div>
          <div>
            <span className="font-bold text-slate-200 block text-xs max-w-[180px] truncate">{item?.title}</span>
            <span className="text-[11px] text-slate-500 font-mono block mt-0.5">SKU: {item?.sku}</span>
            <span className="text-[11px] text-violet-400 block mt-0.5">
              Option: {[item?.color, item?.size].filter(Boolean).join(' / ')}
            </span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-center font-bold text-slate-200">
        {item?.quantity}
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
          order.status === 'RECEIVED' ? 'bg-violet-950 text-violet-300 border border-violet-850' :
          order.status === 'PRINTING' ? 'bg-amber-950 text-amber-300 border border-amber-850' :
          order.status === 'PACKAGED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-850' :
          'bg-blue-950 text-blue-300 border border-blue-850'
        }`}>
          {order.status === 'RECEIVED' && 'Đã nhận file'}
          {order.status === 'PRINTING' && 'Đang in ấn'}
          {order.status === 'PACKAGED' && 'Đã đóng gói'}
          {order.status === 'SHIPPED' && 'Đang giao hàng'}
        </span>

        {order.status === 'SHIPPED' && (
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            <strong>{order.carrier}</strong>: {order.tracking_number}
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        {order.status === 'RECEIVED' && (
          <button 
            onClick={() => onUpdateStatus(order._id, order.status)}
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all"
          >
            Duyệt in
          </button>
        )}
        {order.status === 'PRINTING' && (
          <button 
            onClick={() => onUpdateStatus(order._id, order.status)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all"
          >
            Hoàn thành in
          </button>
        )}
        {order.status === 'PACKAGED' && (
          <button 
            onClick={() => onOpenShipModal(order)}
            disabled={userRole !== 'ADMIN'}
            title={userRole !== 'ADMIN' ? 'Yêu cầu quyền Admin để giao hàng' : ''}
            className={`text-white text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ml-auto ${
              userRole === 'ADMIN' 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-stone-700 cursor-not-allowed opacity-50'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> Giao hàng
          </button>
        )}
        {order.status === 'SHIPPED' && (
          <div className="text-emerald-400 font-semibold text-xs flex items-center justify-end gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Đã hoàn tất
          </div>
        )}
      </td>
    </tr>
  );
}

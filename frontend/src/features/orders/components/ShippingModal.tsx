import { useState } from 'react';
import { Truck, PackageCheck } from 'lucide-react';

interface ShippingModalProps {
  order: any;
  onClose: () => void;
  onShip: (carrier: 'GHN' | 'GHTK') => Promise<void>;
}

export default function ShippingModal({ order, onClose, onShip }: ShippingModalProps) {
  const [selectedCarrier, setSelectedCarrier] = useState<'GHN' | 'GHTK'>('GHN');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onShip(selectedCarrier);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white border border-slate-200/80 w-full max-w-[450px] rounded-2xl shadow-2xl overflow-hidden text-slate-800">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-base flex items-center gap-2 text-slate-900">
            <Truck className="w-4 h-4 text-violet-600" />
            Ủy quyền Giao Hàng Độc Lập
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl font-bold">&times;</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <div className="flex justify-between"><span className="text-slate-500 font-medium">Đơn hàng:</span><strong className="text-slate-900">{order.order_code}</strong></div>
            <div className="flex justify-between"><span className="text-slate-500 font-medium">Người nhận:</span><span className="text-slate-800 font-bold">{order.shipping_address?.recipient_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-medium">Điện thoại:</span><span className="text-slate-800 font-mono">{order.shipping_address?.phone}</span></div>
            <div className="flex justify-between"><span className="text-slate-500 font-medium">Địa chỉ:</span><span className="text-slate-800 font-medium max-w-[240px] truncate" title={order.shipping_address?.address_detail}>{order.shipping_address?.address_detail}</span></div>
          </div>

          <div>
            <label className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-2">Chọn đơn vị vận chuyển đối tác</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setSelectedCarrier('GHN')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  selectedCarrier === 'GHN' 
                    ? 'border-violet-500 bg-violet-50 text-violet-900 shadow-sm font-bold' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <PackageCheck className="w-7 h-7 text-violet-600 mb-1" />
                <span className="text-sm font-bold">Giao Hàng Nhanh</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Thời gian: 1-2 ngày</span>
              </button>

              <button 
                type="button"
                onClick={() => setSelectedCarrier('GHTK')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  selectedCarrier === 'GHTK' 
                    ? 'border-violet-500 bg-violet-50 text-violet-900 shadow-sm font-bold' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Truck className="w-7 h-7 text-violet-600 mb-1" />
                <span className="text-sm font-bold">Giao Hàng Tiết Kiệm</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Thời gian: 2-3 ngày</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed border border-slate-200/60">
            Khi bấm <strong className="text-slate-700">Hoàn tất giao hàng</strong>, hệ thống Xưởng in sẽ tự động tạo mã vận đơn đại diện, đồng thời kích hoạt API/Webhook gửi trực tiếp về VietCraft để đồng bộ hành trình cho Buyer.
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
          <button 
            type="button"
            onClick={onClose}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-4 py-2.5 rounded-xl font-bold transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-violet-600/20 disabled:opacity-55"
          >
            {submitting ? 'Đang gửi...' : 'Hoàn tất giao hàng'}
          </button>
        </div>
      </div>
    </div>
  );
}

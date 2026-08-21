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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-[#120e33] border border-[#3b328a] w-[450px] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        <div className="p-6 border-b border-[#201955] flex justify-between items-center">
          <h3 className="font-bold text-base flex items-center gap-2 text-white">
            <Truck className="w-4 h-4 text-violet-400" />
            Ủy quyền Giao Hàng Độc Lập
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-lg font-semibold">&times;</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-[#1b1548]/40 border border-[#261f62] rounded-xl p-4 text-xs space-y-2">
            <div className="flex justify-between"><span className="text-slate-400">Đơn hàng:</span><strong className="text-white">{order.order_code}</strong></div>
            <div className="flex justify-between"><span className="text-slate-400">Người nhận:</span><span className="text-white font-semibold">{order.shipping_address?.recipient_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Điện thoại:</span><span className="text-white font-mono">{order.shipping_address?.phone}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Địa chỉ:</span><span className="text-white font-medium max-w-[240px] truncate" title={order.shipping_address?.address_detail}>{order.shipping_address?.address_detail}</span></div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Chọn đơn vị vận chuyển đối tác</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={() => setSelectedCarrier('GHN')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  selectedCarrier === 'GHN' 
                    ? 'border-violet-500 bg-violet-600/10 text-white shadow-lg' 
                    : 'border-[#201955] bg-[#1b1548]/20 text-slate-400 hover:bg-[#1a1444]'
                }`}
              >
                <PackageCheck className="w-7 h-7 text-violet-400 mb-1" />
                <span className="text-sm font-bold">Giao Hàng Nhanh</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Thời gian: 1-2 ngày</span>
              </button>

              <button 
                type="button"
                onClick={() => setSelectedCarrier('GHTK')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  selectedCarrier === 'GHTK' 
                    ? 'border-violet-500 bg-violet-600/10 text-white shadow-lg' 
                    : 'border-[#201955] bg-[#1b1548]/20 text-slate-400 hover:bg-[#1a1444]'
                }`}
              >
                <Truck className="w-7 h-7 text-violet-400 mb-1" />
                <span className="text-sm font-bold">Giao Hàng Tiết Kiệm</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Thời gian: 2-3 ngày</span>
              </button>
            </div>
          </div>

          <div className="bg-[#1b1548]/20 rounded-xl p-3 text-[11px] text-slate-400 leading-relaxed">
            Khi bấm <strong>Hoàn tất giao hàng</strong>, hệ thống Xưởng in sẽ tự động tạo mã vận đơn đại diện, đồng thời kích hoạt API/Webhook gửi trực tiếp về VietCraft để đồng bộ hành trình cho Buyer.
          </div>
        </div>

        <div className="p-6 border-t border-[#201955] flex justify-end gap-3 bg-[#0d0929]">
          <button 
            type="button"
            onClick={onClose}
            className="bg-[#1b1548] hover:bg-[#221b5b] text-slate-300 text-xs px-4 py-2.5 rounded-xl font-medium transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-violet-600/20 disabled:opacity-55"
          >
            {submitting ? 'Đang gửi...' : 'Hoàn tất giao hàng'}
          </button>
        </div>
      </div>
    </div>
  );
}

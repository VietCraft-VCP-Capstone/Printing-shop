import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock3, 
  RefreshCw, 
  XCircle, 
  Search, 
  Package, 
  ExternalLink, 
  Eye, 
  Layers,
  ArrowRightLeft,
  DollarSign,
  User,
  Calendar,
  MessageSquareQuote,
  ShieldCheck,
  Maximize2,
  X
} from 'lucide-react';
import api from '../../services/api';

type RefundRequest = {
  _id: string;
  order_id: any;
  buyer_id: any;
  reason_category: string;
  reason_code?: string;
  description: string;
  evidence: string[];
  refund_type: string;
  refund_amount: number;
  requested_resolution?: 'EXCHANGE' | 'REFUND';
  quantity?: number;
  item_snapshot?: {
    title?: string;
    image?: string;
    design_file_url?: string;
    size?: string;
    color?: string;
    unit_price?: number;
    price?: number;
    custom_notes?: string;
  };
  triage_result?: string;
  triage_checklist?: { note: string };
  sla_deadlines?: { printer_deadline?: string };
  seller_response?: { decision: string; note?: string };
  status: string;
  created_at?: string;
  is_v3?: boolean;
};

type TypeFilter = 'ALL' | 'EXCHANGE' | 'REFUND';

export default function RefundsTab() {
  const [items, setItems] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

  // Modal thẩm định chi tiết & ra quyết định (Unified Master-Detail Modal)
  const [activeItem, setActiveItem] = useState<RefundRequest | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [decisionNote, setDecisionNote] = useState('');
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Lightbox xem ảnh toàn màn hình
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Khóa scroll body & lắng nghe phím Escape khi modal/lightbox mở
  useEffect(() => {
    if (activeItem || lightboxUrl) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxUrl) {
          setLightboxUrl(null);
        } else if (activeItem && !busy) {
          setActiveItem(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeItem, lightboxUrl, busy]);

  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    setLoading(!hasLoaded.current); 
    setError('');
    try {
      const response = await api.get('/api/orders/refund-requests');
      setItems(response.data?.data ?? response.data ?? []);
    } catch (cause: any) {
      setError(cause.response?.data?.error || 'Không tải được yêu cầu từ VietCraft.');
    } finally { 
      hasLoaded.current = true; 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 10000);
    return () => window.clearInterval(timer);
  }, [load]);

  const isExchangeItem = (item: RefundRequest) => {
    return (
      item.requested_resolution === 'EXCHANGE' || 
      item.refund_type === 'EXCHANGE' || 
      item.reason_category?.includes('IN BÙ') || 
      item.reason_category?.includes('ĐỔI HÀNG')
    );
  };

  const openInspection = (item: RefundRequest, initialDecision: 'APPROVE' | 'REJECT' = 'APPROVE') => {
    setActiveItem(item);
    setSelectedDecision(initialDecision);
    setActiveMediaIndex(0);
    setDecisionNote(
      initialDecision === 'APPROVE'
        ? (isExchangeItem(item)
            ? 'Xưởng in đã thẩm định và xác nhận lỗi in ấn. Đồng ý duyệt sản xuất đơn in bù cho khách.'
            : 'Xưởng in xác nhận lỗi sản phẩm, đồng ý duyệt hoàn tiền.')
        : 'Sản phẩm không thuộc phạm vi bảo hành lỗi kỹ thuật của xưởng in.'
    );
  };

  const submitDecision = async () => {
    if (!activeItem || decisionNote.trim().length < 3) return;
    setBusy(activeItem._id); 
    setError('');
    try {
      await api.post(`/api/orders/refund-requests/${encodeURIComponent(activeItem._id)}/respond`, { 
        decision: selectedDecision, 
        note: decisionNote.trim() 
      });
      setActiveItem(null); 
      setDecisionNote('');
      await load();
    } catch (cause: any) {
      setError(cause.response?.data?.error || 'Không gửi được phản hồi về VietCraft.');
    } finally { 
      setBusy(''); 
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const isExchange = isExchangeItem(item);
      const matchType = 
        typeFilter === 'ALL' || 
        (typeFilter === 'EXCHANGE' && isExchange) || 
        (typeFilter === 'REFUND' && !isExchange);

      const orderCode = typeof item.order_id === 'object' ? item.order_id?.order_code : String(item.order_id);
      const buyerName = typeof item.buyer_id === 'object' ? item.buyer_id?.full_name : '';
      const buyerEmail = typeof item.buyer_id === 'object' ? item.buyer_id?.email : String(item.buyer_id);
      const q = searchQuery.toLowerCase().trim();

      const matchSearch = 
        !q ||
        orderCode?.toLowerCase().includes(q) ||
        buyerName?.toLowerCase().includes(q) ||
        buyerEmail?.toLowerCase().includes(q) ||
        item.reason_category?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);

      return matchType && matchSearch;
    });
  }, [items, typeFilter, searchQuery]);

  const counts = useMemo(() => {
    const exchange = items.filter(isExchangeItem).length;
    const refund = items.length - exchange;
    return { all: items.length, exchange, refund };
  }, [items]);

  return (
    <div className="space-y-4 animate-fade-in text-slate-800">
      {/* Top Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        {/* Search & Refresh Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm theo mã đơn, người mua, lý do..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium transition-all"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            <span className="text-xs text-slate-500">
              Hiển thị <strong className="text-slate-800 font-bold">{filteredItems.length}</strong> yêu cầu
            </span>
            <button 
              onClick={() => void load()} 
              disabled={loading}
              className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Tải lại
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-xs">
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              typeFilter === 'ALL'
                ? 'bg-violet-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            <span>Tất cả yêu cầu</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              typeFilter === 'ALL' ? 'bg-violet-800/60 text-white' : 'bg-slate-200/80 text-slate-600'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setTypeFilter('EXCHANGE')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              typeFilter === 'EXCHANGE'
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Đổi hàng (In bù)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              typeFilter === 'EXCHANGE' ? 'bg-indigo-800/60 text-white' : 'bg-slate-200/80 text-slate-600'
            }`}>
              {counts.exchange}
            </span>
          </button>

          <button
            onClick={() => setTypeFilter('REFUND')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              typeFilter === 'REFUND'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Hoàn tiền POD</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              typeFilter === 'REFUND' ? 'bg-amber-800/60 text-white' : 'bg-slate-200/80 text-slate-600'
            }`}>
              {counts.refund}
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table List View */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3.5">Mã đơn & Người mua</th>
                <th className="px-4 py-3.5">Phân loại & Lý do</th>
                <th className="px-4 py-3.5">Sản phẩm cần in bù / hoàn</th>
                <th className="px-4 py-3.5 text-center">Minh chứng</th>
                <th className="px-4 py-3.5 text-center">Trạng thái</th>
                <th className="px-4 py-3.5 text-right">Thao tác thẩm định</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-violet-600" />
                      <span>Đang tải danh sách yêu cầu đổi trả & hoàn tiền...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <div className="max-w-xs mx-auto text-center">
                      <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">Không có yêu cầu nào</p>
                      <p className="text-xs text-slate-400 mt-1">Hiện không có yêu cầu đổi hàng hoặc hoàn tiền nào phù hợp.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const order = typeof item.order_id === 'object' ? item.order_id : null;
                  const buyer = typeof item.buyer_id === 'object' ? item.buyer_id : null;
                  const isExchange = isExchangeItem(item);
                  const snapshot = item.item_snapshot;
                  const orderCode = order?.order_code || String(item.order_id);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors border-b border-slate-100 last:border-0">
                      {/* 1. Mã đơn & Người mua */}
                      <td className="px-4 py-3.5 align-top">
                        <span className="font-mono font-bold text-xs text-slate-900 block tracking-tight">
                          {orderCode}
                        </span>
                        <span className="font-semibold text-slate-700 mt-1 block truncate max-w-[170px]">
                          {buyer?.full_name || 'Khách hàng'}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[170px]">
                          {buyer?.email || '—'}
                        </span>
                        {item.created_at && (
                          <span className="text-[10px] text-slate-400 mt-1 block font-mono">
                            {new Date(item.created_at).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </td>

                      {/* 2. Phân loại & Lý do */}
                      <td className="px-4 py-3.5 align-top">
                        {isExchange ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                            <ArrowRightLeft className="w-3 h-3" /> ĐỔI HÀNG (IN BÙ)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                            <DollarSign className="w-3 h-3" /> HOÀN TIỀN
                          </span>
                        )}
                        <span className="font-bold text-slate-900 block mt-1.5 text-xs">
                          {item.reason_category}
                        </span>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 max-w-[220px]" title={item.description}>
                          {item.description || '—'}
                        </p>
                      </td>

                      {/* 3. Sản phẩm cần in bù / hoàn */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-start gap-2.5 max-w-[260px]">
                          {snapshot?.image ? (
                            <img 
                              src={snapshot.image} 
                              alt={snapshot.title || 'Sản phẩm'} 
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openInspection(item)}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-slate-800 block truncate text-xs">
                              {snapshot?.title || 'Sản phẩm in ấn'}
                            </span>
                            <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                              {snapshot?.color && <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">Màu: <b>{snapshot.color}</b></span>}
                              {snapshot?.size && <span className="bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">Size: <b>{snapshot.size}</b></span>}
                              <span className="text-violet-700 font-bold">x{item.quantity || 1}</span>
                            </div>
                            {snapshot?.design_file_url && (
                              <a 
                                href={snapshot.design_file_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center gap-0.5 text-[10px] text-violet-600 hover:underline mt-0.5"
                              >
                                <ExternalLink className="w-2.5 h-2.5" /> File in gốc
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 4. Minh chứng (Click để phóng to) */}
                      <td className="px-4 py-3.5 align-top text-center">
                        {item.evidence && item.evidence.length > 0 ? (
                          <div className="inline-flex items-center gap-1.5">
                            {item.evidence.slice(0, 2).map((url, idx) => (
                              <button
                                key={url}
                                type="button"
                                onClick={() => openInspection(item)}
                                className="group relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                                title={`Bấm để xem ảnh minh chứng #${idx + 1}`}
                              >
                                <img src={url} alt={`Minh chứng ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                <span className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                  <Eye className="w-3.5 h-3.5" />
                                </span>
                              </button>
                            ))}
                            {item.evidence.length > 2 && (
                              <button 
                                onClick={() => openInspection(item)} 
                                className="text-[10px] text-slate-500 font-semibold hover:text-violet-700 cursor-pointer"
                              >
                                +{item.evidence.length - 2}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">Không có ảnh</span>
                        )}
                      </td>

                      {/* 5. Trạng thái */}
                      <td className="px-4 py-3.5 align-top text-center whitespace-nowrap">
                        {item.status === 'APPROVED' || item.status === 'REPLACEMENT_CREATED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {item.status === 'REPLACEMENT_CREATED' ? 'Đã tạo đơn in bù' : isExchange ? 'Đã duyệt in bù' : 'Đã duyệt hoàn tiền'}
                          </span>
                        ) : item.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                            <CheckCircle2 className="w-3 h-3 text-slate-500" /> Hoàn tất
                          </span>
                        ) : item.status === 'REJECTED' || item.status === 'ADMIN_REJECTED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-800">
                            <XCircle className="w-3 h-3 text-rose-600" /> Đã từ chối
                          </span>
                        ) : item.status === 'DISPUTED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-1 text-[11px] font-bold text-purple-800">
                            <AlertTriangle className="w-3 h-3 text-purple-600" /> Đang tranh chấp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-800">
                            <Clock3 className="w-3 h-3 text-amber-600" /> Chờ xưởng in
                          </span>
                        )}
                        {item.status === 'PENDING_PRINTER' && item.sla_deadlines?.printer_deadline && (
                          <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                            Đến {new Date(item.sla_deadlines.printer_deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </td>

                      {/* 6. Thao tác */}
                      <td className="px-4 py-3.5 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openInspection(item)}
                            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Xem chi tiết thẩm định"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {item.status === 'PENDING_PRINTER' ? (
                            <>
                              <button
                                type="button"
                                disabled={busy === item._id}
                                onClick={() => openInspection(item, 'REJECT')}
                                className="px-2.5 py-1.5 rounded-xl border border-red-200 text-red-700 font-semibold hover:bg-red-50 text-[11px] transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                Từ chối
                              </button>

                              <button
                                type="button"
                                disabled={busy === item._id}
                                onClick={() => openInspection(item, 'APPROVE')}
                                className={`px-3 py-1.5 rounded-xl text-white font-bold text-[11px] transition-all shadow-xs disabled:opacity-50 cursor-pointer ${
                                  isExchange 
                                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                                    : 'bg-violet-600 hover:bg-violet-700'
                                }`}
                              >
                                {isExchange ? 'Duyệt in bù (0đ)' : 'Duyệt hoàn tiền'}
                              </button>
                            </>
                          ) : item.status === 'APPROVED' ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                              ✓ Đã xử lý
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                              Đã đóng
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UNIFIED INSPECTION & DECISION MODAL (UI/UX Pro Max Architecture) */}
      {activeItem && createPortal(
        <div 
          className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 p-3 sm:p-6 flex items-center justify-center backdrop-blur-md animate-fade-in"
          onMouseDown={e => { if (e.target === e.currentTarget && !busy) setActiveItem(null); }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {/* 1. Header Bar */}
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 sm:px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <span 
                  className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md border border-slate-200 truncate max-w-[200px] sm:max-w-xs" 
                  title={typeof activeItem.order_id === 'object' ? activeItem.order_id?.order_code : activeItem.order_id}
                >
                  #{typeof activeItem.order_id === 'object' ? activeItem.order_id?.order_code : activeItem.order_id}
                </span>
                {isExchangeItem(activeItem) ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700 whitespace-nowrap">
                    <ArrowRightLeft className="w-3.5 h-3.5" /> YÊU CẦU ĐỔI HÀNG (IN BÙ)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800 whitespace-nowrap">
                    <DollarSign className="w-3.5 h-3.5" /> YÊU CẦU HOÀN TIỀN
                  </span>
                )}
                <span className="text-xs text-slate-400 font-medium hidden md:inline">
                  · Thẩm định kỹ thuật xưởng in
                </span>
              </div>

              <button 
                type="button"
                onClick={() => setActiveItem(null)} 
                className="rounded-full p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer flex-shrink-0 ml-2"
                title="Đóng (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Scrollable Body: 2-Column Responsive Layout */}
            <div className="flex-1 overflow-y-auto min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-100 grid grid-cols-1 md:grid-cols-12 bg-white">
              {/* Left Column (7 cols): Order, Product Spec, Decision */}
              <div className="p-5 sm:p-6 md:col-span-7 space-y-5">
                {/* A. Customer & Order Info */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                      <User className="w-3.5 h-3.5 text-violet-600" />
                      {typeof activeItem.buyer_id === 'object' ? activeItem.buyer_id?.full_name : 'Khách hàng'}
                    </span>
                    <span className="font-mono text-slate-400">
                      {typeof activeItem.buyer_id === 'object' ? activeItem.buyer_id?.email : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Ngày gửi: {activeItem.created_at ? new Date(activeItem.created_at).toLocaleString('vi-VN') : 'Mới đây'}
                    </span>
                    {activeItem.sla_deadlines?.printer_deadline && (
                      <span className="text-amber-700 font-semibold font-mono">
                        SLA: {new Date(activeItem.sla_deadlines.printer_deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>

                {/* B. Product to Print Specification */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
                    Sản phẩm xưởng in sản xuất lại:
                  </h3>
                  <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs">
                    {activeItem.item_snapshot?.image ? (
                      <img 
                        src={activeItem.item_snapshot.image} 
                        alt={activeItem.item_snapshot.title || 'Phôi in'} 
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-400">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-slate-900 m-0 truncate">
                        {activeItem.item_snapshot?.title || 'Sản phẩm in ấn theo yêu cầu'}
                      </h4>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                        {activeItem.item_snapshot?.color && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px]">
                            Màu: <b>{activeItem.item_snapshot.color}</b>
                          </span>
                        )}
                        {activeItem.item_snapshot?.size && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px]">
                            Size: <b>{activeItem.item_snapshot.size}</b>
                          </span>
                        )}
                        <span className="bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-bold text-indigo-700 text-[11px]">
                          SL in bù: {activeItem.quantity || 1}
                        </span>
                      </div>
                      {activeItem.item_snapshot?.design_file_url && (
                        <a 
                          href={activeItem.item_snapshot.design_file_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> Tải file thiết kế in gốc (chất lượng cao)
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* C. Return Reason & Buyer Statement */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 m-0">
                    Lý do báo lỗi từ khách hàng:
                  </h3>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-2">
                    <span className="font-bold text-xs text-violet-800 bg-violet-50 px-2.5 py-1 rounded-md border border-violet-200 inline-block">
                      {activeItem.reason_category}
                    </span>
                    <div className="flex items-start gap-2 pt-1 text-xs text-slate-700">
                      <MessageSquareQuote className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="m-0 leading-relaxed italic">
                        "{activeItem.description || 'Không có mô tả chi tiết từ khách.'}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* D. Audit Decision Selector */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 m-0 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-violet-600" />
                    Quyết định thẩm định của xưởng in:
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDecision('APPROVE');
                        setDecisionNote(
                          isExchangeItem(activeItem)
                            ? 'Xưởng in đã thẩm định và xác nhận lỗi in ấn. Đồng ý duyệt sản xuất đơn in bù cho khách.'
                            : 'Xưởng in xác nhận lỗi sản phẩm, đồng ý duyệt hoàn tiền.'
                        );
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedDecision === 'APPROVE'
                          ? (isExchangeItem(activeItem) 
                              ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-200 text-indigo-900' 
                              : 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-200 text-emerald-900')
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">
                          {isExchangeItem(activeItem) ? '✓ Duyệt In Bù (0đ)' : '✓ Chấp thuận Hoàn Tiền'}
                        </span>
                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                          selectedDecision === 'APPROVE' 
                            ? (isExchangeItem(activeItem) ? 'border-indigo-600 bg-indigo-600' : 'border-emerald-600 bg-emerald-600') 
                            : 'border-slate-300'
                        }`} />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {isExchangeItem(activeItem) ? 'Tạo đơn sản xuất in lại cho khách' : 'Chuyển Admin hoàn tiền cho khách'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDecision('REJECT');
                        setDecisionNote('Sản phẩm không thuộc phạm vi bảo hành lỗi kỹ thuật của xưởng in.');
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedDecision === 'REJECT'
                          ? 'border-red-600 bg-red-50/70 ring-2 ring-red-200 text-red-900'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-red-700">✕ Từ chối yêu cầu</span>
                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${
                          selectedDecision === 'REJECT' ? 'border-red-600 bg-red-600' : 'border-slate-300'
                        }`} />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Sản phẩm không lỗi hoặc do khách dùng sai
                      </span>
                    </button>
                  </div>

                  <div>
                    <label htmlFor="modal-decision-note" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ghi chú phản hồi <span className="text-red-600">*</span>:
                    </label>
                    <textarea 
                      id="modal-decision-note"
                      rows={3}
                      value={decisionNote}
                      onChange={e => setDecisionNote(e.target.value)}
                      placeholder="Nhập chi tiết thẩm định kỹ thuật..."
                      className="w-full resize-none rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 leading-relaxed outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>Ghi chú này sẽ đồng bộ trực tiếp lên sàn VietCraft</span>
                      <span>{decisionNote.length}/1000 ký tự</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Media Evidence Gallery */}
              <div className="p-5 sm:p-6 md:col-span-5 bg-slate-50/60 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 m-0">
                      Ảnh & Video minh chứng từ khách:
                    </h3>
                    {activeItem.evidence && activeItem.evidence.length > 0 && (
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md">
                        {activeMediaIndex + 1}/{activeItem.evidence.length}
                      </span>
                    )}
                  </div>

                  {/* Main Media Preview Frame */}
                  {activeItem.evidence && activeItem.evidence.length > 0 ? (
                    <div className="space-y-3">
                      <div className="relative group w-full h-[260px] rounded-2xl bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs">
                        {activeItem.evidence[activeMediaIndex]?.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                          <video 
                            src={activeItem.evidence[activeMediaIndex]} 
                            controls 
                            className="max-h-full max-w-full"
                          />
                        ) : (
                          <img 
                            src={activeItem.evidence[activeMediaIndex]} 
                            alt={`Minh chứng ${activeMediaIndex + 1}`} 
                            className="max-h-full max-w-full object-contain cursor-zoom-in"
                            onClick={() => setLightboxUrl(activeItem.evidence[activeMediaIndex])}
                          />
                        )}

                        <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setLightboxUrl(activeItem.evidence[activeMediaIndex])}
                            className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                            title="Phóng to"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={activeItem.evidence[activeMediaIndex]}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                            title="Mở trong tab mới"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* Evidence Thumbnails Strip */}
                      {activeItem.evidence.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {activeItem.evidence.map((url, idx) => (
                            <button
                              key={url}
                              type="button"
                              onClick={() => setActiveMediaIndex(idx)}
                              className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                                activeMediaIndex === idx
                                  ? 'border-violet-600 ring-2 ring-violet-200 scale-105'
                                  : 'border-slate-200 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-[260px] rounded-2xl border border-dashed border-slate-200 bg-white flex flex-col items-center justify-center text-slate-400 text-xs p-6 text-center">
                      <Package className="w-8 h-8 opacity-40 mb-2" />
                      <span>Người mua không tải lên ảnh hoặc video minh chứng kèm theo đơn.</span>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-3 text-[11px] text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700 m-0">💡 Hướng dẫn kiểm tra:</p>
                  <p className="m-0 leading-relaxed">
                    Xác nhận đúng vị trí hình in bị lệch, phôi áo bị rách hoặc ố vàng trước khi bấm duyệt in bù.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Sticky Footer Actions */}
            <div className="flex-shrink-0 flex items-center justify-between border-t border-slate-100 bg-slate-50/95 px-5 sm:px-6 py-3.5 backdrop-blur-md">
              <span className="text-xs text-slate-500 hidden sm:inline">
                Trạng thái: <strong className="text-amber-700 font-semibold">Chờ xưởng in phản hồi</strong>
              </span>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  disabled={!!busy}
                  className="min-h-[40px] rounded-xl border border-slate-300 px-4 text-xs font-bold text-slate-700 hover:bg-white transition-colors cursor-pointer"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={submitDecision}
                  disabled={!!busy || decisionNote.trim().length < 3}
                  className={`min-h-[40px] rounded-xl px-5 text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedDecision === 'APPROVE'
                      ? (isExchangeItem(activeItem) 
                          ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]' 
                          : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]')
                      : 'bg-red-600 hover:bg-red-700 active:scale-[0.98]'
                  }`}
                >
                  {busy ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang gửi phản hồi…</span>
                    </>
                  ) : selectedDecision === 'APPROVE' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isExchangeItem(activeItem) ? 'Xác nhận Duyệt In Bù (0đ)' : 'Xác nhận Chấp Thuận'}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Xác nhận Từ Chối</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Lightbox Phóng to ảnh toàn màn hình */}
      {lightboxUrl && createPortal(
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <button 
            type="button"
            onClick={() => setLightboxUrl(null)} 
            className="absolute top-4 right-4 text-white hover:text-slate-300 p-2 rounded-full bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={lightboxUrl} 
            alt="Phóng to" 
            className="max-h-[92vh] max-w-[92vw] object-contain rounded-lg shadow-2xl" 
            onClick={e => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </div>
  );
}

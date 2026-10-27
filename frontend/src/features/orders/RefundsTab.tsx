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
  X,
  UploadCloud,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileVideo,
  Lightbulb,
  Sparkles,
  Check
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

  // Minh chứng đối chiếu từ xưởng in khi từ chối yêu cầu
  const [rejectEvidences, setRejectEvidences] = useState<string[]>([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [evidenceUploadError, setEvidenceUploadError] = useState('');
  const evidenceFileInputRef = useRef<HTMLInputElement | null>(null);

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
    setError('');
    const isAlreadyRejected = item.status === 'REJECTED' || item.status === 'ADMIN_REJECTED';
    setSelectedDecision(isAlreadyRejected ? 'REJECT' : initialDecision);
    setActiveMediaIndex(0);
    setRejectEvidences([]);
    setEvidenceUploadError('');
    setDecisionNote(
      item.seller_response?.note ||
      (initialDecision === 'APPROVE'
        ? (isExchangeItem(item)
            ? 'Xưởng in đã thẩm định và xác nhận lỗi in ấn. Đồng ý duyệt sản xuất đơn in bù cho khách.'
            : 'Xưởng in xác nhận lỗi sản phẩm, đồng ý duyệt hoàn tiền.')
        : 'Sản phẩm không thuộc phạm vi bảo hành lỗi kỹ thuật của xưởng in.')
    );
  };

  const handleUploadRejectEvidence = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingEvidence(true);
    setEvidenceUploadError('');
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`Tệp "${file.name}" vượt quá kích thước 50MB cho phép.`);
        }
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/api/orders/refund-requests/upload-evidence', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.data?.url) {
          setRejectEvidences(prev => [...prev, res.data.url]);
        }
      }
    } catch (err: any) {
      setEvidenceUploadError(err.response?.data?.error || err.message || 'Lỗi khi tải tệp minh chứng lên.');
    } finally {
      setUploadingEvidence(false);
      if (evidenceFileInputRef.current) {
        evidenceFileInputRef.current.value = '';
      }
    }
  };

  const removeRejectEvidence = (indexToRemove: number) => {
    setRejectEvidences(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const submitDecision = async () => {
    if (!activeItem || decisionNote.trim().length < 3) return;
    if (selectedDecision === 'REJECT' && rejectEvidences.length === 0) {
      setEvidenceUploadError('Vui lòng đính kèm ít nhất 1 hình ảnh hoặc video minh chứng đối chiếu từ xưởng in trước khi từ chối.');
      return;
    }
    setBusy(activeItem._id); 
    setError('');
    setEvidenceUploadError('');
    try {
      await api.post(`/api/orders/refund-requests/${encodeURIComponent(activeItem._id)}/respond`, { 
        decision: selectedDecision, 
        note: decisionNote.trim(),
        evidence: selectedDecision === 'REJECT' ? rejectEvidences : []
      });
      setActiveItem(null); 
      setDecisionNote('');
      setRejectEvidences([]);
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
                                key={`${url}-${idx}`}
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
                        <div className="flex items-center justify-end">
                          {item.status === 'PENDING_PRINTER' ? (
                            <button
                              type="button"
                              disabled={busy === item._id}
                              onClick={() => openInspection(item)}
                              className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Thẩm định</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openInspection(item)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Xem chi tiết thẩm định"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-500" />
                              <span>Chi tiết</span>
                            </button>
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
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 sm:px-6 py-3.5 backdrop-blur-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <span 
                  className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 truncate max-w-[200px] sm:max-w-xs shadow-2xs" 
                  title={typeof activeItem.order_id === 'object' ? activeItem.order_id?.order_code : activeItem.order_id}
                >
                  #{typeof activeItem.order_id === 'object' ? activeItem.order_id?.order_code : activeItem.order_id}
                </span>
                {isExchangeItem(activeItem) ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-3 py-1 text-xs font-bold text-indigo-700 whitespace-nowrap shadow-2xs">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" /> YÊU CẦU ĐỔI HÀNG (IN BÙ)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-800 whitespace-nowrap shadow-2xs">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> YÊU CẦU HOÀN TIỀN
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
            <div className="flex-1 min-h-0 overflow-y-auto md:overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
              {/* Left Column (7 cols): Order, Product Spec, Decision */}
              <div className="p-5 sm:p-6 md:col-span-7 md:h-full md:overflow-y-auto space-y-4">
                {/* A. Product & Order Context */}
                <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white p-4 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between text-xs pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-700 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center flex-shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold truncate">
                        {typeof activeItem.buyer_id === 'object' ? activeItem.buyer_id?.full_name : 'Khách hàng'}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px] hidden sm:inline truncate max-w-[150px]">
                        ({typeof activeItem.buyer_id === 'object' ? activeItem.buyer_id?.email : '—'})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {activeItem.created_at ? new Date(activeItem.created_at).toLocaleDateString('vi-VN') : 'Mới đây'}
                      </span>
                      {activeItem.sla_deadlines?.printer_deadline && (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full font-semibold font-mono text-[10px]">
                          <Clock3 className="w-2.5 h-2.5" />
                          SLA {new Date(activeItem.sla_deadlines.printer_deadline).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    {activeItem.item_snapshot?.image ? (
                      <img 
                        src={activeItem.item_snapshot.image} 
                        alt={activeItem.item_snapshot.title || 'Phôi in'} 
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200/90 shadow-2xs flex-shrink-0 bg-slate-50 cursor-zoom-in"
                        onClick={() => setLightboxUrl(activeItem.item_snapshot?.image || null)}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-400">
                        <Package className="w-7 h-7" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {isExchangeItem(activeItem) ? 'Sản phẩm yêu cầu in bù' : 'Sản phẩm khiếu nại hoàn tiền'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 m-0 truncate mt-0.5">
                        {activeItem.item_snapshot?.title || 'Sản phẩm in ấn theo yêu cầu'}
                      </h4>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                        {activeItem.item_snapshot?.color && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px] border border-slate-200/60">
                            Màu: <b>{activeItem.item_snapshot.color}</b>
                          </span>
                        )}
                        {activeItem.item_snapshot?.size && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium text-slate-700 text-[11px] border border-slate-200/60">
                            Size: <b>{activeItem.item_snapshot.size}</b>
                          </span>
                        )}
                        {isExchangeItem(activeItem) ? (
                          <span className="bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-bold text-indigo-700 text-[11px]">
                            SL in bù: {activeItem.quantity || 1}
                          </span>
                        ) : (
                          <span className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold text-amber-800 text-[11px]">
                            SL hoàn: {activeItem.quantity || 1}
                          </span>
                        )}
                        {typeof activeItem.refund_amount === 'number' && activeItem.refund_amount > 0 && !isExchangeItem(activeItem) && (
                          <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold text-emerald-700 text-[11px]">
                            {activeItem.refund_amount.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </div>
                      {activeItem.item_snapshot?.design_file_url && (
                        <a 
                          href={activeItem.item_snapshot.design_file_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-900 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Tải file thiết kế in gốc (chất lượng cao)
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* B. Return Reason & Buyer Statement */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 m-0">
                      Lý do báo lỗi từ khách hàng:
                    </h3>
                    <span className="font-bold text-[11px] text-violet-800 bg-violet-50 px-2.5 py-0.5 rounded-md border border-violet-200">
                      {activeItem.reason_category}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 flex items-start gap-2.5 text-xs text-slate-700">
                    <MessageSquareQuote className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="m-0 leading-relaxed italic text-slate-800 font-normal">
                      "{activeItem.description || 'Không có mô tả chi tiết từ khách.'}"
                    </p>
                  </div>
                </div>

                {/* C. Audit Decision Selector / Result */}
                {activeItem.status !== 'PENDING_PRINTER' ? (
                  <div className="space-y-3 pt-1">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 m-0 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-violet-600" />
                      Kết quả thẩm định từ xưởng in:
                    </h3>
                    <div className={`p-4 rounded-2xl border ${
                      activeItem.status === 'APPROVED' || activeItem.status === 'COMPLETED'
                        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
                        : activeItem.status === 'DISPUTED'
                        ? 'border-purple-200 bg-purple-50/70 text-purple-950'
                        : 'border-rose-200 bg-rose-50/70 text-rose-950'
                    } space-y-2.5`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          {activeItem.status === 'APPROVED' || activeItem.status === 'COMPLETED' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>{isExchangeItem(activeItem) ? 'Đã duyệt In Bù (0đ)' : 'Đã chấp thuận Hoàn Tiền'}</span>
                            </>
                          ) : activeItem.status === 'DISPUTED' ? (
                            <>
                              <AlertTriangle className="w-4 h-4 text-purple-600" />
                              <span>Đơn đang khiếu nại tranh chấp (Dispute)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>Đã từ chối yêu cầu</span>
                            </>
                          )}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-200 shadow-2xs">
                          {activeItem.status === 'REJECTED' ? 'ĐÃ TỪ CHỐI' : activeItem.status}
                        </span>
                      </div>
                      {decisionNote && (
                        <div className="bg-white/90 rounded-xl p-3 border border-slate-200/80 text-xs text-slate-700">
                          <span className="font-bold text-slate-800 block text-[11px] mb-1">Ghi chú đã phản hồi:</span>
                          <p className="m-0 leading-relaxed italic">"{decisionNote}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                <div className="space-y-3 pt-1">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 m-0 flex items-center gap-1.5">
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
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                        selectedDecision === 'APPROVE'
                          ? (isExchangeItem(activeItem) 
                              ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-200/80 text-indigo-950 shadow-sm' 
                              : 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-200/80 text-emerald-950 shadow-sm')
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className={`w-4 h-4 ${
                            selectedDecision === 'APPROVE'
                              ? (isExchangeItem(activeItem) ? 'text-indigo-600' : 'text-emerald-600')
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`} />
                          {isExchangeItem(activeItem) ? 'Duyệt In Bù (0đ)' : 'Chấp thuận Hoàn Tiền'}
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedDecision === 'APPROVE' 
                            ? (isExchangeItem(activeItem) ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-emerald-600 bg-emerald-600 text-white') 
                            : 'border-slate-300'
                        }`}>
                          {selectedDecision === 'APPROVE' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-2 block">
                        {isExchangeItem(activeItem) ? 'Lập lệnh sản xuất in lại cho khách' : 'Chuyển Admin hoàn tiền cho khách'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDecision('REJECT');
                        setDecisionNote('Sản phẩm không thuộc phạm vi bảo hành lỗi kỹ thuật của xưởng in.');
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                        selectedDecision === 'REJECT'
                          ? 'border-rose-600 bg-rose-50/70 ring-2 ring-rose-200/80 text-rose-950 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <XCircle className={`w-4 h-4 ${
                            selectedDecision === 'REJECT' ? 'text-rose-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`} />
                          <span className={selectedDecision === 'REJECT' ? 'text-rose-700' : ''}>Từ chối yêu cầu</span>
                        </span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedDecision === 'REJECT' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'
                        }`}>
                          {selectedDecision === 'REJECT' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 mt-2 block">
                        Sản phẩm đạt chuẩn hoặc do khách
                      </span>
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="modal-decision-note" className="block text-xs font-bold text-slate-700">
                        Ghi chú thẩm định kỹ thuật <span className="text-rose-500">*</span>:
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {decisionNote.length}/1000 ký tự
                      </span>
                    </div>

                    {/* Quick suggestion templates */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-violet-500" /> Mẫu nhanh:
                      </span>
                      {selectedDecision === 'APPROVE' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setDecisionNote(isExchangeItem(activeItem) ? 'Xác nhận lỗi kỹ thuật xưởng in (lệch màu / bong tróc). Đồng ý in bù miễn phí.' : 'Xác nhận sản phẩm lỗi in, xưởng đồng ý duyệt hoàn tiền cho khách.')}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                          >
                            Lỗi in ấn kỹ thuật
                          </button>
                          <button
                            type="button"
                            onClick={() => setDecisionNote('Lỗi phôi áo / đường may từ khâu xuất kho xưởng in. Chấp nhận xử lý.')}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                          >
                            Lỗi phôi sản phẩm
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setDecisionNote('Sản phẩm đúng thông số kỹ thuật, hình in sắc nét chuẩn theo file thiết kế đã duyệt.')}
                            className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                          >
                            Đúng chuẩn thiết kế
                          </button>
                          <button
                            type="button"
                            onClick={() => setDecisionNote('Kích thước và vị trí in nằm trong dung sai kỹ thuật cho phép (dưới 1cm).')}
                            className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                          >
                            Trong dung sai
                          </button>
                          <button
                            type="button"
                            onClick={() => setDecisionNote('Vết bẩn / hư hại phát sinh do bảo quản hoặc ngoại lực sau khi nhận hàng.')}
                            className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                          >
                            Lỗi do ngoại lực
                          </button>
                        </>
                      )}
                    </div>

                    <textarea 
                      id="modal-decision-note"
                      rows={3}
                      value={decisionNote}
                      onChange={e => setDecisionNote(e.target.value)}
                      placeholder="Nhập chi tiết thẩm định kỹ thuật..."
                      className="w-full resize-none rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 leading-relaxed outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-slate-400 bg-white"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                      <span>Ghi chú này sẽ đồng bộ trực tiếp lên sàn VietCraft</span>
                    </div>
                  </div>

                  {/* Minh chứng đối chiếu bắt buộc khi Từ chối */}
                  {selectedDecision === 'REJECT' && (
                    <div className="rounded-2xl border border-rose-200/90 bg-gradient-to-b from-rose-50/40 via-white to-rose-50/20 p-4 space-y-3 transition-all shadow-2xs">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <h4 className="text-xs font-bold text-slate-900 m-0">
                              Minh chứng đối chiếu từ xưởng in <span className="text-rose-600">*</span>
                            </h4>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 mb-0 leading-relaxed">
                            Bắt buộc tải ảnh sản phẩm thành phẩm, tem nhãn ngày xuất xưởng hoặc camera đóng gói để bảo vệ quyền lợi xưởng in khi Admin giải quyết tranh chấp (dispute).
                          </p>
                        </div>
                        {rejectEvidences.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex-shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" /> {rejectEvidences.length} tệp
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100/80 border border-rose-200 px-2 py-0.5 rounded-md flex-shrink-0 whitespace-nowrap">
                            Bắt buộc
                          </span>
                        )}
                      </div>

                      {/* Hidden File Input */}
                      <input 
                        type="file" 
                        ref={evidenceFileInputRef}
                        onChange={handleUploadRejectEvidence}
                        multiple
                        accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
                        className="hidden"
                      />

                      {/* Modern Upload Button Dropzone */}
                      <button
                        type="button"
                        onClick={() => evidenceFileInputRef.current?.click()}
                        disabled={uploadingEvidence}
                        className="w-full py-3.5 px-4 rounded-xl border-2 border-dashed border-rose-300 hover:border-rose-500 bg-white/80 hover:bg-rose-50/40 transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
                      >
                        <div className="w-9 h-9 rounded-xl bg-rose-50 group-hover:bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 transition-colors">
                          {uploadingEvidence ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800 block group-hover:text-rose-700 transition-colors">
                            {uploadingEvidence ? 'Đang tải tệp lên máy chủ...' : '+ Tải thêm ảnh hoặc video minh chứng'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Hỗ trợ PNG, JPG, WEBP hoặc video MP4 (tối đa 50MB)
                          </span>
                        </div>
                      </button>

                      {evidenceUploadError && (
                        <div className="text-[11px] text-rose-600 font-semibold bg-rose-50 border border-rose-200 rounded-xl p-2.5 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>{evidenceUploadError}</span>
                        </div>
                      )}

                      {/* Thumbnails of uploaded evidence */}
                      {rejectEvidences.length > 0 ? (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Tệp minh chứng đã tải lên:
                          </span>
                          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                            {rejectEvidences.map((url, idx) => {
                              const isVid = url.match(/\.(mp4|webm|mov)(\?|$)/i);
                              return (
                                <div 
                                  key={`${url}-${idx}`} 
                                  className="relative group aspect-square rounded-xl border border-slate-200/90 bg-slate-900 overflow-hidden shadow-2xs hover:shadow-md transition-all"
                                >
                                  {isVid ? (
                                    <div className="w-full h-full flex items-center justify-center relative">
                                      <video src={url} className="w-full h-full object-cover opacity-80" />
                                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                        <FileVideo className="w-5 h-5 text-white" />
                                      </div>
                                    </div>
                                  ) : (
                                    <img 
                                      src={url} 
                                      alt={`Minh chứng xưởng ${idx + 1}`} 
                                      className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform" 
                                      onClick={() => setLightboxUrl(url)}
                                    />
                                  )}
                                  
                                  {/* Delete button */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeRejectEvidence(idx);
                                    }}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all shadow-sm cursor-pointer"
                                    title="Xoá tệp này"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-rose-700 bg-rose-50/80 rounded-xl p-2.5 flex items-center gap-2 border border-rose-200/60">
                          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <span>Chưa có minh chứng. Nút <strong>Xác nhận Từ Chối</strong> sẽ được mở sau khi bạn đính kèm ít nhất 1 ảnh hoặc video đối chiếu.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                )}
              </div>


              {/* Right Column (5 cols): Media Evidence Gallery */}
              <div className="p-5 sm:p-6 md:col-span-5 bg-slate-50/70 flex flex-col justify-between space-y-4 md:h-full md:overflow-y-auto">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-violet-600" />
                      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 m-0">
                        Minh chứng từ người mua:
                      </h3>
                    </div>
                    {activeItem.evidence && activeItem.evidence.length > 0 && (
                      <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md shadow-2xs font-mono">
                        {activeMediaIndex + 1} / {activeItem.evidence.length}
                      </span>
                    )}
                  </div>

                  {/* Main Media Preview Frame */}
                  {activeItem.evidence && activeItem.evidence.length > 0 ? (
                    <div className="space-y-3">
                      <div className="relative group w-full aspect-[4/3] rounded-2xl bg-slate-950 border border-slate-200/80 overflow-hidden flex items-center justify-center shadow-inner">
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
                            className="max-h-full max-w-full object-contain cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.02]"
                            onClick={() => setLightboxUrl(activeItem.evidence[activeMediaIndex])}
                          />
                        )}

                        {/* Quick Action Overlay */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setLightboxUrl(activeItem.evidence[activeMediaIndex])}
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer shadow-2xs"
                            title="Phóng to ảnh"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={activeItem.evidence[activeMediaIndex]}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer shadow-2xs"
                            title="Mở trong tab mới"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {/* Prev/Next arrows on hover if multiple images */}
                        {activeItem.evidence.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setActiveMediaIndex(prev => (prev === 0 ? activeItem.evidence.length - 1 : prev - 1))}
                              className="absolute left-2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Ảnh trước"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveMediaIndex(prev => (prev === activeItem.evidence.length - 1 ? 0 : prev + 1))}
                              className="absolute right-2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Ảnh tiếp"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Evidence Thumbnails Strip */}
                      {activeItem.evidence.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                          {activeItem.evidence.map((url, idx) => (
                            <button
                              key={`${url}-${idx}`}
                              type="button"
                              onClick={() => setActiveMediaIndex(idx)}
                              className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer bg-slate-900 ${
                                activeMediaIndex === idx
                                  ? 'border-violet-600 ring-2 ring-violet-200 scale-105 shadow-sm'
                                  : 'border-slate-200/80 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 flex flex-col items-center justify-center text-slate-400 text-xs p-6 text-center">
                      <Package className="w-8 h-8 opacity-40 mb-2" />
                      <span>Người mua không tải lên ảnh hoặc video minh chứng kèm theo đơn.</span>
                    </div>
                  )}
                </div>

                {/* Contextual Tips Box */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 text-xs text-slate-600 space-y-1.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Lưu ý thẩm định:</span>
                  </div>
                  <p className="m-0 leading-relaxed text-[11px] text-slate-500">
                    {activeItem.status !== 'PENDING_PRINTER'
                      ? 'Yêu cầu này đã được xử lý xong và chuyển sang trạng thái lưu trữ / đối soát.'
                      : selectedDecision === 'REJECT'
                      ? 'Khi từ chối, xưởng in cần đính kèm ảnh rõ nét (tem nhãn, kích thước, ảnh lưu kho). Admin sẽ căn cứ vào đây để phân xử khi người mua khiếu nại tranh chấp.'
                      : isExchangeItem(activeItem)
                      ? 'Xác nhận đúng vị trí hình in bị lỗi hoặc phôi áo bị lỗi trước khi duyệt. Hệ thống sẽ tạo lệnh in bù tự động cho xưởng.'
                      : 'Xưởng in xác nhận lỗi sản phẩm. Khi bấm chấp thuận, yêu cầu sẽ chuyển về Admin sàn VietCraft để tiến hành hoàn tiền cho người mua.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Error Banner inside modal if any */}
            {error && (
              <div className="mx-6 mb-3 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 3. Sticky Footer Actions */}
            <div className="flex-shrink-0 flex items-center justify-between border-t border-slate-100 bg-white/95 px-5 sm:px-6 py-3.5 backdrop-blur-md">
              <div className="flex items-center gap-2">
                {activeItem.status === 'PENDING_PRINTER' ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:inline">
                      Trạng thái: <strong className="text-slate-800 font-semibold">Chờ xưởng in phản hồi</strong>
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-500">
                    Trạng thái: <strong className="text-slate-800 font-semibold">{activeItem.status === 'REJECTED' ? 'Đã từ chối' : activeItem.status}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  disabled={!!busy}
                  className="min-h-[40px] rounded-xl border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Đóng
                </button>

                {activeItem.status === 'PENDING_PRINTER' && (
                  <button
                    type="button"
                    onClick={submitDecision}
                    disabled={
                      !!busy || 
                      decisionNote.trim().length < 3 || 
                      (selectedDecision === 'REJECT' && rejectEvidences.length === 0) || 
                      uploadingEvidence
                    }
                    className={`min-h-[40px] rounded-xl px-5 text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      selectedDecision === 'APPROVE'
                        ? (isExchangeItem(activeItem) 
                            ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-600/20' 
                            : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] shadow-emerald-600/20')
                        : 'bg-rose-600 hover:bg-rose-700 active:scale-[0.98] shadow-rose-600/20'
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
                        <span>{isExchangeItem(activeItem) ? 'Xác nhận Duyệt In Bù (0đ)' : 'Xác nhận Chấp Thuận Hoàn Tiền'}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Xác nhận Từ Chối Yêu Cầu</span>
                      </>
                    )}
                  </button>
                )}
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

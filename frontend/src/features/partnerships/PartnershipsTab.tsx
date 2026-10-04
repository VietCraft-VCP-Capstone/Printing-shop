import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Handshake, 
  Building2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Key, 
  Copy, 
  Check, 
  Plus, 
  Send, 
  ShieldCheck, 
  Store,
  RefreshCw,
  Info
} from 'lucide-react';

interface PartnershipsTabProps {
  user: any;
}

export default function PartnershipsTab({ user }: PartnershipsTabProps) {
  const isSeller = user?.role === 'SELLER';
  const isPrinterOrAdmin = user?.role === 'PRINTER' || user?.role === 'ADMIN';

  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [printers, setPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal gửi yêu cầu hợp tác (dành cho Seller)
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPrinterId, setSelectedPrinterId] = useState('');
  const [shopName, setShopName] = useState(user?.name || '');
  const [requestNotes, setRequestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('printing_auth_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [partRes, printRes] = await Promise.allSettled([
        axios.get('/api/partnerships/my', { headers }),
        isSeller ? axios.get('/api/partnerships/printers', { headers }) : Promise.resolve({ data: [] })
      ]);

      if (partRes.status === 'fulfilled') {
        setPartnerships(partRes.value.data || []);
      }
      if (printRes.status === 'fulfilled' && (printRes.value as any)?.data) {
        setPrinters((printRes.value as any).data || []);
      }
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu thỏa thuận:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Seller gửi yêu cầu hợp tác
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPrinterId) {
      alert('Vui lòng chọn xưởng in cần hợp tác.');
      return;
    }
    setSubmitting(true);
    setActionMsg(null);
    try {
      const token = localStorage.getItem('printing_auth_token');
      const res = await axios.post('/api/partnerships/request', {
        printer_id: selectedPrinterId,
        shop_name: shopName,
        notes: requestNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowRequestModal(false);
      setRequestNotes('');
      setActionMsg({ type: 'success', text: res.data.message || 'Đã gửi yêu cầu hợp tác thành công!' });
      fetchData();
    } catch (err: any) {
      setActionMsg({ type: 'error', text: err.response?.data?.error || err.message || 'Gửi yêu cầu thất bại.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Xưởng in phê duyệt / từ chối thỏa thuận
  const handleUpdateStatus = async (partnershipId: string, status: 'ACCEPTED' | 'REJECTED') => {
    const confirmText = status === 'ACCEPTED' 
      ? 'Chấp thuận hợp tác và sinh mã API Key độc quyền cho Seller này?'
      : 'Từ chối yêu cầu hợp tác từ Seller này?';
    if (!window.confirm(confirmText)) return;

    try {
      const token = localStorage.getItem('printing_auth_token');
      const res = await axios.put(`/api/partnerships/${partnershipId}/status`, {
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActionMsg({ type: 'success', text: res.data.message || 'Cập nhật thỏa thuận thành công!' });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || err.message || 'Lỗi khi cập nhật thỏa thuận.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                {isSeller ? 'Hợp Tác Xưởng In (Print Partnerships)' : 'Quản Lý Thỏa Thuận Seller'}
              </h1>
              <p className="text-xs text-slate-500">
                {isSeller 
                  ? 'Gửi yêu cầu thỏa thuận với xưởng in, nhận API Key và kết nối tự động với sàn VietCraft' 
                  : 'Xem xét và phê duyệt các thỏa thuận cung ứng phôi in và cấp khóa API cho Seller'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>

          {isSeller && (
            <button
              onClick={() => setShowRequestModal(true)}
              className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Xin Liên Kết Xưởng In Mới
            </button>
          )}
        </div>
      </div>

      {/* Thông báo thao tác */}
      {actionMsg && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between ${
          actionMsg.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="text-xs underline font-bold">Đóng</button>
        </div>
      )}

      {/* GIAO DIỆN DÀNH CHO SELLER */}
      {isSeller && (
        <div className="space-y-6">
          {/* Banner hướng dẫn liên kết sang VietCraft */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-900 to-indigo-900 text-white shadow-lg space-y-3">
            <div className="flex items-center gap-2 text-violet-300 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Quy trình kết nối Printify-style giữa 2 hệ thống
            </div>
            <p className="text-xs text-violet-100 leading-relaxed max-w-3xl">
              1. Chọn xưởng in và gửi yêu cầu hợp tác bên dưới.<br/>
              2. Sau khi xưởng in <strong>Chấp thuận (ACCEPTED)</strong>, bạn sẽ nhận được <strong>API Key</strong> và <strong>API URL</strong>.<br/>
              3. Mở sàn <strong>VietCraft Marketplace</strong> ➔ Kênh Người Bán ➔ Cài đặt ➔ Tab Xưởng in (POD) ➔ Đăng nhập đúng Email/Mật khẩu tài khoản Printing Shop này kèm API Key để kích hoạt!
            </p>
          </div>

          {/* Danh sách thỏa thuận của Seller */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Store className="w-4 h-4 text-violet-600" />
              Thỏa thuận xưởng in của tôi ({partnerships.length})
            </h2>

            {partnerships.length === 0 && !loading && (
              <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-3">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-sm font-bold text-slate-700">Chưa có thỏa thuận hợp tác nào</div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Bạn chưa gửi yêu cầu hợp tác đến xưởng in nào. Hãy bấm nút "Xin liên kết xưởng in mới" để bắt đầu nhận phôi và đẩy đơn POD.
                </p>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="px-4 py-2 rounded-xl bg-violet-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Chọn xưởng ngay
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partnerships.map((p) => {
                const isAccepted = p.status === 'ACCEPTED';
                const isPending = p.status === 'PENDING';
                const isRejected = p.status === 'REJECTED';

                return (
                  <div 
                    key={p._id} 
                    className={`rounded-2xl border transition-all p-5 shadow-sm space-y-4 ${
                      isAccepted 
                        ? 'bg-gradient-to-b from-emerald-50/50 to-white border-emerald-300 ring-1 ring-emerald-500/20' 
                        : isPending 
                        ? 'bg-white border-amber-200' 
                        : 'bg-white border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-slate-900 font-jakarta">
                            {p.printer_name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Gian hàng đăng ký: <strong className="text-slate-700">{p.shop_name || 'My POD Shop'}</strong>
                        </p>
                      </div>

                      {/* Status badge */}
                      {isAccepted && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Đã chấp thuận
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Chờ xưởng duyệt
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Từ chối
                        </span>
                      )}
                    </div>

                    {/* Khối API Key dành riêng cho xưởng khi ACCEPTED */}
                    {isAccepted && p.api_key && (
                      <div className="bg-white/80 backdrop-blur rounded-xl border border-emerald-200 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1">
                            <Key className="w-3.5 h-3.5 text-emerald-600" />
                            API Key của bạn (Dùng để xác thực bên VietCraft):
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                            Bảo mật
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={p.api_key}
                            className="flex-1 font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleCopy(p.api_key, p._id)}
                            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            {copiedKey === p._id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedKey === p._id ? 'Đã sao chép' : 'Copy'}
                          </button>
                        </div>

                        <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                          <div>
                            API Endpoint Xưởng: <strong className="font-mono text-slate-700">{p.printer_api_url || 'http://localhost:8880'}</strong>
                          </div>
                          <div>
                            Email xác thực: <strong className="text-slate-700">{user.email}</strong>
                          </div>
                        </div>
                      </div>
                    )}

                    {isPending && (
                      <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-800 border border-amber-200 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          Yêu cầu hợp tác đã được gửi đến chủ xưởng in. Vui lòng chờ xưởng phê duyệt thỏa thuận để nhận API Key liên kết.
                        </div>
                      </div>
                    )}

                    {isRejected && (
                      <div className="bg-rose-50 rounded-xl p-3 text-xs text-rose-800 border border-rose-200">
                        Lý do từ chối: {p.rejection_reason || 'Xưởng hiện tại chưa thể nhận thêm đối tác.'}
                      </div>
                    )}

                    {p.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        Ghi chú gửi xưởng: "{p.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GIAO DIỆN DÀNH CHO XƯỞNG IN (PRINTER / ADMIN) */}
      {isPrinterOrAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase">Tổng đối tác yêu cầu</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{partnerships.length}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-amber-50/30">
              <span className="text-xs font-bold text-amber-700 uppercase">Đang chờ duyệt</span>
              <div className="text-2xl font-black text-amber-700 mt-1">
                {partnerships.filter(p => p.status === 'PENDING').length}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/30">
              <span className="text-xs font-bold text-emerald-700 uppercase">Đang hợp tác (Active)</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {partnerships.filter(p => p.status === 'ACCEPTED').length}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Danh sách yêu cầu thỏa thuận hợp tác từ Seller
              </h2>
            </div>

            {partnerships.length === 0 && !loading && (
              <div className="p-12 text-center text-slate-500 text-xs">
                Chưa có yêu cầu thỏa thuận hợp tác nào từ người bán.
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {partnerships.map((p) => {
                const isPending = p.status === 'PENDING';
                const isAccepted = p.status === 'ACCEPTED';
                const isRejected = p.status === 'REJECTED';

                return (
                  <div key={p._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{p.seller_name}</span>
                        <span className="text-xs text-slate-400">({p.seller_email})</span>
                        {isAccepted && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Đã duyệt & cấp Key
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Chờ duyệt
                          </span>
                        )}
                        {isRejected && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            Đã từ chối
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600">
                        Gian hàng đăng ký: <strong className="text-slate-800">{p.shop_name || 'Chưa đặt tên'}</strong>
                        {p.notes && (
                          <span className="block text-slate-500 italic mt-0.5">
                            Ghi chú: "{p.notes}"
                          </span>
                        )}
                      </div>

                      {isAccepted && p.api_key && (
                        <div className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 mt-2 flex items-center gap-2">
                          <Key className="w-3.5 h-3.5 text-emerald-600" />
                          <span>API Key cấp cho Seller: <strong>{p.api_key}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(p._id, 'ACCEPTED')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Phê duyệt & Cấp Key
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(p._id, 'REJECTED')}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition-all"
                          >
                            Từ chối
                          </button>
                        </>
                      ) : isAccepted ? (
                        <button
                          onClick={() => handleUpdateStatus(p._id, 'REJECTED')}
                          className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold"
                        >
                          Thu hồi quyền
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(p._id, 'ACCEPTED')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-semibold"
                        >
                          Duyệt lại
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL GỬI YÊU CẦU HỢP TÁC (SELLER ONLY) */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-violet-600" />
                Thỏa thuận hợp tác với xưởng in POD
              </h3>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendRequest} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 font-bold mb-1.5 block">
                  Chọn xưởng in đối tác <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedPrinterId}
                  onChange={e => setSelectedPrinterId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
                >
                  <option value="">-- Chọn một xưởng in từ hệ thống --</option>
                  {printers.map((pr: any) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.name} ({pr.address || 'Toàn quốc'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold mb-1.5 block">
                  Tên gian hàng / Shop của bạn trên VietCraft <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shopName}
                  onChange={e => setShopName(e.target.value)}
                  placeholder="VD: VietCraft Custom Studio"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold mb-1.5 block">
                  Ghi chú hoặc cam kết sản lượng gửi xưởng
                </label>
                <textarea
                  rows={3}
                  value={requestNotes}
                  onChange={e => setRequestNotes(e.target.value)}
                  placeholder="VD: Shop chuyên dòng áo thun custom và cốc sứ, dự kiến sản lượng 50 đơn/tuần..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-md shadow-violet-600/25 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Đang gửi...' : 'Gửi yêu cầu hợp tác'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

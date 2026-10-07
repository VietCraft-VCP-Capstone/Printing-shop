import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '../../services/api';

type PrinterRefund = {
  _id: string;
  order_code?: string;
  order_id?: { order_code?: string };
  reason_category: string;
  description?: string;
  evidence?: string[];
  refund_type: 'FULL' | 'PARTIAL' | 'EXCHANGE';
  refund_amount: number;
  status: string;
  decision?: 'APPROVE' | 'REJECT';
  note?: string;
  callback_error?: string;
};

const statusLabels: Record<string, string> = {
  PENDING_PRINTER: 'Chờ xưởng in xử lý', CALLBACK_PENDING: 'Chờ gửi quyết định', RESPONDED: 'Đã gửi quyết định',
  APPROVED: 'Đã chấp thuận đổi hàng', AWAITING_ADMIN_REFUND: 'Chờ Admin xác nhận hoàn tiền',
  REJECTED: 'Đã từ chối', DISPUTED: 'Đang tranh chấp', REFUNDED: 'Đã hoàn tiền',
};

export default function RefundsTab({ userRole }: { userRole: string }) {
  const [requests, setRequests] = useState<PrinterRefund[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data } = await api.get('/api/orders/refund-requests');
      setRequests(data.data);
      setWarning(data.warning || '');
      setError('');
    } catch (err: any) { setError(err.response?.data?.error || 'Không tải được yêu cầu hoàn tiền.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    void load();
    const timer = setInterval(() => { void load(); }, 10000);
    return () => clearInterval(timer);
  }, []);

  const respond = async (request: PrinterRefund, decision: 'APPROVE' | 'REJECT') => {
    const note = notes[request._id] ?? request.note ?? '';
    if (decision === 'REJECT' && note.trim().length < 3) {
      setError('Hãy ghi lý do từ chối ít nhất 3 ký tự.');
      return;
    }
    setBusyId(request._id);
    setError('');
    try {
      await api.post(`/api/orders/refund-requests/${encodeURIComponent(request._id)}/respond`, { decision, note });
      await load();
    } catch (err: any) {
      await load();
      setError(err.response?.data?.error || 'Không gửi được quyết định.');
    } finally { setBusyId(null); }
  };

  return <section className="space-y-5">
    <div className="flex items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold">Đổi hàng & hoàn tiền</h1><p className="mt-1 text-sm text-slate-500">Xem minh chứng và phản hồi yêu cầu được giao cho xưởng in.</p></div>
      <button type="button" onClick={() => { void load(); }} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm"><RefreshCw className="h-4 w-4" />Làm mới</button>
    </div>
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-rose-700">{error}</p>}
    {warning && <p role="status" className="rounded-lg bg-amber-50 p-3 text-amber-800">{warning}</p>}
    {loading && <p role="status">Đang tải yêu cầu…</p>}
    {!loading && requests.length === 0 && <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">Chưa có yêu cầu đổi hàng hoặc hoàn tiền.</p>}
    {requests.map(request => <article key={request._id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><h2 className="font-bold">Đơn {request.order_code || request.order_id?.order_code || request._id}</h2><p className="mt-1 text-sm text-slate-500">{request.reason_category}</p></div>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-700">{statusLabels[request.status] || request.status}</span>
      </div>
      <p className="text-sm whitespace-pre-wrap">{request.description}</p>
      <p className="text-sm font-semibold">{request.refund_type === 'EXCHANGE' ? 'Yêu cầu đổi hàng / in bù' : `Yêu cầu hoàn ${Number(request.refund_amount).toLocaleString('vi-VN')} ₫`}</p>
      {!!request.evidence?.length && <div className="flex flex-wrap gap-3">{request.evidence.map((url, index) => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-700 underline">Minh chứng {index + 1}</a>)}</div>}
      {request.callback_error && request.status === 'CALLBACK_PENDING' && <p className="text-sm text-amber-700">Quyết định đã lưu. VietCraft chưa xác nhận nhận phản hồi; hãy gửi lại.</p>}
      {userRole === 'ADMIN' && ['PENDING_PRINTER', 'CALLBACK_PENDING'].includes(request.status) && <div className="space-y-3 border-t border-slate-100 pt-3">
        {request.status === 'CALLBACK_PENDING' ? <button type="button" disabled={busyId !== null} onClick={() => { void respond(request, request.decision!); }} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busyId === request._id ? 'Đang gửi…' : 'Gửi lại quyết định'}</button> : <>
          <label htmlFor={`refund-note-${request._id}`} className="block text-sm font-medium">Ghi chú / lý do từ chối</label>
          <textarea id={`refund-note-${request._id}`} maxLength={1000} value={notes[request._id] || ''} onChange={event => setNotes(previous => ({ ...previous, [request._id]: event.target.value }))} className="w-full rounded-lg border border-slate-200 p-3 text-sm" rows={2} />
          <div className="flex gap-3">
            <button type="button" disabled={busyId !== null} onClick={() => { void respond(request, 'APPROVE'); }} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Chấp thuận</button>
            <button type="button" disabled={busyId !== null} onClick={() => { void respond(request, 'REJECT'); }} className="rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 disabled:opacity-50">Từ chối</button>
          </div>
        </>}
      </div>}
    </article>)}
  </section>;
}

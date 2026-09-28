import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, XCircle } from 'lucide-react';
import api from '../../services/api';

type RefundRequest = {
  _id: string;
  order_id: any;
  buyer_id: any;
  reason_category: string;
  description: string;
  evidence: string[];
  refund_type: string;
  refund_amount: number;
  triage_result: string;
  triage_checklist?: { note: string };
  sla_deadlines?: { printer_deadline?: string };
  seller_response?: { decision: string; note?: string };
  status: string;
};

export default function RefundsTab() {
  const [items, setItems] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [responseTarget, setResponseTarget] = useState<{ item: RefundRequest; decision: 'APPROVE' | 'REJECT' } | null>(null);
  const [responseNote, setResponseNote] = useState('');
  const hasLoaded = useRef(false);

  const load = useCallback(async () => {
    setLoading(!hasLoaded.current); setError('');
    try {
      const response = await api.get('/api/orders/refund-requests');
      setItems(response.data?.data ?? response.data ?? []);
    } catch (cause: any) {
      setError(cause.response?.data?.error || 'Không tải được yêu cầu từ VietCraft.');
    } finally { hasLoaded.current = true; setLoading(false); }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 10000);
    return () => window.clearInterval(timer);
  }, [load]);

  const respond = async () => {
    if (!responseTarget || responseNote.trim().length < 3) return;
    const { item, decision } = responseTarget;
    setBusy(item._id); setError('');
    try {
      await api.post(`/api/orders/refund-requests/${encodeURIComponent(item._id)}/respond`, { decision, note: responseNote.trim() });
      setResponseTarget(null); setResponseNote('');
      await load();
    } catch (cause: any) {
      setError(cause.response?.data?.error || 'Không gửi được phản hồi về VietCraft.');
    } finally { setBusy(''); }
  };

  return <section className="space-y-5 text-slate-800">
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div><h1 className="m-0 text-xl font-extrabold text-slate-900">Yêu cầu Refund POD</h1><p className="mb-0 mt-1 text-sm text-slate-500">Mock Printer API · phản hồi sẽ được gửi về VietCraft · {items.length} đang chờ</p></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold hover:bg-slate-100 disabled:opacity-50"><RefreshCw size={15} /> Tải lại</button>
    </header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertTriangle className="mr-2 inline" size={16} />{error}</div>}
    {loading ? <p className="py-12 text-center text-slate-500">Đang tải từ VietCraft...</p> : items.length === 0 ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">Không có yêu cầu POD đang chờ phản hồi.</div> : <div className="space-y-4">{items.map(item => {
      const order = typeof item.order_id === 'object' ? item.order_id : null;
      const buyer = typeof item.buyer_id === 'object' ? item.buyer_id : null;
      return <article key={item._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5"><div><p className="m-0 text-xs font-bold uppercase tracking-wide text-violet-700">{order?.order_code || String(item.order_id)} · Lỗi: {item.reason_category}</p><h2 className="mb-0 mt-2 text-base font-bold text-slate-900">{item.description}</h2><p className="mb-0 mt-1 text-sm text-slate-500">Người mua: {buyer?.full_name || buyer?.email || '—'} · Triage Seller: Printer chịu trách nhiệm</p></div><span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"><Clock3 className="mr-1 inline" size={13} />Chờ phản hồi</span></div>
        <div className="grid gap-4 p-5 md:grid-cols-2"><div className="text-sm"><p className="m-0"><b>Seller đã triage:</b> {item.triage_result}</p><p className="mt-2"><b>Checklist:</b> {item.triage_checklist?.note || '—'}</p><p className="mt-2"><b>Seller phản hồi:</b> {item.seller_response?.decision || '—'} {item.seller_response?.note || ''}</p><p><b>Mức hoàn đề nghị:</b> {item.refund_type === 'FULL' ? 'Toàn bộ' : `${Number(item.refund_amount || 0).toLocaleString('vi-VN')} ₫`}</p><p className="text-xs text-slate-500">SLA đến {item.sla_deadlines?.printer_deadline ? new Date(item.sla_deadlines.printer_deadline).toLocaleString('vi-VN') : '—'}</p></div><div className="flex flex-wrap content-start gap-2">{item.evidence?.map((url, i) => <a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-violet-700">Mở bằng chứng {i + 1}</a>)}</div></div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50 p-4"><button disabled={!!busy} onClick={() => { setResponseNote(''); setResponseTarget({ item, decision: 'REJECT' }); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-700 disabled:opacity-50"><XCircle size={16} /> Từ chối</button><button disabled={!!busy} onClick={() => { setResponseNote(''); setResponseTarget({ item, decision: 'APPROVE' }); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-violet-700 px-4 text-sm font-bold text-white disabled:opacity-50"><CheckCircle2 size={16} /> Chấp thuận</button></div>
      </article>;
    })}</div>}
    {responseTarget && <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/55 p-4" onMouseDown={event => { if (event.target === event.currentTarget && !busy) setResponseTarget(null); }}>
      <form role="dialog" aria-modal="true" aria-labelledby="printer-refund-response-title" onSubmit={event => { event.preventDefault(); void respond(); }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2 id="printer-refund-response-title" className="m-0 text-lg font-extrabold text-slate-900">{responseTarget.decision === 'APPROVE' ? 'Chấp thuận yêu cầu Refund' : 'Từ chối yêu cầu Refund'}</h2>
        <p className="mb-0 mt-2 text-sm text-slate-600">Đơn {responseTarget.item.order_id?.order_code || responseTarget.item.order_id}. Ghi chú sẽ được gửi về VietCraft và lưu trong lịch sử yêu cầu.</p>
        <label htmlFor="printer-refund-note" className="mb-1.5 mt-5 block text-sm font-bold text-slate-800">{responseTarget.decision === 'APPROVE' ? 'Ghi chú chấp thuận' : 'Lý do từ chối'} <span className="font-normal text-red-700">(bắt buộc)</span></label>
        <textarea id="printer-refund-note" autoFocus required minLength={3} maxLength={1000} rows={4} value={responseNote} onChange={event => setResponseNote(event.target.value)} placeholder="Nhập ghi chú cho Buyer và Seller…" className="w-full resize-y rounded-xl border border-slate-300 p-3 text-sm leading-6 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-100" />
        <p className="mb-0 mt-1 text-right text-xs text-slate-500">{responseNote.length}/1000</p>
        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <footer className="mt-5 flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-4 sm:flex-row"><button type="button" onClick={() => setResponseTarget(null)} disabled={!!busy} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">Huỷ</button><button type="submit" disabled={!!busy || responseNote.trim().length < 3} className={`min-h-11 rounded-xl px-4 text-sm font-bold text-white disabled:opacity-50 ${responseTarget.decision === 'APPROVE' ? 'bg-violet-700 hover:bg-violet-800' : 'bg-red-700 hover:bg-red-800'}`}>{busy ? 'Đang gửi…' : responseTarget.decision === 'APPROVE' ? 'Gửi chấp thuận' : 'Gửi từ chối'}</button></footer>
      </form>
    </div>}
  </section>;
}

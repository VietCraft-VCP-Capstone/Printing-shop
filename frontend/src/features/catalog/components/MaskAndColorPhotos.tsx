import { useRef, useState } from 'react';
import { Wand2, CheckCircle2, Upload, Loader2, Trash2, AlertTriangle, ImagePlus, ShieldCheck } from 'lucide-react';
import api from '../../../services/api';

export type MaskStatus = 'auto' | 'confirmed' | 'custom';

async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Chỉ hỗ trợ file ảnh.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Ảnh tối đa 15MB.');
  const fd = new FormData();
  fd.append('image', file);
  const res = await api.post('/api/blanks/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  if (!res.data?.url) throw new Error('Tải ảnh thất bại.');
  return res.data.url;
}

const STATUS_META: Record<MaskStatus | 'none', { label: string; cls: string }> = {
  none: { label: 'Chưa có vùng phôi', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  auto: { label: 'AI đã tách, chờ bạn xác nhận', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  confirmed: { label: 'Đã xác nhận', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  custom: { label: 'Ảnh nền trong suốt của xưởng', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
};

interface AreaMaskPanelProps {
  imageUrl: string;
  maskImage?: string;
  maskStatus?: MaskStatus;
  onChange: (patch: { mask_image?: string; mask_status?: MaskStatus }) => void;
}

/**
 * Vùng phôi của một mặt in: VietCraft chỉ đổi màu bên trong vùng này, nên nền nhiều màu
 * và bóng đổ không bị tô nhầm. Xưởng cho AI tách rồi xác nhận, hoặc tải PNG nền trong suốt.
 */
export function AreaMaskPanel({ imageUrl, maskImage, maskStatus, onChange }: AreaMaskPanelProps) {
  const [busy, setBusy] = useState<'ai' | 'upload' | null>(null);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const status: MaskStatus | 'none' = maskImage ? (maskStatus || 'auto') : 'none';
  const meta = STATUS_META[status];

  const runAi = async () => {
    if (!imageUrl) { setErr('Hãy tải ảnh phôi trước.'); return; }
    setBusy('ai'); setErr('');
    try {
      const res = await api.post('/api/blanks/mask-preview', { image: imageUrl }, { timeout: 150000 });
      onChange({ mask_image: res.data.mask_url, mask_status: 'auto' });
    } catch (e: any) {
      setErr(e.response?.data?.error || 'Không tách được nền tự động.');
    } finally { setBusy(null); }
  };

  const onUpload = async (file?: File) => {
    if (!file) return;
    if (file.type !== 'image/png') { setErr('Cần file PNG có nền trong suốt.'); return; }
    setBusy('upload'); setErr('');
    try {
      onChange({ mask_image: await uploadImage(file), mask_status: 'custom' });
    } catch (e: any) {
      setErr(e.response?.data?.error || e.message);
    } finally { setBusy(null); if (fileRef.current) fileRef.current.value = ''; }
  };

  // Mask AI là ảnh xám (dùng độ sáng), PNG của xưởng là ảnh cắt nền (dùng alpha)
  const maskMode = status === 'custom' ? 'alpha' : 'luminance';

  return (
    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[11px] font-semibold text-slate-700 block">Vùng phôi để đổi màu mockup</span>
          <span className="text-[10.5px] text-slate-500 leading-snug block">
            VietCraft chỉ tô màu trong vùng xanh. Nền và bóng đổ phải nằm ngoài vùng này.
          </span>
        </div>
        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.cls}`}>{meta.label}</span>
      </div>

      <div className="relative w-full aspect-square max-w-[220px] mx-auto rounded-lg overflow-hidden border border-slate-200 bg-[repeating-conic-gradient(#f1f5f9_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
        {imageUrl ? (
          <img src={imageUrl} alt="Ảnh phôi" className="absolute inset-0 w-full h-full object-fill" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[11px] text-slate-400">Chưa có ảnh phôi</div>
        )}
        {maskImage && (
          <div
            className="absolute inset-0 bg-emerald-500/45"
            style={{
              WebkitMaskImage: `url("${maskImage}")`, maskImage: `url("${maskImage}")`,
              WebkitMaskSize: '100% 100%', maskSize: '100% 100%',
              maskMode, WebkitMaskSourceType: maskMode,
            } as React.CSSProperties}
          />
        )}
        {busy === 'ai' && (
          <div className="absolute inset-0 bg-white/75 flex flex-col items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin text-violet-600" />
            AI đang tách nền (10–30 giây)…
          </div>
        )}
      </div>

      {status === 'auto' && (
        <div className="flex items-start gap-1.5 text-[10.5px] text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" />
          Kiểm tra vùng xanh phủ kín phôi và không lấn ra nền. Đúng thì bấm "Xác nhận".
        </div>
      )}
      {err && <div className="text-[10.5px] text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-2 py-1.5">{err}</div>}

      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={runAi} disabled={!!busy}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 flex items-center gap-1">
          {busy === 'ai' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
          {maskImage ? 'Tách lại' : 'Tách nền tự động'}
        </button>
        {status === 'auto' && (
          <button type="button" onClick={() => onChange({ mask_image: maskImage, mask_status: 'confirmed' })} disabled={!!busy}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Xác nhận
          </button>
        )}
        <button type="button" onClick={() => fileRef.current?.click()} disabled={!!busy}
          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"
          title="PNG cùng khung hình với ảnh phôi, phần ngoài phôi trong suốt">
          {busy === 'upload' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Tải PNG nền trong suốt
        </button>
        {maskImage && (
          <button type="button" onClick={() => onChange({ mask_image: undefined, mask_status: undefined })} disabled={!!busy}
            className="px-2 py-1.5 rounded-lg text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Xoá
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/png" className="hidden" onChange={e => onUpload(e.target.files?.[0])} />
      </div>
    </div>
  );
}

export interface ColorImage { color: string; area_key: string; image: string }

interface ColorPhotosTabProps {
  colors: { name: string; hex?: string }[];
  areas: { key: string; label?: string; image?: string }[];
  defaultImage: string;
  value: ColorImage[];
  onChange: (next: ColorImage[]) => void;
}

function PhotoCell({ url, fallback, onPick, onClear }: { url?: string; fallback: string; onPick: (f: File) => Promise<void>; onClear: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const pick = async (f?: File) => {
    if (!f) return;
    setBusy(true); setErr('');
    try { await onPick(f); } catch (e: any) { setErr(e.response?.data?.error || e.message); }
    finally { setBusy(false); if (ref.current) ref.current.value = ''; }
  };
  return (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={() => ref.current?.click()} disabled={busy}
        className={`relative w-24 h-24 rounded-lg border overflow-hidden flex items-center justify-center transition-colors ${url ? 'border-emerald-300 bg-white' : 'border-dashed border-slate-300 bg-slate-50 hover:border-violet-400 hover:bg-violet-50/40'}`}>
        {url ? (
          <img src={url} alt="" className="w-full h-full object-contain" />
        ) : (
          <>
            {fallback && <img src={fallback} alt="" className="absolute inset-0 w-full h-full object-contain opacity-20" />}
            <span className="relative flex flex-col items-center text-[10px] font-semibold text-slate-500">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4 mb-0.5" />}
              {busy ? 'Đang tải' : 'Tải ảnh'}
            </span>
          </>
        )}
      </button>
      {url && <button type="button" onClick={onClear} className="text-[10px] text-slate-400 hover:text-rose-600 self-start">Bỏ ảnh</button>}
      {err && <span className="text-[10px] text-rose-600 max-w-24">{err}</span>}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => pick(e.target.files?.[0])} />
    </div>
  );
}

/**
 * Ảnh thật cho từng màu × mặt in (không bắt buộc). Màu có ảnh thật sẽ được VietCraft dùng trực tiếp,
 * màu còn lại tự đổi màu trong vùng phôi.
 */
export function ColorPhotosTab({ colors, areas, defaultImage, value, onChange }: ColorPhotosTabProps) {
  const find = (color: string, key: string) => value.find(v => v.color === color && v.area_key === key)?.image;
  const set = (color: string, key: string, image?: string) => {
    const rest = value.filter(v => !(v.color === color && v.area_key === key));
    onChange(image ? [...rest, { color, area_key: key, image }] : rest);
  };

  if (!colors.length) {
    return <div className="py-10 text-center text-xs text-slate-500">Thêm biến thể có tên màu ở tab "Biến thể & Giá" trước.</div>;
  }
  const filled = value.filter(v => colors.some(c => c.name === v.color) && areas.some(a => a.key === v.area_key)).length;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-violet-50/70 border border-violet-100">
        <ShieldCheck className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
        <div className="text-[11px] text-violet-950 leading-relaxed">
          <b>Không bắt buộc.</b> Màu nào có ảnh chụp thật, mockup của người bán sẽ dùng ảnh đó (chính xác nhất).
          Màu không có ảnh sẽ được tự đổi màu từ ảnh phôi trong vùng phôi đã xác nhận.
          Ảnh nên cùng góc chụp và khung hình với ảnh phôi để thiết kế đặt đúng vị trí.
          <span className="block mt-1 font-semibold">Đã có {filled}/{colors.length * areas.length} ảnh.</span>
        </div>
      </div>
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-2 px-3 font-semibold text-slate-700 sticky left-0 bg-slate-50">Màu</th>
              {areas.map(a => <th key={a.key} className="text-left py-2 px-3 font-semibold text-slate-700 whitespace-nowrap">{a.label || a.key}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {colors.map(c => (
              <tr key={c.name}>
                <td className="py-2 px-3 sticky left-0 bg-white">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-800 whitespace-nowrap">
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300" style={{ backgroundColor: c.hex || '#fff' }} />
                    {c.name}
                  </span>
                </td>
                {areas.map(a => (
                  <td key={a.key} className="py-2 px-3">
                    <PhotoCell
                      url={find(c.name, a.key)}
                      fallback={a.image || defaultImage}
                      onPick={async f => set(c.name, a.key, await uploadImage(f))}
                      onClear={() => set(c.name, a.key)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../../../services/api';

interface Variation { sku: string; color?: string; size?: string; material?: string; base_cost: number; }
interface PrintArea { key: string; label?: string; x: number; y: number; width: number; height: number; }

interface Props {
  blank: any | null; // null = tạo mới
  onClose: () => void;
  onSaved: () => void;
}

const emptyVar = (): Variation => ({ sku: '', color: '', size: '', material: '', base_cost: 0 });
const emptyArea = (): PrintArea => ({ key: 'front', label: 'Mặt trước', x: 100, y: 120, width: 200, height: 260 });

export default function BlankFormModal({ blank, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(blank?.title || '');
  const [category, setCategory] = useState(blank?.category || '');
  const [description, setDescription] = useState(blank?.description || '');
  const [defaultImage, setDefaultImage] = useState(blank?.default_image || '');
  const [isActive, setIsActive] = useState(blank?.is_active ?? true);
  const [variations, setVariations] = useState<Variation[]>(blank?.variations?.length ? blank.variations : [emptyVar()]);
  const [printAreas, setPrintAreas] = useState<PrintArea[]>(blank?.print_areas?.length ? blank.print_areas : [emptyArea()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const setVar = (i: number, f: keyof Variation, v: string) =>
    setVariations(prev => prev.map((x, idx) => idx === i ? { ...x, [f]: f === 'base_cost' ? Number(v) : v } : x));
  const setArea = (i: number, f: keyof PrintArea, v: string) =>
    setPrintAreas(prev => prev.map((x, idx) => idx === i ? { ...x, [f]: ['x', 'y', 'width', 'height'].includes(f) ? Number(v) : v } : x));

  const submit = async () => {
    if (!title.trim() || !category.trim() || !defaultImage.trim()) { setError('Cần tiêu đề, danh mục và ảnh phôi.'); return; }
    if (variations.some(v => !v.sku.trim() || v.base_cost <= 0)) { setError('Mỗi biến thể cần SKU và giá phôi > 0.'); return; }
    setSaving(true); setError('');
    const payload = { title, category, description, default_image: defaultImage, is_active: isActive, variations, print_areas: printAreas };
    try {
      if (blank?._id) await api.put(`/api/blanks/${blank._id}`, payload);
      else await api.post('/api/blanks', payload);
      onSaved(); onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lưu thất bại.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 text-slate-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-900">{blank ? 'Sửa phôi' : 'Thêm phôi mới'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded-lg mb-3 border border-red-200">{error}</div>}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">Tiêu đề *
              <input className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" value={title} onChange={e => setTitle(e.target.value)} placeholder="Áo Thun Cotton..." />
            </label>
            <label className="text-sm">Danh mục *
              <input className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" value={category} onChange={e => setCategory(e.target.value)} placeholder="Trang phục" />
            </label>
          </div>
          <label className="text-sm block">Ảnh phôi (URL) *
            <input className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" value={defaultImage} onChange={e => setDefaultImage(e.target.value)} placeholder="https://..." />
          </label>
          <label className="text-sm block">Mô tả
            <textarea className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-sm" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> Đang cung ứng (hiển thị cho seller)
          </label>

          {/* Variations */}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">Biến thể phôi *</span>
              <button onClick={() => setVariations(p => [...p, emptyVar()])} className="text-violet-600 text-xs font-semibold flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Thêm</button>
            </div>
            <div className="space-y-2 overflow-x-auto">
              {variations.map((v, i) => (
                <div key={i} className="grid grid-cols-[1.4fr_1fr_0.8fr_1fr_1.1fr_auto] gap-1.5 items-center min-w-[520px]">
                  <input className="px-2 py-1.5 border border-slate-300 rounded text-xs" placeholder="SKU" value={v.sku} onChange={e => setVar(i, 'sku', e.target.value)} />
                  <input className="px-2 py-1.5 border border-slate-300 rounded text-xs" placeholder="Màu" value={v.color} onChange={e => setVar(i, 'color', e.target.value)} />
                  <input className="px-2 py-1.5 border border-slate-300 rounded text-xs" placeholder="Size" value={v.size} onChange={e => setVar(i, 'size', e.target.value)} />
                  <input className="px-2 py-1.5 border border-slate-300 rounded text-xs" placeholder="Chất liệu" value={v.material} onChange={e => setVar(i, 'material', e.target.value)} />
                  <input className="px-2 py-1.5 border border-slate-300 rounded text-xs" type="number" placeholder="Giá phôi" value={v.base_cost || ''} onChange={e => setVar(i, 'base_cost', e.target.value)} />
                  <button onClick={() => setVariations(p => p.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600" disabled={variations.length === 1}><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Print areas */}
          <div className="border-t border-slate-200 pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">Vùng in (px trên ảnh phôi)</span>
              <button onClick={() => setPrintAreas(p => [...p, emptyArea()])} className="text-violet-600 text-xs font-semibold flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Thêm</button>
            </div>
            <div className="space-y-2 overflow-x-auto">
              {printAreas.map((a, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] gap-1.5 items-center min-w-[520px]">
                  <input className="px-2 py-1.5 border border-slate-300 rounded text-xs" placeholder="key" value={a.key} onChange={e => setArea(i, 'key', e.target.value)} />
                  <input className="px-2 py-1.5 border border-slate-300 rounded text-xs" placeholder="Nhãn" value={a.label} onChange={e => setArea(i, 'label', e.target.value)} />
                  <input className="px-2 py-1.5 border border-slate-300 rounded text-xs" type="number" placeholder="x" value={a.x} onChange={e => setArea(i, 'x', e.target.value)} />
                  <input className="px-2 py-1.5 border border-slate-300 rounded text-xs" type="number" placeholder="y" value={a.y} onChange={e => setArea(i, 'y', e.target.value)} />
                  <input className="px-2 py-1.5 border border-slate-300 rounded text-xs" type="number" placeholder="W" value={a.width} onChange={e => setArea(i, 'width', e.target.value)} />
                  <input className="px-2 py-1.5 border border-slate-300 rounded text-xs" type="number" placeholder="H" value={a.height} onChange={e => setArea(i, 'height', e.target.value)} />
                  <button onClick={() => setPrintAreas(p => p.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600">Hủy</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white font-semibold disabled:opacity-50">
            {saving ? 'Đang lưu...' : (blank ? 'Cập nhật' : 'Tạo phôi')}
          </button>
        </div>
      </div>
    </div>
  );
}

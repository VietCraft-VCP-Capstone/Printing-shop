import { Pencil, Trash2 } from 'lucide-react';

interface Variation {
  sku: string;
  color?: string;
  size?: string;
  material?: string;
  base_cost: number;
}

interface Blank {
  _id: string;
  title: string;
  description?: string;
  category: string;
  default_image: string;
  variations: Variation[];
  is_active?: boolean;
}

interface BlankCardProps {
  blank: Blank;
  isAdmin?: boolean;
  onEdit?: (b: Blank) => void;
  onDelete?: (b: Blank) => void;
}

export default function BlankCard({ blank, isAdmin, onEdit, onDelete }: BlankCardProps) {
  const inactive = blank.is_active === false;
  return (
    <div className={`bg-slate-50 border rounded-2xl p-5 hover:border-violet-400 transition-all flex flex-col justify-between text-slate-800 shadow-xs ${inactive ? 'border-slate-300 opacity-70' : 'border-slate-200/80'}`}>
      <div>
        <div className="w-full h-44 rounded-xl bg-white overflow-hidden border border-slate-200 mb-4 shadow-xs relative">
          <img src={blank.default_image} alt={blank.title} className="w-full h-full object-cover" />
          {inactive && (
            <span className="absolute top-2 left-2 text-[10px] bg-slate-700 text-white font-bold px-2 py-0.5 rounded-md">Ngừng cung ứng</span>
          )}
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] bg-violet-50 text-violet-700 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-violet-200">
            {blank.category}
          </span>
          {isAdmin && (
            <div className="flex gap-1.5">
              <button onClick={() => onEdit?.(blank)} className="text-slate-400 hover:text-violet-600" title="Sửa"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => onDelete?.(blank)} className="text-slate-400 hover:text-red-600" title="Xóa"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
        </div>
        <h4 className="font-bold text-slate-900 text-base mt-2">{blank.title}</h4>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{blank.description}</p>
      </div>

      <div className="border-t border-slate-200/80 pt-4 mt-4">
        <span className="text-xs text-slate-500 font-semibold block mb-2">Biến thể phôi khả dụng ({blank.variations.length}):</span>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {blank.variations.map((v, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <div>
                <span className="text-slate-800 font-bold block">{v.sku}</span>
                <span className="text-[10px] text-slate-400">{[v.color, v.size].filter(Boolean).join(' • ')}</span>
              </div>
              <span className="font-bold text-violet-700">{v.base_cost.toLocaleString()}đ</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

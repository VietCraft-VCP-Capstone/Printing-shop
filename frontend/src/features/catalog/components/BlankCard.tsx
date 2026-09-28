import { useState } from 'react';
import { Pencil, Trash2, Layers } from 'lucide-react';

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
  const [imgError, setImgError] = useState(false);
  const inactive = blank.is_active === false;

  return (
    <div className={`bg-white border rounded-2xl p-5 hover:border-violet-300 transition-all flex flex-col justify-between text-slate-800 shadow-xs ${
      inactive ? 'border-slate-300 opacity-60 bg-slate-50' : 'border-slate-200/90'
    }`}>
      <div>
        {/* Blank Image Container */}
        <div className="w-full h-44 rounded-xl bg-slate-50 overflow-hidden border border-slate-200/80 mb-3.5 shadow-xs relative flex items-center justify-center">
          {!imgError && blank.default_image ? (
            <img 
              src={blank.default_image} 
              alt={blank.title} 
              onError={() => setImgError(true)}
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
              <Layers className="w-8 h-8 text-slate-300 mb-1" />
              <span className="text-xs">Ảnh phôi mô phỏng</span>
            </div>
          )}

          {inactive && (
            <span className="absolute top-2.5 left-2.5 text-[10px] bg-slate-800 text-white font-bold px-2 py-0.5 rounded-md shadow-xs">
              Ngừng cung ứng
            </span>
          )}
        </div>

        {/* Category & Actions */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] bg-violet-50 text-violet-700 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border border-violet-100">
            {blank.category}
          </span>
          {isAdmin && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onEdit?.(blank)} 
                className="p-1 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" 
                title="Sửa thông số phôi"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => onDelete?.(blank)} 
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                title="Xóa phôi"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h4 className="font-bold text-slate-900 text-sm mt-2 tracking-tight">
          {blank.title}
        </h4>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {blank.description || 'Chưa có mô tả chi tiết vật liệu.'}
        </p>
      </div>

      {/* Variations List */}
      <div className="border-t border-slate-100 pt-3.5 mt-3.5">
        <span className="text-[11px] text-slate-500 font-semibold block mb-2">
          Biến thể vật liệu khả dụng ({blank.variations?.length || 0}):
        </span>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
          {blank.variations?.map((v, idx) => (
            <div 
              key={idx} 
              className="flex justify-between items-center text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/70"
            >
              <div className="min-w-0 pr-2">
                <span className="text-slate-800 font-mono font-semibold block truncate">{v.sku}</span>
                <span className="text-[10px] text-slate-400 truncate block">
                  {[v.color, v.size].filter(Boolean).join(' • ') || v.material || 'Tiêu chuẩn'}
                </span>
              </div>
              <span className="font-bold text-violet-700 text-xs whitespace-nowrap">
                {v.base_cost?.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

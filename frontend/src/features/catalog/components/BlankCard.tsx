import { useState } from 'react';
import { Pencil, Trash2, Layers, Clock } from 'lucide-react';

interface Variation {
  sku: string;
  color?: string;
  color_hex?: string;
  size?: string;
  material?: string;
  base_cost: number;
  in_stock?: boolean;
}

interface PrintArea {
  key: string;
  label?: string;
  image?: string;
}

interface Blank {
  _id: string;
  title: string;
  brand?: string;
  description?: string;
  category: string;
  default_image: string;
  print_technique?: string;
  production_time?: string;
  variations: Variation[];
  print_areas?: PrintArea[];
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

  // Extract unique colors with their hexes
  const uniqueColors: { name: string; hex: string }[] = [];
  blank.variations?.forEach(v => {
    if (v.color && !uniqueColors.some(c => c.name === v.color)) {
      uniqueColors.push({ name: v.color, hex: v.color_hex || '#cbd5e1' });
    }
  });

  // Calculate price range
  const costs = blank.variations?.map(v => v.base_cost).filter(c => typeof c === 'number' && c > 0) || [];
  const minCost = costs.length ? Math.min(...costs) : 0;
  const maxCost = costs.length ? Math.max(...costs) : 0;

  return (
    <div className={`bg-white border rounded-2xl p-5 hover:border-violet-300 hover:shadow-md transition-all flex flex-col justify-between text-slate-800 shadow-xs relative group ${
      inactive ? 'border-slate-300 opacity-60 bg-slate-50' : 'border-slate-200/90'
    }`}>
      <div>
        {/* Blank Image Container */}
        <div className="w-full h-48 rounded-xl bg-slate-50 overflow-hidden border border-slate-200/80 mb-3.5 shadow-xs relative flex items-center justify-center p-2">
          {!imgError && blank.default_image ? (
            <img 
              src={blank.default_image} 
              alt={blank.title} 
              onError={() => setImgError(true)}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" 
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

          {blank.production_time && (
            <span className="absolute bottom-2 left-2 text-[10px] bg-white/90 backdrop-blur-xs text-slate-700 font-medium px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 border border-slate-200">
              <Clock className="w-3 h-3 text-violet-600" />
              {blank.production_time}
            </span>
          )}

          {/* Print Technique Badge */}
          {blank.print_technique && (
            <span className="absolute top-2.5 right-2.5 text-[10px] bg-violet-600 text-white font-bold px-2 py-0.5 rounded-md shadow-xs">
              {blank.print_technique}
            </span>
          )}
        </div>

        {/* Brand & Category & Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border border-slate-200">
              {blank.category}
            </span>
            {blank.brand && (
              <span className="text-[10px] bg-violet-50 text-violet-700 font-semibold px-2 py-0.5 rounded-md border border-violet-100">
                {blank.brand}
              </span>
            )}
          </div>
          {isAdmin && (
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => onEdit?.(blank)} 
                className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors" 
                title="Sửa thông số phôi"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => onDelete?.(blank)} 
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" 
                title="Xóa phôi"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="font-bold text-slate-900 text-sm mt-2 tracking-tight line-clamp-1" title={blank.title}>
          {blank.title}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {blank.description || 'Chưa có mô tả chi tiết vật liệu.'}
        </p>

        {/* Print Areas Chips */}
        {blank.print_areas && blank.print_areas.length > 0 && (
          <div className="flex items-center gap-1 mt-2.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-medium">Mặt in:</span>
            {blank.print_areas.map((a, i) => (
              <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                {a.label || a.key}
              </span>
            ))}
          </div>
        )}

        {/* Color Swatches */}
        {uniqueColors.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="text-[10px] text-slate-400 font-medium">Màu ({uniqueColors.length}):</span>
            <div className="flex items-center gap-1">
              {uniqueColors.slice(0, 6).map((c, i) => (
                <span
                  key={i}
                  title={c.name}
                  className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {uniqueColors.length > 6 && (
                <span className="text-[10px] text-slate-400">+{uniqueColors.length - 6}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pricing and Variants count */}
      <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Giá phôi xuất xưởng</span>
          <span className="font-bold text-violet-700 text-sm">
            {minCost === maxCost
              ? `${minCost.toLocaleString('vi-VN')} ₫`
              : `${minCost.toLocaleString('vi-VN')} ₫ - ${maxCost.toLocaleString('vi-VN')} ₫`}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-semibold border border-slate-200">
            {blank.variations?.length || 0} biến thể
          </span>
        </div>
      </div>
    </div>
  );
}

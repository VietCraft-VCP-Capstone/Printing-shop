import { Layers, Tag } from 'lucide-react';

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
}

interface BlankCardProps {
  blank: Blank;
}

export default function BlankCard({ blank }: BlankCardProps) {
  const minCost = blank.variations && blank.variations.length > 0 
    ? Math.min(...blank.variations.map(v => v.base_cost))
    : 0;

  return (
    <div className="group bg-white border border-slate-200/90 rounded-3xl p-5 hover:border-violet-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-slate-800 relative overflow-hidden">
      {/* Top accent light */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Product Image */}
        <div className="w-full h-48 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 mb-4 relative shadow-inner">
          <img 
            src={blank.default_image} 
            alt={blank.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
            loading="lazy"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-black text-violet-700 shadow-xs border border-white/60">
            Từ {minCost.toLocaleString()}đ
          </div>
        </div>

        {/* Category & Title */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] bg-violet-50 text-violet-700 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg border border-violet-200/80 inline-flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" />
            {blank.category}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {blank.variations.length} biến thể
          </span>
        </div>

        <h4 className="font-black text-slate-900 text-base leading-snug group-hover:text-violet-600 transition-colors">
          {blank.title}
        </h4>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
          {blank.description || 'Phôi chất lượng cao chuyên dụng cho công nghệ in ấn Direct-To-Garment (DTG) và thêu.'}
        </p>
      </div>

      {/* Variations list */}
      <div className="border-t border-slate-100 pt-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-600 font-bold flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-violet-600" />
            Bảng giá phôi ({blank.variations.length})
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Giá gốc xưởng</span>
        </div>

        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
          {blank.variations.map((v, idx) => (
            <div 
              key={idx} 
              className="flex justify-between items-center text-xs bg-slate-50/80 hover:bg-violet-50/50 px-3 py-1.5 rounded-xl border border-slate-200/70 transition-colors"
            >
              <div>
                <span className="text-slate-800 font-bold block text-[11px] font-mono">{v.sku}</span>
                <span className="text-[10px] text-slate-400">{[v.color, v.size, v.material].filter(Boolean).join(' • ')}</span>
              </div>
              <span className="font-extrabold text-violet-700 text-xs">{v.base_cost.toLocaleString()}đ</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

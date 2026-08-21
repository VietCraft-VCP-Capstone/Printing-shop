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
  return (
    <div className="bg-[#1b1548]/30 border border-[#2b216f]/60 rounded-2xl p-5 hover:border-violet-500/40 transition-all flex flex-col justify-between text-slate-100">
      <div>
        <div className="w-full h-44 rounded-xl bg-[#0e0a29] overflow-hidden border border-[#2e2671] mb-4">
          <img src={blank.default_image} alt={blank.title} className="w-full h-full object-cover" />
        </div>
        <span className="text-[10px] bg-violet-950 text-violet-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-violet-850">
          {blank.category}
        </span>
        <h4 className="font-bold text-white text-base mt-2">{blank.title}</h4>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{blank.description}</p>
      </div>

      <div className="border-t border-[#201955] pt-4 mt-4">
        <span className="text-xs text-slate-400 font-semibold block mb-2">Biến thể phôi khả dụng ({blank.variations.length}):</span>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {blank.variations.map((v, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs bg-[#0e0a29]/80 px-3 py-1.5 rounded-lg border border-[#201955]">
              <div>
                <span className="text-slate-200 font-bold block">{v.sku}</span>
                <span className="text-[10px] text-slate-500">{[v.color, v.size].filter(Boolean).join(' • ')}</span>
              </div>
              <span className="font-bold text-violet-400">{v.base_cost.toLocaleString()}đ</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

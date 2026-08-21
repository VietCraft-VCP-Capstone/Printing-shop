import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: ReactNode;
  statusText: string;
  hoverColorClass: string;
  glowColorClass: string;
  statusBgClass: string;
}

export default function StatCard({
  title,
  value,
  unit,
  icon,
  statusText,
  hoverColorClass,
  glowColorClass,
  statusBgClass
}: StatCardProps) {
  return (
    <div className={`bg-gradient-to-br from-[#1c1447] to-[#120e33] border border-[#2f257b]/60 rounded-2xl p-5 shadow-xl relative overflow-hidden group ${hoverColorClass} transition-all`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${glowColorClass} rounded-full blur-2xl group-hover:opacity-100 transition-all`}></div>
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold">{value}</span>
        <span className="text-xs text-slate-500 font-medium">{unit}</span>
      </div>
      <div className={`mt-4 flex items-center gap-1.5 text-xs ${statusBgClass} w-fit px-2.5 py-1 rounded-lg`}>
        {icon}
        {statusText}
      </div>
    </div>
  );
}

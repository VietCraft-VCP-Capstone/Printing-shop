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
    <div className={`bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md relative overflow-hidden group ${hoverColorClass} transition-all`}>
      <div className={`absolute top-0 right-0 w-24 h-24 ${glowColorClass} rounded-full blur-2xl group-hover:opacity-100 transition-all pointer-events-none`}></div>
      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-2">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900">{value}</span>
        <span className="text-xs text-slate-400 font-medium">{unit}</span>
      </div>
      <div className={`mt-4 flex items-center gap-1.5 text-xs ${statusBgClass} w-fit px-2.5 py-1 rounded-lg font-bold`}>
        {icon}
        {statusText}
      </div>
    </div>
  );
}

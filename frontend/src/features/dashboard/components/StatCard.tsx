import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: ReactNode;
  statusText: string;
  iconContainerClass?: string;
  badgeClass?: string;
}

export default function StatCard({
  title,
  value,
  unit,
  icon,
  statusText,
  iconContainerClass = 'bg-slate-100 text-slate-600',
  badgeClass = 'bg-slate-50 text-slate-600 border-slate-200',
}: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-500 tracking-tight truncate">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconContainerClass}`}>
          {icon}
        </div>
      </div>

      {/* Middle row: Large Value & Unit */}
      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-medium text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {/* Bottom row: Status tag */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${badgeClass}`}>
          {statusText}
        </span>
      </div>
    </div>
  );
}

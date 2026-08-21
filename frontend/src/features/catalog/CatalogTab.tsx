import BlankCard from './components/BlankCard';
import { Layers } from 'lucide-react';

interface CatalogTabProps {
  blanks: any[];
  loadingBlanks: boolean;
}

export default function CatalogTab({ blanks, loadingBlanks }: CatalogTabProps) {
  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-base tracking-wide flex items-center gap-2 mb-2 text-slate-900">
          <Layers className="w-4 h-4 text-violet-600" />
          Danh mục phôi cung ứng cho VietCraft
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Đây là những sản phẩm phôi thô mà xưởng cung cấp. Hệ thống VietCraft sẽ tự động đồng bộ danh sách này để hiển thị trên bộ thiết kế Canvas của các Seller.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingBlanks ? (
            <div className="col-span-full text-center py-16 text-slate-400">Đang tải danh sách phôi...</div>
          ) : blanks.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-400">Chưa có phôi sản phẩm nào được khai báo.</div>
          ) : (
            blanks.map((b) => (
              <BlankCard key={b._id} blank={b} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

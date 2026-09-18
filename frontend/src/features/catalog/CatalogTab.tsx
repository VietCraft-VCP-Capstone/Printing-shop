import { useState } from 'react';
import BlankCard from './components/BlankCard';
import BlankFormModal from './components/BlankFormModal';
import { Layers, Search, Shirt, Plus } from 'lucide-react';
import api from '../../services/api';

interface CatalogTabProps {
  blanks: any[];
  loadingBlanks: boolean;
  userRole?: string;
  onRefresh?: () => void;
}

export default function CatalogTab({ blanks, loadingBlanks, userRole, onRefresh }: CatalogTabProps) {
  const isAdmin = userRole === 'ADMIN';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [modalBlank, setModalBlank] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const openCreate = () => { setModalBlank(null); setShowModal(true); };
  const openEdit = (b: any) => { setModalBlank(b); setShowModal(true); };
  const handleDelete = async (b: any) => {
    if (!window.confirm(`Xác nhận xóa phôi "${b.title}" khỏi hệ thống xưởng?`)) return;
    try {
      await api.delete(`/api/blanks/${b._id}`);
      onRefresh?.();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xóa thất bại');
    }
  };

  // Lấy danh sách category duy nhất
  const categories = ['ALL', ...Array.from(new Set(blanks.map(b => b.category).filter(Boolean)))];

  const filteredBlanks = blanks.filter(b => {
    const matchCat = selectedCategory === 'ALL' || b.category === selectedCategory;
    const matchQuery = !searchQuery || 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.variations?.some((v: any) => v.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-violet-300 text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
              <Shirt className="w-3.5 h-3.5" /> Kho Phôi Vật Tư Cung Ứng
            </div>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">Danh Mục Phôi Đồng Bộ Sàn VietCraft</h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl leading-relaxed">
              Các mặt hàng phôi in (áo thun, hoodie, túi vải, cốc sứ...) có sẵn tại xưởng. Dữ liệu phôi và bảng giá base cost được đồng bộ tự động để người bán (Seller) trên sàn VietCraft thiết kế và định giá sản phẩm POD.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start md:self-auto">
            {isAdmin && (
              <button 
                onClick={openCreate} 
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Thêm phôi in mới
              </button>
            )}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 text-center min-w-[120px]">
              <span className="text-[10px] text-fuchsia-300 uppercase font-black block">Tổng loại phôi</span>
              <span className="text-2xl font-black text-white">{blanks.length}</span>
              <span className="text-[9px] text-slate-300 block">sẵn sàng in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category Filter */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm phôi in theo tên, SKU, chất liệu..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 self-end sm:self-auto">
            <span>Hiển thị: <strong className="text-slate-900 font-bold">{filteredBlanks.length}</strong> / {blanks.length} phôi</span>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 text-xs font-bold scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả phân loại' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blanks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingBlanks ? (
          <div className="col-span-full text-center py-20 text-slate-400">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
              <span className="font-medium text-xs">Đang tải kho phôi sản phẩm...</span>
            </div>
          </div>
        ) : filteredBlanks.length === 0 ? (
          <div className="col-span-full text-center py-20 text-slate-400 bg-white border border-slate-200/80 rounded-2xl">
            <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-1">
                <Layers className="w-6 h-6" />
              </div>
              <span className="font-bold text-slate-700 text-sm">Không tìm thấy phôi phù hợp</span>
              <p className="text-[11px] text-slate-400">
                Thử tìm với từ khóa khác hoặc chuyển sang danh mục "Tất cả phân loại".
              </p>
            </div>
          </div>
        ) : (
          filteredBlanks.map((b) => (
            <BlankCard 
              key={b._id} 
              blank={b} 
              isAdmin={isAdmin}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {showModal && (
        <BlankFormModal 
          blank={modalBlank} 
          onClose={() => setShowModal(false)} 
          onSaved={() => onRefresh?.()} 
        />
      )}
    </div>
  );
}

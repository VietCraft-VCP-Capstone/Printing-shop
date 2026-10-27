import { useState, useMemo } from 'react';
import BlankCard from './components/BlankCard';
import BlankFormModal from './components/BlankFormModal';
import { Layers, Plus, Search } from 'lucide-react';
import api from '../../services/api';

interface CatalogTabProps {
  blanks: any[];
  loadingBlanks: boolean;
  userRole?: string;
  onRefresh?: () => void;
}

export default function CatalogTab({ blanks, loadingBlanks, userRole, onRefresh }: CatalogTabProps) {
  const canManageCatalog = userRole === 'PRINTER' || userRole === 'ADMIN';
  const [modalBlank, setModalBlank] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const openCreate = () => { setModalBlank(null); setShowModal(true); };
  const openEdit = (b: any) => { setModalBlank(b); setShowModal(true); };
  const handleDelete = async (b: any) => {
    if (!window.confirm(`Xóa phôi "${b.title}"?`)) return;
    try {
      await api.delete(`/api/blanks/${b._id}`);
      onRefresh?.();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Xóa thất bại');
    }
  };

  // Get list of categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    blanks.forEach(b => { if (b.category) set.add(b.category); });
    return Array.from(set);
  }, [blanks]);

  // Filtered blanks
  const filteredBlanks = useMemo(() => {
    return blanks.filter(b => {
      const matchSearch = !searchQuery.trim() ||
        b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.variations?.some((v: any) => v.sku?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategory === 'ALL' || b.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [blanks, searchQuery, selectedCategory]);

  const totalVariants = useMemo(() => {
    return blanks.reduce((acc, b) => acc + (b.variations?.length || 0), 0);
  }, [blanks]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
          <div>
            <h3 className="font-bold text-base tracking-wide flex items-center gap-2 text-slate-900">
              <Layers className="w-4 h-4 text-violet-600" />
              Danh mục phôi cung ứng cho VietCraft
              <span className="text-xs font-normal text-slate-400">({blanks.length} phôi, {totalVariants} biến thể SKU)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phôi thô và thông số vùng in chuẩn hóa theo luồng Printify Print Provider, đồng bộ tự động với Canvas Designer của Seller.
            </p>
          </div>
          {canManageCatalog && (
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 bg-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-violet-700 shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" /> Khai báo phôi mới
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-5 pt-4 border-t border-slate-100">
          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              placeholder="Tìm theo tên phôi, brand hoặc SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Blank Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingBlanks ? (
            <div className="col-span-full text-center py-16 text-slate-400">Đang tải danh sách phôi...</div>
          ) : filteredBlanks.length === 0 ? (
            <div className="col-span-full text-center py-16 text-slate-400">
              {searchQuery || selectedCategory !== 'ALL'
                ? 'Không tìm thấy phôi sản phẩm nào phù hợp bộ lọc.'
                : 'Chưa có phôi sản phẩm nào được khai báo.'}
            </div>
          ) : (
            filteredBlanks.map((b) => (
              <BlankCard key={b._id} blank={b} isAdmin={canManageCatalog} onEdit={openEdit} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>

      {showModal && (
        <BlankFormModal blank={modalBlank} onClose={() => setShowModal(false)} onSaved={() => onRefresh?.()} />
      )}
    </div>
  );
}

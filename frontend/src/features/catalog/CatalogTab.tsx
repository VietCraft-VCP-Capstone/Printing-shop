import { useState } from 'react';
import BlankCard from './components/BlankCard';
import BlankFormModal from './components/BlankFormModal';
import { Layers, Plus } from 'lucide-react';
import api from '../../services/api';

interface CatalogTabProps {
  blanks: any[];
  loadingBlanks: boolean;
  userRole?: string;
  onRefresh?: () => void;
}

export default function CatalogTab({ blanks, loadingBlanks, userRole, onRefresh }: CatalogTabProps) {
  const isAdmin = userRole === 'ADMIN';
  const [modalBlank, setModalBlank] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const openCreate = () => { setModalBlank(null); setShowModal(true); };
  const openEdit = (b: any) => { setModalBlank(b); setShowModal(true); };
  const handleDelete = async (b: any) => {
    if (!window.confirm(`Xóa phôi "${b.title}"?`)) return;
    try { await api.delete(`/api/blanks/${b._id}`); onRefresh?.(); }
    catch (err: any) { alert(err.response?.data?.error || 'Xóa thất bại'); }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-base tracking-wide flex items-center gap-2 text-slate-900">
            <Layers className="w-4 h-4 text-violet-600" />
            Danh mục phôi cung ứng cho VietCraft
          </h3>
          {isAdmin && (
            <button onClick={openCreate} className="flex items-center gap-1.5 bg-violet-600 text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-violet-700">
              <Plus className="w-4 h-4" /> Thêm phôi
            </button>
          )}
        </div>
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
              <BlankCard key={b._id} blank={b} isAdmin={isAdmin} onEdit={openEdit} onDelete={handleDelete} />
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

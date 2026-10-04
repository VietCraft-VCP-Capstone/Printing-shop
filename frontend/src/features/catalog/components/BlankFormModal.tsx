import { useState } from 'react';
import {
  X, Plus, Trash2, Layers, Sliders, Sparkles, Clock, Palette,
  Eye
} from 'lucide-react';
import api from '../../../services/api';
import ImageUploadZone from './ImageUploadZone';

interface Variation {
  sku: string;
  color?: string;
  color_hex?: string;
  size?: string;
  material?: string;
  weight_gram?: number;
  base_cost: number;
  in_stock?: boolean;
}

interface PrintArea {
  key: string;
  label?: string;
  image?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  surface?: 'flat' | 'wrap';
  physical_width_cm?: number;
  physical_height_cm?: number;
  template_w?: number;
  template_h?: number;
  arc?: number;
}

interface Props {
  blank: any | null; // null = tạo mới
  onClose: () => void;
  onSaved: () => void;
}

const emptyVar = (color = 'Trắng', color_hex = '#FFFFFF', size = 'L', base_cost = 85000): Variation => ({
  sku: `BLANK-${Date.now().toString().slice(-4)}-${size}`,
  color,
  color_hex,
  size,
  material: '100% Cotton 220gsm',
  weight_gram: 220,
  base_cost,
  in_stock: true
});

const emptyArea = (key = 'front', label = 'Mặt trước'): PrintArea => ({
  key,
  label,
  image: '',
  x: 275,
  y: 220,
  width: 250,
  height: 330,
  surface: 'flat',
  physical_width_cm: 30,
  physical_height_cm: 40
});

const PRINT_TECHNIQUES = [
  { id: 'DTG', name: 'In kỹ thuật số trực tiếp (DTG)', desc: 'Mực thấm sâu vào sợi vải, độ phân giải cao' },
  { id: 'DTF', name: 'In màng Pet nhiệt (DTF)', desc: 'Màu sắc rực rỡ trên mọi chất liệu vải' },
  { id: 'SCREEN', name: 'In lụa thủ công (Screen Print)', desc: 'Phù hợp đơn số lượng lớn, độ bền màu cao' },
  { id: 'EMBROIDERY', name: 'Thêu vi tính (Embroidery)', desc: 'Sang trọng, đường chỉ nổi cao cấp' },
  { id: 'UV', name: 'In UV phẳng / cuộn (UV Print)', desc: 'Chuyên dụng cho ly cốc, ốp lưng, mica' },
  { id: 'SUBLIMATION', name: 'In chuyển nhiệt (Sublimation)', desc: 'In toàn thân AOP trên vải polyester, gốm sứ' }
];

const PRESET_COLORS = [
  { name: 'Trắng', hex: '#FFFFFF' },
  { name: 'Đen', hex: '#111827' },
  { name: 'Xám Melange', hex: '#9CA3AF' },
  { name: 'Xanh Navy', hex: '#1E3A8A' },
  { name: 'Nâu Gỗ / Đất', hex: '#78350F' },
  { name: 'Be / Kem', hex: '#F5F5DC' },
  { name: 'Đỏ Đô', hex: '#991B1B' },
  { name: 'Xanh Rêu', hex: '#14532D' }
];

export default function BlankFormModal({ blank, onClose, onSaved }: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'areas' | 'variants'>('info');

  // Tab 1: General Info
  const [title, setTitle] = useState(blank?.title || '');
  const [brand, setBrand] = useState(blank?.brand || 'VietCraft Original');
  const [category, setCategory] = useState(blank?.category || 'Thời trang');
  const [printTechnique, setPrintTechnique] = useState(blank?.print_technique || 'DTG');
  const [productionTime, setProductionTime] = useState(blank?.production_time || '1 - 3 ngày làm việc');
  const [defaultImage, setDefaultImage] = useState(blank?.default_image || '');
  const [description, setDescription] = useState(blank?.description || '');
  const [dimensionsInfo, setDimensionsInfo] = useState(blank?.dimensions_info || '');
  const [careInstructions, setCareInstructions] = useState(blank?.care_instructions || 'Giặt máy nước lạnh, lộn trái khi giặt và ủi, không dùng chất tẩy mạnh.');
  const [isActive, setIsActive] = useState(blank?.is_active ?? true);

  // Tab 2: Print Areas
  const [printAreas, setPrintAreas] = useState<PrintArea[]>(
    blank?.print_areas?.length ? blank.print_areas : [emptyArea('front', 'Mặt trước')]
  );
  const [selectedAreaIdx, setSelectedAreaIdx] = useState(0);

  // Tab 3: Variations
  const [variations, setVariations] = useState<Variation[]>(
    blank?.variations?.length ? blank.variations : [emptyVar('Trắng', '#FFFFFF', 'M', 85000), emptyVar('Đen', '#111827', 'L', 85000)]
  );
  const [bulkPrice, setBulkPrice] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Variation handlers
  const setVar = (i: number, f: keyof Variation, v: any) =>
    setVariations(prev => prev.map((x, idx) => idx === i ? { ...x, [f]: v } : x));

  const addPresetSizes = (colorName: string, colorHex: string, baseCost = 85000) => {
    const sizes = ['S', 'M', 'L', 'XL', '2XL'];
    const prefix = (title.split(' ')[0] || 'BLANK').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const newVars: Variation[] = sizes.map(s => ({
      sku: `${prefix}-${colorName.slice(0, 3).toUpperCase()}-${s}`,
      color: colorName,
      color_hex: colorHex,
      size: s,
      material: variations[0]?.material || '100% Cotton 220gsm',
      weight_gram: s === '2XL' ? 260 : 220,
      base_cost: s === '2XL' ? baseCost + 5000 : baseCost,
      in_stock: true
    }));
    setVariations(prev => [...prev, ...newVars]);
  };

  const applyBulkPrice = () => {
    const priceNum = Number(bulkPrice);
    if (!priceNum || priceNum <= 0) return;
    setVariations(prev => prev.map(v => ({ ...v, base_cost: priceNum })));
    setBulkPrice('');
  };

  // Print area handlers
  const setArea = (i: number, f: keyof PrintArea, v: any) =>
    setPrintAreas(prev => prev.map((x, idx) => idx === i ? { ...x, [f]: v } : x));

  const addPrintArea = () => {
    const nextKey = printAreas.some(a => a.key === 'back') ? `sleeve_${Date.now().toString().slice(-3)}` : 'back';
    const nextLabel = nextKey === 'back' ? 'Mặt sau' : 'Tay áo';
    const newArea = emptyArea(nextKey, nextLabel);
    setPrintAreas(prev => [...prev, newArea]);
    setSelectedAreaIdx(printAreas.length);
  };

  const submit = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập Tiêu đề phôi sản phẩm.');
      setActiveTab('info');
      return;
    }
    if (!category.trim()) {
      setError('Vui lòng chọn hoặc nhập Danh mục.');
      setActiveTab('info');
      return;
    }
    if (!defaultImage.trim()) {
      setError('Vui lòng tải lên hoặc dán URL Ảnh phôi đại diện.');
      setActiveTab('info');
      return;
    }
    if (variations.length === 0) {
      setError('Phôi cần ít nhất 1 biến thể SKU.');
      setActiveTab('variants');
      return;
    }
    if (variations.some(v => !v.sku?.trim() || v.base_cost <= 0)) {
      setError('Tất cả các biến thể cần có mã SKU và giá phôi > 0.');
      setActiveTab('variants');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title,
      brand,
      category,
      print_technique: printTechnique,
      production_time: productionTime,
      default_image: defaultImage,
      description,
      dimensions_info: dimensionsInfo,
      care_instructions: careInstructions,
      is_active: isActive,
      variations,
      print_areas: printAreas
    };

    try {
      if (blank?._id) {
        await api.put(`/api/blanks/${blank._id}`, payload);
      } else {
        await api.post('/api/blanks', payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lưu phôi thất bại. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const currentArea = printAreas[selectedAreaIdx] || printAreas[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800 border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 uppercase">
                Printify Standard Blueprint
              </span>
              <h3 className="font-bold text-lg text-slate-900">
                {blank ? 'Chỉnh sửa thông số phôi' : 'Khai báo phôi in mới'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấu hình phôi thô, vị trí vùng in và ma trận biến thể đồng bộ với VietCraft POD Designer.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'info'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            1. Thông tin & Ảnh phôi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('areas')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'areas'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            2. Vùng in & Mặt in ({printAreas.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('variants')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'variants'
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            3. Biến thể Màu / Size & Giá ({variations.length})
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-3 bg-rose-50 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl border border-rose-200 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: General Info */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Tiêu đề phôi sản phẩm *
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="VD: Áo Thun Oversize Cotton 250gsm, Ly Sứ Men Mát 350ml..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Thương hiệu / Dòng phôi (Brand)
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    value={brand}
                    onChange={e => setBrand(e.target.value)}
                    placeholder="VD: Bella+Canvas 3001, Gildan 5000, VietCraft Pro..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Danh mục phôi *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="Thời trang">Thời trang (Áo thun, Hoodie, Sweater)</option>
                    <option value="Phụ kiện">Phụ kiện (Túi Tote, Nón, Khăn)</option>
                    <option value="Ly cốc & Bình">Ly cốc & Bình giữ nhiệt</option>
                    <option value="Trang trí nhà cửa">Trang trí nhà cửa (Tranh Canvas, Gối)</option>
                    <option value="Đồ lưu niệm">Đồ lưu niệm & Quà tặng</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Công nghệ in hỗ trợ
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    value={printTechnique}
                    onChange={e => setPrintTechnique(e.target.value)}
                  >
                    {PRINT_TECHNIQUES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Thời gian sản xuất (SLA)
                  </label>
                  <div className="relative">
                    <input
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                      value={productionTime}
                      onChange={e => setProductionTime(e.target.value)}
                      placeholder="1 - 3 ngày làm việc"
                    />
                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Upload Ảnh phôi đại diện */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <ImageUploadZone
                  value={defaultImage}
                  onChange={url => setDefaultImage(url)}
                  label="Ảnh phôi đại diện chính (Default Mockup) *"
                  aspectRatioHint="Khuyên dùng: Ảnh áo/phôi trơn nền trắng hoặc trong suốt PNG, tỷ lệ 1:1, tối thiểu 1000px"
                />
              </div>

              {/* Form dáng & Bảng size tóm tắt */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Thông số form dáng / Kích thước cơ bản
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    value={dimensionsInfo}
                    onChange={e => setDimensionsInfo(e.target.value)}
                    placeholder="VD: Dài 72cm × Rộng 54cm (Form Oversize Unisex dáng rộng)..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Hướng dẫn giặt / Bảo quản mực in
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                    value={careInstructions}
                    onChange={e => setCareInstructions(e.target.value)}
                    placeholder="VD: Giặt máy nước lạnh, lộn trái khi giặt và ủi..."
                  />
                </div>
              </div>

              {/* Mô tả chi tiết */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Mô tả chất liệu & Cảm quan phôi
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Mô tả định lượng vải (GSM), độ co giãn, công nghệ dệt không xơ giúp mực in bám chắc, không bong tróc..."
                />
              </div>

              {/* Trạng thái cung cấp */}
              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="blank-is-active"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300"
                />
                <label htmlFor="blank-is-active" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Kích hoạt phôi ngay (Hiển thị tức thì trong Catalog cho các Seller kết nối)
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: Print Areas & Multi-view Mockups */}
          {activeTab === 'areas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-violet-600" />
                    Các góc nhìn & Vùng in (Print Areas)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Cấu hình từng mặt in (Mặt trước, mặt sau, tay áo, cuộn quanh thân). Mỗi mặt có thể có ảnh mockup riêng và tọa độ vùng in.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPrintArea}
                  className="px-3 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Thêm mặt in mới
                </button>
              </div>

              {/* Print area selector chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {printAreas.map((area, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAreaIdx(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 shrink-0 transition-all ${
                      selectedAreaIdx === idx
                        ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{area.label || area.key}</span>
                    <span className="text-[10px] opacity-70">({area.surface === 'wrap' ? 'Cuộn' : 'Phẳng'})</span>
                    {printAreas.length > 1 && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrintAreas(p => p.filter((_, i) => i !== idx));
                          if (selectedAreaIdx >= idx && selectedAreaIdx > 0) setSelectedAreaIdx(selectedAreaIdx - 1);
                        }}
                        className="hover:text-rose-300 ml-1 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Current Print Area Editor */}
              {currentArea && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  {/* Left: Inputs */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Mã vị trí (Key) *
                        </label>
                        <input
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                          value={currentArea.key}
                          onChange={e => setArea(selectedAreaIdx, 'key', e.target.value)}
                          placeholder="front, back, sleeve_left..."
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Tên hiển thị (Label) *
                        </label>
                        <input
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                          value={currentArea.label || ''}
                          onChange={e => setArea(selectedAreaIdx, 'label', e.target.value)}
                          placeholder="Mặt trước, Mặt sau..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Kiểu bề mặt POD
                        </label>
                        <select
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                          value={currentArea.surface || 'flat'}
                          onChange={e => setArea(selectedAreaIdx, 'surface', e.target.value)}
                        >
                          <option value="flat">Phẳng (Áo thun, Canvas, Túi)</option>
                          <option value="wrap">Cuộn cong (Cốc sứ, Bình nước)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Kích thước in ngoài đời (cm)
                        </label>
                        <div className="grid grid-cols-2 gap-1">
                          <input
                            type="number"
                            className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                            placeholder="W (cm)"
                            value={currentArea.physical_width_cm || ''}
                            onChange={e => setArea(selectedAreaIdx, 'physical_width_cm', Number(e.target.value))}
                          />
                          <input
                            type="number"
                            className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                            placeholder="H (cm)"
                            value={currentArea.physical_height_cm || ''}
                            onChange={e => setArea(selectedAreaIdx, 'physical_height_cm', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vùng in pixel */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-700 block mb-2">
                        Tọa độ khung in trên ảnh (px):
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Tọa độ X</label>
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center font-mono"
                            value={currentArea.x}
                            onChange={e => setArea(selectedAreaIdx, 'x', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Tọa độ Y</label>
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center font-mono"
                            value={currentArea.y}
                            onChange={e => setArea(selectedAreaIdx, 'y', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Rộng (W)</label>
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center font-mono"
                            value={currentArea.width}
                            onChange={e => setArea(selectedAreaIdx, 'width', Number(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Cao (H)</label>
                          <input
                            type="number"
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs text-center font-mono"
                            value={currentArea.height}
                            onChange={e => setArea(selectedAreaIdx, 'height', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upload Mockup riêng cho mặt in này */}
                    <div>
                      <ImageUploadZone
                        value={currentArea.image || ''}
                        onChange={url => setArea(selectedAreaIdx, 'image', url)}
                        label={`Ảnh phôi riêng cho "${currentArea.label || currentArea.key}" (để trống sẽ dùng ảnh phôi chính)`}
                        previewHeightClass="h-28"
                      />
                    </div>
                  </div>

                  {/* Right: Live Bounding Box Visualizer */}
                  <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-4">
                    <span className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-violet-600" />
                      Mô phỏng vị trí khung in trên mockup
                    </span>
                    <div className="relative w-64 h-64 rounded-xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner">
                      <img
                        src={currentArea.image || defaultImage || '/placeholder.png'}
                        alt="Mockup view"
                        className="w-full h-full object-contain pointer-events-none"
                        onError={(e: any) => { e.currentTarget.style.opacity = '0.2'; }}
                      />
                      {/* Bounding Box overlay */}
                      <div
                        className="absolute border-2 border-violet-500 bg-violet-500/20 rounded flex items-center justify-center text-[10px] font-bold text-violet-900 pointer-events-none transition-all shadow-xs"
                        style={{
                          left: `${Math.max(5, Math.min(85, (currentArea.x / 800) * 100))}%`,
                          top: `${Math.max(5, Math.min(85, (currentArea.y / 800) * 100))}%`,
                          width: `${Math.max(10, Math.min(90, (currentArea.width / 800) * 100))}%`,
                          height: `${Math.max(10, Math.min(90, (currentArea.height / 800) * 100))}%`,
                        }}
                      >
                        <span className="bg-white/90 px-1 py-0.5 rounded shadow-xs text-[9px] border border-violet-200">
                          {currentArea.key}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 text-center">
                      Khung tím viền đứt là khu vực Seller có thể chèn hình in canvas trên VietCraft.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Variations Matrix & Pricing */}
          {activeTab === 'variants' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-violet-50/70 p-3.5 rounded-xl border border-violet-100">
                <div>
                  <span className="text-xs font-bold text-violet-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                    Thêm nhanh bộ kích thước chuẩn (Quick Presets)
                  </span>
                  <p className="text-[11px] text-violet-700/80">
                    Bấm để tự động sinh 5 size (S, M, L, XL, 2XL) kèm mã màu tương ứng:
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => addPresetSizes(c.name, c.hex)}
                      className="px-2.5 py-1 bg-white hover:bg-violet-100 border border-violet-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <span className="w-3 h-3 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: c.hex }} />
                      + {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bulk price tool */}
              <div className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">Áp giá đồng loạt:</span>
                  <input
                    type="number"
                    className="w-28 px-2 py-1 text-xs border border-slate-300 rounded-lg"
                    placeholder="VD: 85000"
                    value={bulkPrice}
                    onChange={e => setBulkPrice(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={applyBulkPrice}
                    className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    Áp dụng tất cả
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setVariations(p => [...p, emptyVar()])}
                  className="text-violet-600 text-xs font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm dòng biến thể
                </button>
              </div>

              {/* Variations Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">Mã SKU *</th>
                        <th className="py-2.5 px-3">Màu sắc & Swatch</th>
                        <th className="py-2.5 px-3">Kích cỡ</th>
                        <th className="py-2.5 px-3">Chất liệu</th>
                        <th className="py-2.5 px-3">Trọng lượng (g)</th>
                        <th className="py-2.5 px-3">Giá phôi (VNĐ) *</th>
                        <th className="py-2.5 px-3 text-center">Kho hàng</th>
                        <th className="py-2.5 px-2 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {variations.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-2 min-w-[140px]">
                            <input
                              className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                              placeholder="SKU-001"
                              value={v.sku}
                              onChange={e => setVar(i, 'sku', e.target.value)}
                            />
                          </td>
                          <td className="p-2 min-w-[130px]">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="color"
                                className="w-6 h-6 rounded border border-slate-200 cursor-pointer p-0 shrink-0"
                                value={v.color_hex || '#FFFFFF'}
                                onChange={e => setVar(i, 'color_hex', e.target.value)}
                                title="Chọn màu trực quan"
                              />
                              <input
                                className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                                placeholder="Tên màu"
                                value={v.color || ''}
                                onChange={e => setVar(i, 'color', e.target.value)}
                              />
                            </div>
                          </td>
                          <td className="p-2 w-20">
                            <input
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-center font-bold"
                              placeholder="Size"
                              value={v.size || ''}
                              onChange={e => setVar(i, 'size', e.target.value)}
                            />
                          </td>
                          <td className="p-2 min-w-[120px]">
                            <input
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                              placeholder="Chất liệu"
                              value={v.material || ''}
                              onChange={e => setVar(i, 'material', e.target.value)}
                            />
                          </td>
                          <td className="p-2 w-24">
                            <input
                              type="number"
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-center"
                              placeholder="200"
                              value={v.weight_gram || ''}
                              onChange={e => setVar(i, 'weight_gram', Number(e.target.value))}
                            />
                          </td>
                          <td className="p-2 w-28">
                            <input
                              type="number"
                              className="w-full px-2 py-1 border border-slate-200 rounded text-xs font-bold text-violet-700 text-right"
                              placeholder="85000"
                              value={v.base_cost || ''}
                              onChange={e => setVar(i, 'base_cost', Number(e.target.value))}
                            />
                          </td>
                          <td className="p-2 text-center w-24">
                            <button
                              type="button"
                              onClick={() => setVar(i, 'in_stock', !v.in_stock)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                                v.in_stock !== false
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                              }`}
                            >
                              {v.in_stock !== false ? 'Còn hàng' : 'Tạm hết'}
                            </button>
                          </td>
                          <td className="p-2 text-center w-10">
                            <button
                              type="button"
                              onClick={() => setVariations(p => p.filter((_, idx) => idx !== i))}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              disabled={variations.length === 1}
                              title="Xóa biến thể"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {activeTab === 'info' && 'Bước 1: Điền thông tin phôi & Tải ảnh mockup.'}
            {activeTab === 'areas' && `Bước 2: Căn chỉnh ${printAreas.length} vùng in cho bộ thiết kế.`}
            {activeTab === 'variants' && `Bước 3: Hoàn thiện ${variations.length} biến thể SKU & Giá phôi.`}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-white text-slate-700 transition-colors"
            >
              Hủy
            </button>
            {activeTab !== 'variants' ? (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'info' ? 'areas' : 'variants')}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-colors flex items-center gap-1"
              >
                Tiếp tục
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {saving ? 'Đang lưu...' : (blank ? 'Cập nhật phôi' : 'Lưu & Khai báo phôi')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

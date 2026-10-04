import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { UploadCloud, Link as LinkIcon, Trash2, Loader2, CheckCircle2, Image as ImageIcon, Cloud } from 'lucide-react';
import api from '../../../services/api';

interface ImageUploadZoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  aspectRatioHint?: string;
  previewHeightClass?: string;
}

export default function ImageUploadZone({
  value,
  onChange,
  label = 'Ảnh phôi (Mockup Base)',
  placeholder = 'https://...',
  aspectRatioHint = 'Khuyến nghị: PNG nền trong suốt, tối thiểu 1000×1000px, tối đa 15MB',
  previewHeightClass = 'h-48'
}: ImageUploadZoneProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Chỉ hỗ trợ file hình ảnh (PNG, JPG, WEBP, SVG).');
      return;
    }

    // Check file size (15MB max)
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Dung lượng ảnh tối đa 15MB.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/api/blanks/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data?.url) {
        onChange(res.data.url);
      }
    } catch (err: any) {
      console.error('Lỗi tải ảnh:', err);
      setUploadError(err.response?.data?.error || 'Tải ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-violet-600" />
          {label}
        </label>
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              mode === 'upload' ? 'bg-white text-violet-700 shadow-xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3 h-3" />
            Tải từ máy
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              mode === 'url' ? 'bg-white text-violet-700 shadow-xs font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            Link URL
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="text-xs text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
          {uploadError}
        </div>
      )}

      {/* Main preview or upload area */}
      {value ? (
        <div className="relative group rounded-xl border border-slate-200 bg-slate-50/70 p-2 flex items-center gap-3">
          <div className={`w-28 ${previewHeightClass} max-h-32 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs p-1 relative`}>
            <img
              src={value}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1 flex-wrap">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Đã chọn ảnh phôi</span>
              {value.includes('cloudinary.com') && (
                <span className="text-[10px] bg-sky-50 text-sky-700 font-semibold px-2 py-0.5 rounded-md border border-sky-200 flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-sky-600" />
                  Cloudinary CDN
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate" title={value}>
              {value}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline inline-flex items-center gap-1"
              >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                Đổi ảnh khác
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => onChange('')}
                className="text-xs font-medium text-rose-500 hover:text-rose-700 hover:underline inline-flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Xóa ảnh
              </button>
            </div>
          </div>
        </div>
      ) : mode === 'upload' ? (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
            dragOver
              ? 'border-violet-500 bg-violet-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-violet-400 bg-slate-50/50 hover:bg-violet-50/20'
          }`}
        >
          {uploading ? (
            <div className="py-3 flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 text-violet-600 animate-spin" />
              <span className="text-xs font-medium text-slate-600">Đang tải ảnh lên xưởng in...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Nhấp để chọn file ảnh từ máy hoặc kéo thả vào đây
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {aspectRatioHint}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
          <p className="text-[11px] text-slate-400">
            Dán đường dẫn trực tiếp tới ảnh phôi (JPG, PNG, WEBP).
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={onFileInputChange}
      />
    </div>
  );
}

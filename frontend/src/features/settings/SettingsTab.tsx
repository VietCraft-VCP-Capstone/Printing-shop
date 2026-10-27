import { useState } from 'react';
import { Settings as SettingsIcon, Database, Printer, Key, CheckCircle2, Building2, Phone, MapPin, FileText, User as UserIcon, Save, Copy, Check, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface SettingsTabProps {
  user: any;
  onUserUpdated?: (updatedUser: any) => void;
}

export default function SettingsTab({ user, onUserUpdated }: SettingsTabProps) {
  const isPrinter = user?.role === 'PRINTER' || user?.role === 'ADMIN' || user?.role === 'OPERATOR';

  // Profile states
  const [workshopName, setWorkshopName] = useState(user?.workshop_name || '');
  const [representativeName, setRepresentativeName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [description, setDescription] = useState(user?.description || '');

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      const res = await api.put('/api/auth/profile', {
        name: representativeName,
        workshop_name: workshopName,
        phone,
        address,
        description,
        role: user?.role || 'PRINTER'
      });
      setSuccessMsg('Đã cập nhật thông tin xưởng thành công!');
      if (onUserUpdated && res.data.user) {
        onUserUpdated(res.data.user);
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi lưu thông tin xưởng');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, type: 'id' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-violet-50 text-violet-700 text-[11px] font-semibold mb-2 border border-violet-100">
          <SettingsIcon className="w-3.5 h-3.5" /> Thiết lập hệ thống xưởng
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Cấu hình Hệ thống & Hồ Sơ Xưởng In
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Quản lý thông tin thương hiệu xưởng, địa chỉ giao nhận, thiết lập API tích hợp với sàn VietCraft và hãng vận chuyển.
        </p>
      </div>

      {/* WORKSHOP PROFILE FORM */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Hồ Sơ & Nhận Diện Xưởng In</h3>
              <p className="text-xs text-slate-500">Thông tin này được hiển thị cho các Seller trên sàn VietCraft khi tìm kiếm đối tác</p>
            </div>
          </div>

          {successMsg && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-violet-600" /> Tên Xưởng In / Workshop
              </label>
              <input
                type="text"
                value={workshopName}
                onChange={e => setWorkshopName(e.target.value)}
                placeholder="VD: Xưởng In Nam Định POD, Xưởng In VietCraft..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-violet-600" /> Người Đại Diện / Chủ Xưởng
              </label>
              <input
                type="text"
                value={representativeName}
                onChange={e => setRepresentativeName(e.target.value)}
                placeholder="Họ và tên người đại diện..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-violet-600" /> Số Điện Thoại Hotline / Zalo
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="VD: 0908889999"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
              />
            </div>

            <div>
              <label className="text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-violet-600" /> Địa Chỉ Nhà Xưởng / Kho Hàng
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-violet-600" /> Năng Lực Sản Xuất & Mô Tả Xưởng
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="VD: Xưởng trang bị 5 máy in DTG công nghiệp Brother GTX Pro, 3 máy in nhiệt khổ lớn. Công suất in 3.000 sản phẩm/ngày. Hỗ trợ may gia công và đóng gói theo yêu cầu..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
            />
          </div>

          {/* Integration Connection Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              🔗 Thông số định danh dành cho Seller liên kết từ VietCraft:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
                <div className="truncate pr-2">
                  <span className="text-[10px] text-slate-400 block">Printer ID:</span>
                  <span className="font-mono font-bold text-violet-700 truncate">{user?.id || user?._id || 'N/A'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(user?.id || user?._id || '', 'id')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedId ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
                <div className="truncate pr-2">
                  <span className="text-[10px] text-slate-400 block">API URL Xưởng in:</span>
                  <span className="font-mono font-bold text-slate-700 truncate">http://localhost:8880</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('http://localhost:8880', 'url')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copiedUrl ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-sm shadow-violet-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-60 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu Thông Tin Xưởng
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hardware Printers */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Thiết bị máy in</h3>
                <p className="text-[11px] text-slate-500">Kết nối máy in nhiệt & in DTG</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-500">
                Chưa có máy in ngoại vi nào kết nối qua cổng mạng nội bộ.
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Hỗ trợ driver máy in chuyển nhiệt Epson, Brother DTG và máy in UV công nghiệp.
          </p>
        </div>

        {/* Courier API Keys */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cấu hình hãng giao vận</h3>
                <p className="text-[11px] text-slate-500">API Token kết nối GHN & GHTK</p>
              </div>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-medium mb-1 block">Mã Token GHN Express</label>
                <input
                  type="password"
                  defaultValue="ghn_production_sec_token_9921"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium mb-1 block">Mã Token GHTK Express</label>
                <input
                  type="password"
                  defaultValue="ghtk_partner_auth_key_8812"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-xs focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
          <button 
            disabled={!isPrinter}
            onClick={() => alert('Đã lưu cấu hình API giao vận')}
            className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
              isPrinter ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Lưu thiết lập giao vận
          </button>
        </div>

        {/* Server & Webhooks */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Server & Webhook</h3>
                <p className="text-[11px] text-slate-500">Kết nối MongoDB & VietCraft</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-600">Port Backend</span>
                <span className="font-mono font-bold text-violet-700">8880</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-600">Quyền tài khoản</span>
                <span className={`font-semibold ${isPrinter ? 'text-violet-700' : 'text-slate-700'}`}>
                  {isPrinter ? 'XƯỞNG IN (Toàn quyền)' : 'SELLER (Đối tác bán hàng)'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-600">Đồng bộ Webhook</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Bật 2 chiều
                </span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Tự động thông báo đơn hàng cho Seller và Buyer tức thì.
          </p>
        </div>
      </div>
    </div>
  );
}

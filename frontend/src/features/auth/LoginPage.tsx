import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Printer, 
  ShieldAlert, 
  Loader2, 
  KeyRound, 
  Mail, 
  LogIn, 
  UserPlus, 
  User, 
  Shirt, 
  Sparkles, 
  CheckCircle2, 
  Palette, 
  Eye, 
  EyeOff,
  Zap,
  ExternalLink
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Chỉ 2 vai trò xưởng: Xưởng in POD hoặc Xưởng may mặc
  const [role, setRole] = useState<'POD_FACTORY' | 'GARMENT_FACTORY'>('POD_FACTORY');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleCredentialResponse = async (response: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/google', { id_token: response.credential });
      onLoginSuccess(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập Google thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (selectedRole: 'POD_FACTORY' | 'GARMENT_FACTORY') => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/auth/dev-login', { role: selectedRole });
      onLoginSuccess(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thử nghiệm thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      onLoginSuccess(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role });
      setSuccessMsg('Đăng ký thành công! Đang chuyển hướng...');
      onLoginSuccess(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  // Khởi tạo Google Sign In
  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if ((window as any).google) {
        const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const btnElem = document.getElementById('google-signin-btn');
        if (client_id && btnElem) {
          (window as any).google.accounts.id.initialize({
            client_id,
            callback: handleCredentialResponse,
            auto_select: false
          });
          (window as any).google.accounts.id.renderButton(
            btnElem,
            { theme: 'outline', size: 'large', width: 320, text: 'signin_with', shape: 'pill' }
          );
        }
        clearInterval(interval);
      } else if (attempts > 30) {
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="min-h-screen w-full flex bg-slate-950 font-sans text-slate-800 antialiased selection:bg-violet-500 selection:text-white">
      {/* CỘT TRÁI: HERO SHOWCASE CÓ ẢNH THẬT & MÔ HÌNH 3 BÊN */}
      <div className="hidden lg:flex lg:w-7/12 relative overflow-hidden flex-col justify-between p-12 select-none">
        {/* Background Image chất lượng cao */}
        <img
          src="/images/login-hero.jpg"
          alt="VietCraft Printing Studio"
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/90" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[140px] pointer-events-none" />

        {/* Header trên ảnh */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30 border border-white/20">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                VIETCRAFT ECOSYSTEM
              </span>
              <h2 className="text-sm font-bold text-white tracking-wide">Cổng Xưởng Sản Xuất & In Ấn</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] text-emerald-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 -ml-3" />
            <span>Đồng bộ thời gian thực Sàn VietCraft</span>
          </div>
        </div>

        {/* Khung mô hình 3 bên cốt lõi */}
        <div className="relative z-10 max-w-xl space-y-6 my-auto pt-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-violet-500/20 backdrop-blur-md border border-violet-400/30 text-violet-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Mô hình liên kết tam giác khép kín</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
            Kết Nối Trực Tiếp <br />
            <span className="bg-gradient-to-r from-amber-300 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              Designer • Xưởng May • Xưởng POD
            </span>
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
            Hệ thống liên kết 3 mắt xích cốt lõi: Designer sáng tạo mẫu trên sàn, Xưởng May Mặc cung cấp kho phôi thô, và Xưởng POD in ấn sắc nét theo đơn đặt hàng.
          </p>

          {/* 3 Thẻ vai trò cốt lõi */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {/* Vai trò 1: Designer / Seller */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>1. Designer (Seller)</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Sáng tạo mẫu thiết kế & bán hàng trên sàn VietCraft
              </p>
            </div>

            {/* Vai trò 2: Xưởng May Mặc */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-1.5 text-fuchsia-300 text-xs font-bold">
                <Shirt className="w-4 h-4 text-fuchsia-400" />
                <span>2. Xưởng May Mặc</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Sản xuất & cung cấp kho phôi áo thun, hoodie, nón, túi
              </p>
            </div>

            {/* Vai trò 3: Xưởng In POD */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1 hover:bg-white/15 transition-all">
              <div className="flex items-center gap-1.5 text-violet-300 text-xs font-bold">
                <Printer className="w-4 h-4 text-violet-400" />
                <span>3. Xưởng In POD</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Tiếp nhận đơn in ấn, nạp máy DTG & giao thành phẩm
              </p>
            </div>
          </div>
        </div>

        {/* Footer trên ảnh */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-4">
          <span className="font-medium text-slate-300">
            Hệ sinh thái sản xuất in ấn & thời trang theo yêu cầu
          </span>
          <span className="font-mono text-[11px] text-slate-500">VietCraft Platform</span>
        </div>
      </div>

      {/* CỘT PHẢI: FORM ĐĂNG NHẬP / ĐĂNG KÝ (CHỈ 2 VAI TRÒ XƯỞNG) */}
      <div className="w-full lg:w-5/12 flex items-center justify-center p-4 sm:p-8 bg-slate-900/90 relative overflow-y-auto min-h-screen">
        {/* Glow ambient effects */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-fuchsia-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-4 my-auto">
          {/* Brand header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-md shadow-violet-500/25 mb-1">
              <Printer className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {activeTab === 'LOGIN' ? 'Xác Thực Xưởng Đối Tác' : 'Đăng Ký Xưởng Đối Tác'}
            </h2>
            <p className="text-xs text-slate-500">
              {activeTab === 'LOGIN' 
                ? 'Dành cho Xưởng In POD và Xưởng May Mặc phôi' 
                : 'Lựa chọn loại xưởng của bạn để tham gia vào hệ sinh thái'}
            </p>
          </div>

          {/* Thông báo lỗi */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs flex items-center gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Thông báo thành công */}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          {/* 2 Tabs: Đăng nhập | Đăng ký */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setActiveTab('LOGIN'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'LOGIN' 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('REGISTER'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'REGISTER' 
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng ký</span>
            </button>
          </div>

          {/* TAB 1: FORM ĐĂNG NHẬP */}
          {activeTab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1 text-xs">
              <div>
                <label className="text-slate-700 font-bold mb-1 block">Email tài khoản xưởng</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10 font-medium transition-all"
                    placeholder="xuongin@vietcraft.vn"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold block">Mật khẩu</label>
                  <span className="text-[10px] text-violet-600 font-semibold cursor-pointer hover:underline">
                    Quên mật khẩu?
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/10 font-medium transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>Đăng Nhập Xưởng</span>
              </button>
            </form>
          )}

          {/* TAB 2: FORM ĐĂNG KÝ (2 VAI TRÒ XƯỞNG: XƯỞNG IN POD HOẶC XƯỞNG MAY MẶC) */}
          {activeTab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5 pt-1 text-xs">
              <div>
                <label className="text-slate-700 font-bold mb-1 block">Tên xưởng / Đại diện</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
                    placeholder="Xưởng In Ấn Hoàng Gia / Xưởng May Minh Quân"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold mb-1 block">Email liên hệ xưởng</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
                    placeholder="contact@xuongin.vn"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 font-bold mb-1 block">Mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-slate-700 font-bold mb-1 block">Nhập lại</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-violet-600 font-medium"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* LỰA CHỌN 2 VAI TRÒ XƯỞNG */}
              <div>
                <label className="text-slate-700 font-bold mb-1.5 block">Loại hình xưởng đối tác</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('POD_FACTORY')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'POD_FACTORY'
                        ? 'border-violet-500 bg-violet-50/90 text-violet-900 shadow-xs ring-2 ring-violet-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-bold text-xs">
                      <Printer className={`w-4 h-4 ${role === 'POD_FACTORY' ? 'text-violet-600' : 'text-slate-400'}`} />
                      <span>Xưởng In POD</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Nhận đơn từ Designer, in ấn theo yêu cầu & xuất hàng
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('GARMENT_FACTORY')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      role === 'GARMENT_FACTORY'
                        ? 'border-fuchsia-500 bg-fuchsia-50/90 text-fuchsia-900 shadow-xs ring-2 ring-fuchsia-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-bold text-xs">
                      <Shirt className={`w-4 h-4 ${role === 'GARMENT_FACTORY' ? 'text-fuchsia-600' : 'text-slate-400'}`} />
                      <span>Xưởng May Mặc</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      Cung ứng kho phôi áo thun, hoodie... cho Designer
                    </p>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 hover:shadow-violet-600/40 cursor-pointer disabled:opacity-50 mt-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Hoàn Tất Đăng Ký Xưởng</span>
              </button>
            </form>
          )}

          {/* GOOGLE LOGIN CONTAINER */}
          <div className="pt-2 space-y-2">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                Hoặc tiếp tục với
              </span>
            </div>

            <div className="flex justify-center pt-0.5">
              <div id="google-signin-btn" className="min-h-[40px] flex items-center justify-center" />
            </div>
          </div>

          {/* ĐĂNG NHẬP NHANH CHO 2 XƯỞNG (CHỈ HIỂN THỊ Ở DEV) */}
          {!import.meta.env.PROD && (
            <div className="pt-2 border-t border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Đăng nhập nhanh (Test 2 Xưởng)
                </span>
                <span className="text-[9px] text-amber-700 bg-amber-100 font-bold px-1.5 py-0.5 rounded">DEV ONLY</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDevLogin('POD_FACTORY')}
                  className="py-2.5 px-3 text-[11px] font-bold rounded-xl bg-violet-50 hover:bg-violet-100/80 text-violet-800 border border-violet-200 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:border-violet-300"
                >
                  <Printer className="w-4 h-4 text-violet-600" />
                  <span>Xưởng In POD</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDevLogin('GARMENT_FACTORY')}
                  className="py-2.5 px-3 text-[11px] font-bold rounded-xl bg-fuchsia-50 hover:bg-fuchsia-100/80 text-fuchsia-800 border border-fuchsia-200 transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:border-fuchsia-300"
                >
                  <Shirt className="w-4 h-4 text-fuchsia-600" />
                  <span>Xưởng May Mặc</span>
                </button>
              </div>
            </div>
          )}

          {/* DÀNH CHO DESIGNER / SELLER */}
            <a
              href={import.meta.env.VITE_VIETCRAFT_FE_URL ? `${import.meta.env.VITE_VIETCRAFT_FE_URL}/seller` : "http://localhost:3000/seller"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-200/80 transition-all text-center flex items-center justify-between text-xs font-bold shadow-xs block cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600" />
                <span>Bạn là <strong>Designer (Seller)</strong>?</span>
              </div>
              <span className="text-[11px] text-amber-700 flex items-center gap-1 font-semibold">
                Sang Cổng Seller <ExternalLink className="w-3 h-3" />
              </span>
            </a>

          {/* Footer */}
          <div className="pt-1 text-center border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>&copy; 2026 VietCraft Ecosystem</span>
            <span className="text-violet-600 font-bold">Mạng Lưới Sản Xuất POD</span>
          </div>
        </div>
      </div>
    </div>
  );
}

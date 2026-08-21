import { useEffect, useState } from 'react';
import axios from 'axios';
import { Printer, ShieldAlert, Loader2, KeyRound, Mail, LogIn, UserPlus, User } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER' | 'GOOGLE'>('LOGIN');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'OPERATOR'>('OPERATOR');

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
      onLoginSuccess(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if ((window as any).google && activeTab === 'GOOGLE') {
        const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (client_id && document.getElementById('google-signin-btn')) {
          (window as any).google.accounts.id.initialize({ client_id, callback: handleCredentialResponse, auto_select: false });
          (window as any).google.accounts.id.renderButton(
            document.getElementById('google-signin-btn'),
            { theme: 'filled_blue', size: 'large', width: 340, text: 'signin_with', shape: 'pill' }
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#06030f] p-4 font-sans relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-900/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-fuchsia-900/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0f0a28]/90 border border-[#241a58] rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Header title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/30 mb-2">
            <Printer className="w-7 h-7 text-white" />
          </div>
          <span className="block text-[11px] font-extrabold uppercase tracking-widest text-violet-400">
            VietCraft Print Portal
          </span>
          <h1 className="text-2xl font-black text-white">Xác Thực Tài Khoản</h1>
          <p className="text-xs text-slate-400">Quản lý hệ thống xưởng in ấn chuyên nghiệp</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl p-3.5 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {successMsg && (
          <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl p-3.5 text-xs flex items-center gap-2">
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tabs: Đăng nhập | Đăng ký | Google */}
        <div className="grid grid-cols-3 gap-1 bg-[#160f3c] border border-[#2c206d] rounded-xl p-1 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('LOGIN'); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'LOGIN' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => { setActiveTab('REGISTER'); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'REGISTER' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Đăng ký
          </button>
          <button
            onClick={() => { setActiveTab('GOOGLE'); setError(null); }}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'GOOGLE' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Google
          </button>
        </div>

        {/* TAB 1: ĐĂNG NHẬP */}
        {activeTab === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1 text-xs">
            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#171042] border border-[#2d2273] rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  placeholder="Nhập địa chỉ email..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Mật khẩu</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#171042] border border-[#2d2273] rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  placeholder="Nhập mật khẩu..."
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              Đăng Nhập
            </button>
          </form>
        )}

        {/* TAB 2: ĐĂNG KÝ */}
        {activeTab === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-1 text-xs">
            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Họ và tên</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#171042] border border-[#2d2273] rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  placeholder="Nhập họ và tên..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Email đăng ký</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#171042] border border-[#2d2273] rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Mật khẩu</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#171042] border border-[#2d2273] rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  placeholder="Nhập mật khẩu mới..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Nhập lại mật khẩu</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#171042] border border-[#2d2273] rounded-xl pl-10 pr-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                  placeholder="Xác nhận lại mật khẩu..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Vai trò trong hệ thống</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full bg-[#171042] border border-[#2d2273] rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-violet-500"
              >
                <option value="OPERATOR">OPERATOR - Nhân viên in ấn & đóng gói</option>
                <option value="ADMIN">ADMIN - Quản trị viên xưởng in</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Đăng Ký Tài Khoản
            </button>
          </form>
        )}

        {/* TAB 3: ĐĂNG NHẬP BẰNG GOOGLE */}
        {activeTab === 'GOOGLE' && (
          <div className="py-6 text-center space-y-4">
            <p className="text-xs text-slate-400">Đăng nhập thông qua tài khoản Google Workspace tổ chức</p>
            {loading ? (
              <div className="h-[44px] bg-blue-700/20 border border-blue-600/30 rounded-full flex items-center justify-center gap-2 text-xs text-blue-300">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang xác thực với Google...
              </div>
            ) : (
              <div className="flex justify-center">
                <div id="google-signin-btn" />
              </div>
            )}
          </div>
        )}

        <div className="pt-2 text-center border-t border-[#1d154d]">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            VietCraft Partner Ecosystem &copy; 2026
          </span>
        </div>
      </div>
    </div>
  );
}

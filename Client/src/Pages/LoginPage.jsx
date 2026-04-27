import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { LogIn, AlertCircle, Heart } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/portal');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-600 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full border border-white/30" />
          <div className="absolute bottom-[-30%] right-[-15%] w-[700px] h-[700px] rounded-full border border-white/20" />
          <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full border border-white/20" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Heart size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl text-white">Zealthy</span>
          </div>
        </div>
        <div className="relative">
          <h1 className="font-display text-5xl text-white leading-tight mb-4">
            Your health,<br />your way.
          </h1>
          <p className="text-brand-200 text-lg max-w-md">
            Access your appointments, prescriptions, and care plan — all in one place.
          </p>
        </div>
        <div className="relative text-brand-300 text-sm">
          © 2026 Zealthy Health
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Heart size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl text-surface-900">Zealthy</span>
          </div>

          <h2 className="font-display text-3xl text-surface-900 mb-1">Welcome back</h2>
          <p className="text-surface-400 text-sm mb-8">Sign in to your patient portal</p>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 mb-6 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
              {!loading && <LogIn size={16} />}
            </button>
          </form>

          <p className="text-center text-xs text-surface-400 mt-8">
            Demo credentials: <span className="font-medium text-surface-500">mark@some-email-provider.net</span> / <span className="font-medium text-surface-500">Password123!</span>
          </p>
        </div>
      </div>
    </div>
  );
}

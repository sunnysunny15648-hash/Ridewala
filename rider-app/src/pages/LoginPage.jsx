import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back, Captain! 🏍️');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="app-container flex flex-col min-h-screen">
      <div style={{background: 'linear-gradient(135deg, #111111 0%, #333333 100%)'}} className="pt-16 pb-12 px-6 text-center relative">
        <div className="absolute -bottom-6 left-0 right-0 h-12 bg-white rounded-t-[2.5rem]"></div>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl" style={{background: '#FFC928'}} />
        </div>
        <h1 style={{color: '#FFC928'}} className="text-3xl font-extrabold tracking-tight">
          RIDE<span className="text-white">WALA</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1 flex items-center justify-center gap-2">
          <Shield size={14} className="text-primary" style={{color:'#FFC928'}} />
          Captain Portal
        </p>
      </div>

      <div className="flex-1 px-6 pt-8 pb-6">
        <h2 className="text-2xl font-bold mb-1" style={{color:'#111111'}}>Sign In</h2>
        <p className="text-gray-500 text-sm mb-6">Log in to your captain account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="captain@example.com" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Your password" className="input-field" style={{paddingRight: '3rem'}} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{position:'absolute', right:'1rem', top:'50%', transform:'translateY(-50%)', color:'#9CA3AF'}}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full" style={{width:'100%'}}>
            {loading ? <Loader2 size={20} style={{animation: 'spin 1s linear infinite', marginRight: '0.5rem'}} /> : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New captain?{' '}
          <Link to="/register" style={{color:'#FFC928'}} className="font-semibold">Register Here</Link>
        </p>
      </div>
    </div>
  );
}


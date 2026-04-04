import React, { useState } from 'react';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AdminLoginView = () => {
  const { handleAdminLogin } = useApp();
  const [localPassword, setLocalPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    handleAdminLogin(localPassword);
    setLocalPassword('');
  };

  return (
    <div className="min-h-screen arena-bg flex items-center justify-center px-4">
      <div className="rounded-2xl border border-[--border] p-8 max-w-sm w-full animate-scaleIn" style={{ background: 'var(--bg-surface)' }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-input))' }}>
            <Shield className="w-8 h-8 text-[--gold]" />
          </div>
          <h2 className="font-bebas text-3xl tracking-wide text-white">Admin Access</h2>
          <p className="text-sm text-[--text-muted] mt-1">Enter your password to continue</p>
        </div>
        <div className="relative mb-4">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={localPassword}
            onChange={(e) => setLocalPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 rounded-xl text-white border border-[--border] pr-10 transition-all"
            style={{ background: 'var(--bg-input)' }}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[--text-muted] hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={handleLogin}
          className="btn-gold w-full py-3 rounded-xl font-bold text-sm"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default AdminLoginView;

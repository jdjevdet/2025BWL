import React, { useState, useEffect } from 'react';
import { Lock, X } from 'lucide-react';

const Modal = ({ isOpen, onClose, message, type = 'success', autoCloseSeconds = null }) => {
  const [countdown, setCountdown] = useState(autoCloseSeconds);

  useEffect(() => {
    if (!isOpen || !autoCloseSeconds) { setCountdown(autoCloseSeconds); return; }
    setCountdown(autoCloseSeconds);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); onClose(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, autoCloseSeconds, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className={`relative rounded-2xl p-8 shadow-2xl text-center max-w-sm w-full mx-4 animate-scaleIn border ${isSuccess ? 'border-emerald-500/30' : 'border-red-500/30'}`} style={{ background: 'var(--bg-surface)' }} onClick={e => e.stopPropagation()}>
        {/* Glow */}
        <div className={`absolute -inset-px rounded-2xl opacity-20 blur-xl ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <div className="relative">
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${isSuccess ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            {isSuccess
              ? <Lock className="w-10 h-10 text-emerald-400" />
              : <X className="w-10 h-10 text-red-400" />
            }
          </div>
          <p className="text-lg font-semibold text-white mb-6 leading-relaxed">{message}</p>
          {autoCloseSeconds && countdown > 0 && (
            <p className="text-[--text-muted] text-sm mb-4">Redirecting in {countdown}s...</p>
          )}
          <button
            onClick={onClose}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${isSuccess ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
          >
            {autoCloseSeconds ? 'Go Home Now' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

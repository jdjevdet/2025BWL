import React from 'react';
import { Calendar, TrendingUp, Crown, Lock, Unlock, X, Menu, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { currentView, setCurrentView, isAdmin, isMenuOpen, setIsMenuOpen } = useApp();

  const navItems = [
    { key: 'home', label: 'Events', icon: Calendar },
    { key: 'standings', label: 'Standings', icon: TrendingUp },
    { key: 'halloffame', label: 'Hall of Fame', icon: Crown },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(7, 7, 11, 0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))' }}>
              <Zap className="w-4 h-4 text-[--bg-deep]" />
            </div>
            <span className="font-bebas text-2xl tracking-wider">
              <span className="text-white">BWL</span>
              <span className="text-[--gold] ml-1">FANTASY</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.key || (item.key === 'home' && ['home', 'event-standings', 'event-predictions', 'make-picks', 'live-results'].includes(currentView));
              return (
                <button
                  key={item.key}
                  onClick={() => setCurrentView(item.key)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive ? 'text-[--gold]' : 'text-[--text-secondary] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ background: 'var(--gold)' }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Admin + mobile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => isAdmin ? setCurrentView('admin') : setCurrentView('login')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isAdmin
                  ? 'btn-gold'
                  : 'border border-[--border-light] text-[--text-secondary] hover:text-white hover:border-[--gold-dark]'
              }`}
            >
              {isAdmin ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Admin</span>
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[--text-secondary] hover:text-white hover:bg-white/5 transition-all"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[--border] animate-fadeIn" style={{ background: 'var(--bg-surface)' }}>
          <div className="px-4 py-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { setCurrentView(item.key); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'text-[--gold] bg-[--gold]/5' : 'text-[--text-secondary] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { Target, ClipboardCheck, ThumbsUp, CalendarCheck, Flame, ShieldCheck, Users, Fingerprint, Gem, TrendingUp, Swords, Medal, Eye, Castle, ShieldOff, Crown, Trophy, X, ArrowDownUp, Handshake, Scale, Baby, Timer, Crosshair, Zap, Moon, AlertTriangle, Sparkles, Search, Skull, Star, Brain, Infinity, Flag, Award, Bookmark, Briefcase, Sun, Snowflake, CircleX, Copy, Frown, CloudLightning, Heart, Bomb, RotateCcw, HeartCrack, Laugh, Hash, Tv, Mountain, Lock, Package, Shield } from 'lucide-react';
import { RARITY_CONFIG } from '../utils/badges';

const ICON_MAP = {
  Target, ClipboardCheck, ThumbsUp, CalendarCheck, Flame, ShieldCheck, Users, Fingerprint,
  Gem, TrendingUp, Swords, Medal, Eye, Castle, ShieldOff, Crown, Trophy,
  ArrowDownUp, Handshake, Scale, Baby, Timer, Crosshair, Zap, Moon, AlertTriangle,
  Sparkles, Search, Skull, Star, Brain, Infinity, Flag, Award, Bookmark, Briefcase, Sun, Snowflake,
  CircleX, Copy, Frown, CloudLightning, Heart, Bomb, RotateCcw, HeartCrack, Laugh, Hash, Tv, Mountain, Lock, Package, Shield,
};

const BadgeModal = ({ badge, isOpen, onClose }) => {
  if (!isOpen || !badge) return null;
  const rarity = RARITY_CONFIG[badge.rarity];
  const Icon = ICON_MAP[badge.icon] || Target;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn px-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        className="relative rounded-2xl max-w-sm w-full animate-scaleIn overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient glow behind card */}
        <div
          className="absolute -inset-4 rounded-3xl opacity-30 blur-3xl"
          style={{
            background: badge.rarity === 'secret-rare'
              ? 'conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #8b5cf6, #ec4899, #ef4444)'
              : rarity.color,
          }}
        />

        {/* Card */}
        <div
          className={`relative rounded-2xl border-2 overflow-hidden`}
          style={{
            background: rarity.bg,
            borderColor: badge.rarity === 'secret-rare' ? 'transparent' : rarity.border,
          }}
        >
          {/* Holographic border for secret rare */}
          {badge.rarity === 'secret-rare' && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(234,179,8,0.06), rgba(34,197,94,0.06), rgba(6,182,212,0.06), rgba(139,92,246,0.06), rgba(236,72,153,0.06))',
                backgroundSize: '400% 400%',
                animation: 'holoShift 6s ease-in-out infinite',
              }}
            />
          )}

          {/* Top shimmer bar */}
          <div
            className="h-1"
            style={{
              background: badge.rarity === 'secret-rare'
                ? 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #8b5cf6, #ec4899, #ef4444)'
                : `linear-gradient(90deg, transparent, ${rarity.color}, transparent)`,
              backgroundSize: badge.rarity === 'secret-rare' ? '400% 100%' : '200% 100%',
              animation: badge.rarity === 'secret-rare' ? 'holoShift 4s ease-in-out infinite' : 'shimmer 3s linear infinite',
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-[--text-muted] hover:text-white hover:bg-white/5 transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Rarity label */}
            <div className="mb-6">
              {badge.rarity === 'secret-rare' ? (
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border-0"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #8b5cf6, #ec4899)',
                    backgroundSize: '400% 400%',
                    animation: 'holoShift 4s ease-in-out infinite',
                    color: '#fff',
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {rarity.label}
                </span>
              ) : (
                <span
                  className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border"
                  style={{
                    color: rarity.color,
                    borderColor: `${rarity.color}40`,
                    background: `${rarity.color}10`,
                  }}
                >
                  {rarity.label}
                </span>
              )}
            </div>

            {/* Icon */}
            <div className="relative inline-block mb-6">
              {/* Outer glow ring */}
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-40"
                style={{ background: rarity.color, transform: 'scale(1.5)' }}
              />
              <div
                className={`relative badge-icon-ring badge-icon-ring-${badge.rarity} w-24 h-24 flex items-center justify-center`}
                style={{
                  boxShadow: badge.rarity === 'secret-rare'
                    ? '0 0 30px rgba(232,121,249,0.5), 0 0 60px rgba(56,189,248,0.3), 0 0 90px rgba(251,191,36,0.2), inset 0 2px 8px rgba(255,255,255,0.15)'
                    : `0 0 30px ${rarity.glow}, 0 0 60px ${rarity.glow}, inset 0 2px 8px rgba(255,255,255,0.1)`,
                }}
              >
                <Icon className="w-11 h-11" style={{ color: badge.rarity === 'secret-rare' ? '#fff' : rarity.color }} />
              </div>
              {(badge.rarity === 'legendary' || badge.rarity === 'epic' || badge.rarity === 'secret-rare') && (
                <div className={`badge-sparkles ${badge.rarity === 'secret-rare' ? 'badge-secret-rare' : ''}`} style={{ inset: '-16px' }}>
                  <span /><span /><span /><span /><span /><span />
                </div>
              )}
            </div>

            {/* Name */}
            <h3 className="font-bebas text-4xl tracking-wide text-white mb-2">{badge.name}</h3>

            {/* Description */}
            <p className="text-[--text-secondary] text-sm leading-relaxed mb-4 max-w-xs mx-auto">
              {badge.description}
            </p>

            {/* Divider */}
            <div
              className="w-16 h-px mx-auto mb-4"
              style={{ background: `linear-gradient(90deg, transparent, ${rarity.color}60, transparent)` }}
            />

            {/* Flavor text */}
            <p
              className="text-xs italic leading-relaxed max-w-xs mx-auto"
              style={{ color: `${rarity.color}aa` }}
            >
              {badge.flavor}
            </p>
          </div>

          {/* Bottom accent */}
          <div
            className="h-0.5 opacity-40"
            style={{
              background: badge.rarity === 'secret-rare'
                ? 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #8b5cf6, #ec4899)'
                : `linear-gradient(90deg, transparent, ${rarity.color}, transparent)`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BadgeModal;

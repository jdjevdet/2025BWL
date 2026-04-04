import React from 'react';
import { Target, ClipboardCheck, ThumbsUp, CalendarCheck, Flame, ShieldCheck, Users, Fingerprint, Gem, TrendingUp, Swords, Medal, Eye, Castle, ShieldOff, Crown, Trophy, X } from 'lucide-react';
import { RARITY_CONFIG } from '../utils/badges';

const ICON_MAP = {
  Target, ClipboardCheck, ThumbsUp, CalendarCheck, Flame, ShieldCheck, Users, Fingerprint,
  Gem, TrendingUp, Swords, Medal, Eye, Castle, ShieldOff, Crown, Trophy,
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
          style={{ background: rarity.color }}
        />

        {/* Card */}
        <div
          className={`relative rounded-2xl border-2 overflow-hidden`}
          style={{ background: rarity.bg, borderColor: rarity.border }}
        >
          {/* Top shimmer bar */}
          <div
            className="h-1"
            style={{
              background: `linear-gradient(90deg, transparent, ${rarity.color}, transparent)`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 3s linear infinite',
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
                  boxShadow: `0 0 30px ${rarity.glow}, 0 0 60px ${rarity.glow}, inset 0 2px 8px rgba(255,255,255,0.1)`,
                }}
              >
                <Icon className="w-11 h-11" style={{ color: rarity.color }} />
              </div>
              {(badge.rarity === 'legendary' || badge.rarity === 'epic') && (
                <div className="badge-sparkles" style={{ inset: '-16px' }}>
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
            style={{ background: `linear-gradient(90deg, transparent, ${rarity.color}, transparent)` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BadgeModal;

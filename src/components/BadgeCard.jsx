import React from 'react';
import { Target, ClipboardCheck, ThumbsUp, CalendarCheck, Flame, ShieldCheck, Users, Fingerprint, Gem, TrendingUp, Swords, Medal, Eye, Castle, ShieldOff, Crown, Trophy, ArrowDownUp, Handshake, Scale, Baby, Timer, Crosshair, Zap, Moon, AlertTriangle, Sparkles, Search, Skull, Star, Brain, Infinity, Flag, Award, Bookmark, Briefcase, Sun, Snowflake, CircleX, Copy, Frown, CloudLightning, Heart, Bomb, RotateCcw, HeartCrack, Laugh, Hash, Tv, Mountain, Lock, Package, Shield } from 'lucide-react';
import { RARITY_CONFIG } from '../utils/badges';

const ICON_MAP = {
  Target, ClipboardCheck, ThumbsUp, CalendarCheck, Flame, ShieldCheck, Users, Fingerprint,
  Gem, TrendingUp, Swords, Medal, Eye, Castle, ShieldOff, Crown, Trophy,
  ArrowDownUp, Handshake, Scale, Baby, Timer, Crosshair, Zap, Moon, AlertTriangle,
  Sparkles, Search, Skull, Star, Brain, Infinity, Flag, Award, Bookmark, Briefcase, Sun, Snowflake,
  CircleX, Copy, Frown, CloudLightning, Heart, Bomb, RotateCcw, HeartCrack, Laugh, Hash, Tv, Mountain, Lock, Package, Shield,
};

const BadgeCard = ({ badge, size = 'md', onClick }) => {
  if (!badge) return null;
  const rarity = RARITY_CONFIG[badge.rarity];
  const Icon = ICON_MAP[badge.icon] || Target;

  const sizes = {
    sm: { card: 'w-16 h-16', ring: 'w-10 h-10', icon: 'w-4 h-4', text: false },
    md: { card: 'w-full', ring: 'w-14 h-14', icon: 'w-6 h-6', text: true },
    lg: { card: 'w-full', ring: 'w-20 h-20', icon: 'w-9 h-9', text: true },
  };
  const s = sizes[size] || sizes.md;

  // Small inline badge (for standings, leaderboards)
  if (size === 'sm') {
    return (
      <button
        onClick={onClick}
        className={`badge-card badge-${badge.rarity} ${s.card} rounded-xl flex items-center justify-center flex-shrink-0 relative`}
        style={{ background: rarity.bg }}
        title={badge.name}
      >
        <div className={`badge-icon-ring badge-icon-ring-${badge.rarity} ${s.ring} flex items-center justify-center`}>
          <Icon className={s.icon} style={{ color: rarity.color }} />
        </div>
        {badge.rarity === 'legendary' && (
          <div className="badge-sparkles">
            <span /><span /><span /><span /><span /><span />
          </div>
        )}
      </button>
    );
  }

  // Medium / Large showcase badge
  return (
    <button
      onClick={onClick}
      className={`badge-card badge-${badge.rarity} ${s.card} p-5 flex flex-col items-center gap-3 text-center relative`}
      style={{ background: rarity.bg }}
    >
      <div className="relative">
        <div className={`badge-icon-ring badge-icon-ring-${badge.rarity} ${s.ring} flex items-center justify-center`}>
          <Icon className={s.icon} style={{ color: rarity.color }} />
        </div>
        {(badge.rarity === 'legendary' || badge.rarity === 'epic') && (
          <div className="badge-sparkles">
            <span /><span /><span /><span /><span /><span />
          </div>
        )}
      </div>
      {s.text && (
        <>
          <div>
            <p className="font-bebas text-lg tracking-wide text-white leading-tight">{badge.name}</p>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.15em] mt-0.5"
              style={{ color: rarity.color }}
            >
              {rarity.label}
            </p>
          </div>
          {size === 'lg' && (
            <p className="text-xs text-[--text-secondary] leading-relaxed">{badge.description}</p>
          )}
        </>
      )}
    </button>
  );
};

export default BadgeCard;

import React from 'react';

const PlayerAvatar = ({ player, size = 'sm' }) => {
  const sizes = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };
  const sizeClass = sizes[size] || sizes.sm;

  if (player?.avatarUrl) {
    return (
      <img
        src={player.avatarUrl}
        alt={player.name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0 border border-[--border]`}
      />
    );
  }

  const colors = ['#c9a84c', '#6366f1', '#ef233c', '#10b981', '#eab308', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899', '#14b8a6'];
  const colorIndex = (player?.name || '').charCodeAt(0) % colors.length;

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center flex-shrink-0 font-bold font-outfit`}
      style={{ background: colors[colorIndex], color: '#0a0a0a' }}
    >
      {(player?.name || '?')[0].toUpperCase()}
    </div>
  );
};

export default PlayerAvatar;

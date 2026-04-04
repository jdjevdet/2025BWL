import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const getCountdownText = (deadline) => {
  if (!deadline) return null;
  const diff = new Date(deadline) - Date.now();
  if (diff <= 0) return { text: 'Picks Locked', urgent: true, expired: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const urgent = diff < 3600000;
  if (days > 0) return { text: `${days}d ${hours}h ${mins}m`, urgent, expired: false };
  if (hours > 0) return { text: `${hours}h ${mins}m`, urgent, expired: false };
  return { text: `${mins}m ${secs}s`, urgent, expired: false };
};

const CountdownBadge = ({ deadline, variant = 'inline' }) => {
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const cd = getCountdownText(deadline);
  if (!cd) return null;

  if (variant === 'bar') {
    return (
      <div className={`mb-4 px-4 py-3 rounded-xl border text-center text-sm font-semibold animate-fadeInUp ${
        cd.urgent ? 'border-red-500/40 text-red-400' : 'border-[--gold-dark]/40 text-[--gold]'
      } ${cd.urgent && !cd.expired ? 'glow-pulse' : ''}`}
        style={{ background: cd.urgent ? 'rgba(239,35,60,0.06)' : 'rgba(201,168,76,0.06)' }}>
        <Clock className="w-4 h-4 inline mr-2" />
        {cd.expired ? 'Deadline passed \u2014 picks are locked' : `Picks lock in ${cd.text}`}
      </div>
    );
  }

  return (
    <p className={`text-xs font-semibold flex items-center gap-1.5 ${cd.urgent ? 'text-red-400' : 'text-[--gold]'}`}>
      <Clock className="w-3 h-3" />
      {cd.expired ? 'Picks Locked' : `Picks lock in ${cd.text}`}
    </p>
  );
};

export default CountdownBadge;

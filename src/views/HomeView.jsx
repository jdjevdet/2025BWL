import React, { useRef, useEffect } from 'react';
import { Trophy, Calendar, Target, Users, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import CountdownBadge from '../components/CountdownBadge';

/* ── WrestleMania Canvas Pyro ── */
const PYRO_COLORS = [
  [255, 245, 192], // bright gold-white
  [228, 204, 122], // gold
  [212, 175, 55],  // deep gold
  [251, 191, 36],  // amber
  [245, 158, 11],  // orange-gold
  [255, 255, 255], // white hot
  [254, 243, 199], // cream
  [253, 230, 138], // light gold
  [239, 68, 68],   // red (for variety)
  [249, 115, 22],  // orange
];

function launchPyro(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const particles = [];
  const GRAVITY = 0.12;
  const DURATION = 15000; // 15 seconds
  const startTime = performance.now();

  // Particle factory
  function emit(x, y, vx, vy, size, color, life, type = 'spark') {
    particles.push({ x, y, vx, vy, size, color, life, maxLife: life, type, trail: [] });
  }

  // Helper: spawn a row of pyro columns across the top
  function spawnColumns(count, intensity) {
    for (let c = 0; c < count; c++) {
      const cx = (W / (count + 1)) * (c + 1);
      const n = Math.floor(15 + intensity * 15);
      for (let i = 0; i < n; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        const speed = (3 + Math.random() * 5) * intensity;
        const color = PYRO_COLORS[Math.floor(Math.random() * PYRO_COLORS.length)];
        emit(cx, H * 0.02, Math.cos(angle) * speed, Math.sin(angle) * speed,
          2 + Math.random() * 3, color, 60 + Math.random() * 50, 'spark');
      }
    }
  }

  // Helper: spawn corner mortar bursts
  function spawnCornerMortars(intensity) {
    for (const cx of [W * 0.05, W * 0.95]) {
      const n = Math.floor(20 + intensity * 20);
      for (let i = 0; i < n; i++) {
        const angle = -Math.PI / 2 + (cx < W / 2 ? 0.3 : -0.3) + (Math.random() - 0.5) * 0.8;
        const speed = (4 + Math.random() * 5) * intensity;
        const color = PYRO_COLORS[Math.floor(Math.random() * 8)];
        emit(cx, H * 0.3, Math.cos(angle) * speed, Math.sin(angle) * speed,
          2.5 + Math.random() * 3, color, 50 + Math.random() * 40, 'spark');
      }
    }
  }

  // Helper: golden shower rain from top
  function spawnShower(count) {
    for (let i = 0; i < count; i++) {
      const x = Math.random() * W;
      const color = PYRO_COLORS[Math.floor(Math.random() * 8)];
      emit(x, -5, (Math.random() - 0.5) * 2, 1.5 + Math.random() * 3,
        1.5 + Math.random() * 2.5, color, 70 + Math.random() * 50, 'shower');
    }
  }

  // Helper: side fountain bursts
  function spawnSideFountains(intensity) {
    for (const cx of [0, W]) {
      const dir = cx === 0 ? 1 : -1;
      const n = Math.floor(20 + intensity * 25);
      for (let i = 0; i < n; i++) {
        const angle = -Math.PI / 2 + dir * (0.2 + Math.random() * 0.6);
        const speed = (3 + Math.random() * 4) * intensity;
        const color = PYRO_COLORS[Math.floor(Math.random() * PYRO_COLORS.length)];
        emit(cx, H * 0.1 + Math.random() * H * 0.3,
          Math.cos(angle) * speed, Math.sin(angle) * speed,
          2 + Math.random() * 2.5, color, 50 + Math.random() * 40, 'spark');
      }
    }
  }

  // Helper: center starburst explosion
  function spawnStarburst(cx, cy, count, power) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 2 + Math.random() * power;
      const color = PYRO_COLORS[Math.floor(Math.random() * PYRO_COLORS.length)];
      emit(cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed,
        2 + Math.random() * 3.5, color, 55 + Math.random() * 45, 'spark');
    }
  }

  // ── WAVE SCHEDULE (15 seconds of pyro) ──
  // Each entry: [triggerMs, spawnFunction]
  const waves = [
    // 0s — Opening blast: big columns + corner mortars
    [0, () => { spawnColumns(8, 1.2); spawnCornerMortars(1.2); }],
    // 0.6s — Golden rain
    [600, () => spawnShower(120)],
    // 1.2s — Side fountains
    [1200, () => spawnSideFountains(1.0)],
    // 2.5s — Second column burst
    [2500, () => spawnColumns(6, 1.0)],
    // 3.5s — Starburst from center
    [3500, () => spawnStarburst(W / 2, H * 0.35, 50, 6)],
    // 4.5s — Heavy golden shower
    [4500, () => spawnShower(150)],
    // 5.5s — Corner mortars + side fountains
    [5500, () => { spawnCornerMortars(1.1); spawnSideFountains(0.9); }],
    // 6.8s — Twin starbursts
    [6800, () => { spawnStarburst(W * 0.25, H * 0.3, 35, 5); spawnStarburst(W * 0.75, H * 0.3, 35, 5); }],
    // 8.0s — Big columns
    [8000, () => spawnColumns(10, 1.0)],
    // 9.0s — Shower + side fountains
    [9000, () => { spawnShower(100); spawnSideFountains(0.8); }],
    // 10.5s — Triple starburst
    [10500, () => { spawnStarburst(W * 0.2, H * 0.25, 30, 5); spawnStarburst(W / 2, H * 0.4, 40, 6); spawnStarburst(W * 0.8, H * 0.25, 30, 5); }],
    // 11.5s — Corner mortars
    [11500, () => spawnCornerMortars(1.3)],
    // 12.5s — Grand finale ramp-up: columns + shower
    [12500, () => { spawnColumns(10, 1.3); spawnShower(130); }],
    // 13.5s — Finale: everything at once
    [13500, () => { spawnColumns(12, 1.5); spawnCornerMortars(1.5); spawnSideFountains(1.3); spawnStarburst(W / 2, H * 0.3, 60, 7); spawnShower(160); }],
  ];

  let nextWave = 0;

  // Fire wave 0 immediately
  waves[0][1]();
  nextWave = 1;

  function draw(now) {
    const elapsed = now - startTime;
    if (elapsed > DURATION && particles.length === 0) {
      ctx.clearRect(0, 0, W, H);
      return; // done
    }

    // Spawn waves as their time arrives
    while (nextWave < waves.length && elapsed >= waves[nextWave][0]) {
      waves[nextWave][1]();
      nextWave++;
    }

    ctx.clearRect(0, 0, W, H);

    // Flash bang on frame 1-10
    if (elapsed < 300) {
      const flashAlpha = Math.max(0, 0.6 * (1 - elapsed / 300));
      const grad = ctx.createRadialGradient(W / 2, H * 0.2, 0, W / 2, H * 0.2, W * 0.8);
      grad.addColorStop(0, `rgba(255, 245, 192, ${flashAlpha})`);
      grad.addColorStop(0.4, `rgba(212, 175, 55, ${flashAlpha * 0.5})`);
      grad.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life--;

      // Store trail positions
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 6) p.trail.shift();

      // Physics
      p.vy += GRAVITY;
      p.x += p.vx;
      p.y += p.vy;

      // Drag
      p.vx *= 0.985;
      p.vy *= 0.985;

      if (p.life <= 0) { particles.splice(i, 1); continue; }

      const alpha = Math.min(1, p.life / (p.maxLife * 0.3));
      const [r, g, b] = p.color;

      // Draw trail
      if (p.trail.length > 1) {
        for (let t = 0; t < p.trail.length - 1; t++) {
          const trailAlpha = alpha * (t / p.trail.length) * 0.4;
          const trailSize = p.size * (t / p.trail.length) * 0.6;
          ctx.beginPath();
          ctx.arc(p.trail[t].x, p.trail[t].y, trailSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${trailAlpha})`;
          ctx.fill();
        }
      }

      // Draw glow
      const glowSize = p.size * 3;
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.6})`);
      glow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.15})`);
      glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(p.x - glowSize, p.y - glowSize, glowSize * 2, glowSize * 2);

      // Draw core
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();

      // White-hot center for bigger sparks
      if (p.size > 3) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.fill();
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

const WrestleManiaPyro = () => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const hasFired = useRef(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    // Size canvas to the expanded pyro area (extends beyond tile)
    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      canvas.width = rect.width * 2;   // 2x for retina sharpness
      canvas.height = rect.height * 2;
    };
    resize();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasFired.current) {
          hasFired.current = true;
          resize();
          launchPyro(canvas);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="wm-pyro-container">
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      />
    </div>
  );
};

const HomeView = () => {
  const { sortedEvents, setSelectedEvent, setCurrentView, selectedSeason, setSelectedSeason } = useApp();

  return (
    <div className="min-h-screen arena-bg pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-16 animate-fadeInUp">
          <h1 className="font-bebas text-6xl sm:text-8xl lg:text-9xl tracking-tight leading-none mb-4">
            <span className="text-white">BELLEND</span>
            <br />
            <span className="gold-shimmer">WRESTLING LEAGUE</span>
          </h1>
          <p className="font-outfit text-lg text-[--text-secondary] max-w-md mx-auto">
            Fantasy Picks &mdash; Make your predictions and prove you know wrestling better than everyone else.
          </p>
          <div className="rope-divider max-w-xs mx-auto mt-8" />

          {/* Season selector */}
          <div className="flex items-center justify-center gap-3 mt-8">
            {['2025/2026', '2026/2027'].map(season => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${
                  selectedSeason === season
                    ? 'btn-gold'
                    : 'border border-[--border-light] text-[--text-secondary] hover:text-white hover:border-[--gold-dark]'
                }`}
                style={selectedSeason !== season ? { background: 'var(--bg-elevated)' } : undefined}
              >
                Season {season}
              </button>
            ))}
          </div>
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedEvents.map((event, idx) => {
            const statusConfig = {
              completed: { dot: 'status-dot-completed', label: 'Completed', color: 'text-emerald-400' },
              live: { dot: 'status-dot-live', label: 'Live Now', color: 'text-red-400' },
              open: { dot: 'status-dot-open', label: 'Open', color: 'text-amber-400' },
              upcoming: { dot: 'status-dot-upcoming', label: 'Upcoming', color: 'text-slate-400' },
            };
            const sc = statusConfig[event.status] || statusConfig.upcoming;
            const isWrestleMania = event.name && event.name.toUpperCase().includes('WRESTLEMANIA');

            return (
              <div
                key={event.id}
                className={`group rounded-xl overflow-hidden border border-[--border] gold-border-glow hover-lift card-gold-accent animate-fadeInUp flex flex-col${isWrestleMania ? ' wrestlemania-tile' : ''}`}
                style={{ background: 'var(--bg-surface)', animationDelay: `${idx * 80}ms` }}
              >
                {isWrestleMania && <WrestleManiaPyro />}
                {/* Image */}
                <div className="relative h-48 overflow-hidden spotlight-overlay" style={{ background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-deep))' }}>
                  {event.bannerImage ? (
                    <img
                      src={event.bannerImage} alt={event.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="font-bebas text-4xl text-white/80 tracking-wider text-center px-4">{event.name}</h3>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[--bg-surface] via-transparent to-transparent opacity-80" />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider glass-card">
                      <span className={`status-dot ${sc.dot}`} />
                      <span className={sc.color}>{sc.label}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bebas text-2xl tracking-wide text-white mb-1">{event.name}</h3>
                  <p className="text-sm text-[--text-muted] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {event.date}
                  </p>
                  {event.status === 'open' && event.deadline ? (
                    <div className="mt-1.5 mb-4"><CountdownBadge deadline={event.deadline} /></div>
                  ) : <div className="mb-5" />}

                  <div className="space-y-2 mt-auto">
                    {event.status === 'live' && (
                      <button
                        onClick={() => { setSelectedEvent(event); setCurrentView('live-results'); }}
                        className="btn-gold w-full py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Activity className="w-4 h-4" />
                        Live Results Tracker
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedEvent(event); setCurrentView('event-standings'); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border border-[--border-light] text-[--text-secondary] hover:text-white hover:border-[--gold-dark] transition-all duration-300"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      <Trophy className="w-4 h-4" />
                      View Standings
                    </button>
                    {(event.status === 'live' || event.status === 'completed') && (
                      <button
                        onClick={() => { setSelectedEvent(event); setCurrentView('event-predictions'); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-all duration-300"
                      >
                        <Users className="w-4 h-4" />
                        View Predictions
                      </button>
                    )}
                    {event.status === 'open' && (
                      <button
                        onClick={() => { setSelectedEvent(event); setCurrentView('make-picks'); }}
                        className="btn-gold w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                      >
                        <Target className="w-4 h-4" />
                        Make Picks
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sortedEvents.length === 0 && (
          <div className="text-center py-20 animate-fadeIn">
            <Calendar className="w-16 h-16 text-[--text-muted] mx-auto mb-4" />
            <p className="text-[--text-secondary] text-lg">No events yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeView;

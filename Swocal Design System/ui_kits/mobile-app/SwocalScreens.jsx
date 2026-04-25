// SwocalScreens.jsx — Onboarding, Swipe, Match, Coupon, Tabs, ContextBar

// ─── ContextBar ──────────────────────────────────────────────
function ContextBar({ weather = '☁️', temp = 11, period = 'Lunch', day = 'Tue', city = 'Stuttgart' }) {
  return (
    <div style={{
      position: 'absolute', top: 50, left: 16, right: 16,
      background: 'rgba(255, 254, 251, 0.78)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderRadius: 999,
      padding: '10px 18px',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 1px 0 rgba(70,40,20,.06), 0 4px 14px rgba(70,40,20,.10)',
      border: '1px solid rgba(232, 220, 198, 0.6)',
      zIndex: 5,
    }}>
      <span style={{ fontWeight: 700, fontSize: 14 }}>{weather} {temp}°C</span>
      <span style={{ width: 4, height: 4, borderRadius: 2, background: 'var(--swo-ink-3)' }}/>
      <span style={{ fontSize: 13, color: 'var(--swo-ink-2)' }}>{period} · {day}</span>
      <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--swo-ink)' }}>{city}</span>
    </div>
  );
}

// ─── BottomNav ───────────────────────────────────────────────
function BottomNav({ active = 'swipe', onTab }) {
  const tabs = [
    { id: 'swipe', label: 'Swipe', icon: '♥' },
    { id: 'coupons', label: 'Coupons', icon: '🎟' },
    { id: 'map', label: 'Map', icon: '📍' },
    { id: 'you', label: 'You', icon: '☻' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 28, left: 16, right: 16,
      background: 'rgba(255, 254, 251, 0.88)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderRadius: 22,
      padding: '10px 12px',
      display: 'flex', justifyContent: 'space-between',
      boxShadow: '0 2px 0 rgba(70,40,20,.06), 0 12px 28px rgba(70,40,20,.14)',
      border: '1px solid rgba(232, 220, 198, 0.6)',
      zIndex: 5,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onTab && onTab(t.id)} style={{
          flex: 1, background: 'transparent', border: 'none',
          padding: '6px 4px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          color: active === t.id ? 'var(--swo-mustard-deep)' : 'var(--swo-ink-3)',
          fontWeight: active === t.id ? 700 : 500,
          fontSize: 11, fontFamily: 'var(--font-body)',
          cursor: 'pointer',
        }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── OnboardingScreen ────────────────────────────────────────
function OnboardingScreen({ selected, onToggle, onContinue }) {
  const tiles = [
    { id: 'coffee', emoji: '☕', label: 'Coffee' },
    { id: 'food', emoji: '🥐', label: 'Local food' },
    { id: 'cozy', emoji: '🛋', label: 'Cozy spots' },
    { id: 'quick', emoji: '⚡', label: 'Quick bites' },
    { id: 'sweet', emoji: '🍰', label: 'Sweet stuff' },
    { id: 'wine', emoji: '🍷', label: 'Wine bar' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '60px 0 24px', background: 'var(--swo-mustard-soft)', boxSizing: 'border-box' }}>
      {/* mustard hero block */}
      <div style={{
        background: 'var(--swo-mustard)',
        margin: '0 16px 24px',
        padding: '20px 22px 24px',
        borderRadius: 22,
        border: '2px solid var(--swo-ink)',
        boxShadow: '3px 4px 0 rgba(42,31,26,.95)',
        position: 'relative',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--swo-ink)', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Step 1 of 1</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 6px', color: 'var(--swo-ink)' }}>What sounds good today?</h1>
        <p style={{ fontSize: 14, color: 'var(--swo-ink)', opacity: 0.78, margin: 0 }}>Pick a few. We'll only match you to places nearby that fit the moment.</p>
        <div style={{ position: 'absolute', top: -14, right: 22, fontSize: 28, transform: 'rotate(15deg)' }}>☀️</div>
      </div>
      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 'auto' }}>
        {tiles.map(t => {
          const on = selected.includes(t.id);
          return (
            <button key={t.id} onClick={() => onToggle(t.id)} style={{
              background: on ? 'var(--swo-mustard)' : 'var(--swo-paper)',
              border: on ? '2px solid var(--swo-ink)' : '2px solid var(--swo-ink-4)',
              boxShadow: on ? '2px 3px 0 rgba(42,31,26,.95)' : 'none',
              borderRadius: 18,
              padding: '20px 12px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              cursor: 'pointer',
              transition: 'all 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: on ? 'scale(1.02)' : 'scale(1)',
            }}>
              <span style={{ fontSize: 32, lineHeight: 1 }}>{t.emoji}</span>
              <span style={{ fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--swo-ink)' }}>{t.label}</span>
            </button>
          );
        })}
      </div>
      <button onClick={onContinue} disabled={selected.length === 0} style={{
        marginTop: 24,
        background: 'var(--swo-mustard)',
        color: 'var(--swo-ink)',
        border: '2px solid var(--swo-ink)',
        borderRadius: 14,
        padding: '14px',
        fontFamily: 'var(--font-body)',
        fontWeight: 700, fontSize: 16,
        cursor: selected.length === 0 ? 'not-allowed' : 'pointer',
        opacity: selected.length === 0 ? 0.4 : 1,
        boxShadow: '3px 4px 0 rgba(42,31,26,.95)',
      }}>Start swiping →</button>
      </div>
    </div>
  );
}

// ─── MatchOverlay ────────────────────────────────────────────
function MatchOverlay({ offer, onShow, onDismiss }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(circle at 30% 20%, #FBE5A6 0%, #FBF5EA 55%, #F2E9D6 100%)',
      zIndex: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
      animation: 'fadeIn 320ms ease-out',
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes stampIn {
          0% { transform: rotate(-45deg) scale(0); opacity: 0; }
          70% { transform: rotate(-6deg) scale(1.15); opacity: 1; }
          100% { transform: rotate(-6deg) scale(1); opacity: 1; }
        }
        @keyframes sparkle1 { 0%,100% { transform: rotate(20deg) scale(1); opacity: 0.8; } 50% { transform: rotate(20deg) scale(1.2); opacity: 1; } }
        @keyframes sparkle2 { 0%,100% { transform: rotate(-15deg) scale(0.9); opacity: 0.6; } 50% { transform: rotate(-15deg) scale(1.1); opacity: 1; } }
        @keyframes modalIn { 0% { opacity: 0; transform: translateY(20px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <div style={{
        position: 'absolute', top: 110, left: 50,
        padding: '14px 24px',
        background: 'var(--swo-mustard)', color: 'var(--swo-ink)',
        fontFamily: 'var(--font-display)', fontWeight: 900,
        fontSize: 26, letterSpacing: '0.02em', textTransform: 'uppercase',
        border: '3px solid var(--swo-ink)',
        borderRadius: 8,
        boxShadow: '4px 5px 0 rgba(42,31,26,.95)',
        animation: 'stampIn 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      }}>It's a match</div>

      <div style={{ position: 'absolute', top: 90, right: 60, fontSize: 36, animation: 'sparkle1 1.6s infinite' }}>✨</div>
      <div style={{ position: 'absolute', top: 200, left: 80, fontSize: 22, animation: 'sparkle2 2s infinite' }}>✨</div>
      <div style={{ position: 'absolute', top: 240, right: 40, fontSize: 28, animation: 'sparkle1 1.8s infinite' }}>✨</div>

      <div style={{
        width: '100%', maxWidth: 280,
        background: 'var(--swo-paper)',
        borderRadius: 28,
        padding: 22,
        boxShadow: '0 4px 0 rgba(70,40,20,.06), 0 20px 48px rgba(70,40,20,.18)',
        border: '1px solid var(--border-soft)',
        textAlign: 'center',
        animation: 'modalIn 500ms 200ms cubic-bezier(0.34, 1.56, 0.64, 1) backwards',
        marginTop: 80,
      }}>
        <div style={{
          height: 130, borderRadius: 18,
          background: offer.photoBg,
          marginBottom: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 72, opacity: 0.95,
        }}>{offer.emoji}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, lineHeight: 1.1, margin: '0 0 6px', letterSpacing: '-0.01em' }}>{offer.headline}</h2>
        <p style={{ fontSize: 13, color: 'var(--swo-ink-3)', margin: '0 0 16px' }}>Show this at {offer.merchant} before {offer.expiresAt}</p>
        <button onClick={onShow} style={{
          background: 'var(--swo-mustard)', color: 'var(--swo-ink)',
          border: '2px solid var(--swo-ink)', borderRadius: 14,
          padding: '12px', width: '100%',
          fontWeight: 700, fontSize: 15, fontFamily: 'var(--font-body)',
          boxShadow: '0 1px 0 rgba(70,40,20,.06), 0 4px 14px rgba(70,40,20,.10)',
          cursor: 'pointer',
        }}>Show coupon</button>
        <button onClick={onDismiss} style={{
          background: 'transparent', color: 'var(--swo-ink-3)',
          border: 'none', marginTop: 8, padding: 8,
          fontSize: 13, cursor: 'pointer', width: '100%',
        }}>Keep swiping</button>
      </div>
    </div>
  );
}

// ─── CouponScreen ────────────────────────────────────────────
function CouponScreen({ offer, onBack }) {
  // simple QR-like grid
  const cells = [];
  const seed = offer.token.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  for (let i = 0; i < 169; i++) cells.push((seed * (i + 7)) % 13 < 6);
  // fix corners
  const corners = [0, 1, 12, 13, 14, 24, 25, 26, 144, 145, 146, 156, 157, 158, 168];
  corners.forEach(c => { cells[c] = (c % 3 !== 0); });

  return (
    <div style={{ height: '100%', background: 'var(--swo-cream)', padding: '60px 20px 20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <button onClick={onBack} style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 14, color: 'var(--swo-ink-2)', textAlign: 'left', marginBottom: 20, cursor: 'pointer' }}>← Back to swipe</button>

      <div style={{ background: 'var(--swo-paper)', borderRadius: 28, padding: 24, border: '1px solid var(--border-soft)', boxShadow: '0 2px 0 rgba(70,40,20,.06), 0 12px 28px rgba(70,40,20,.14)', textAlign: 'center', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: -14, right: 24,
          padding: '6px 14px',
          background: 'var(--swo-mint)', color: 'white',
          fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 13,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          border: '2px solid var(--swo-ink)', borderRadius: 6,
          boxShadow: '3px 4px 0 rgba(42,31,26,.95)',
          transform: 'rotate(4deg)',
        }}>Saved</div>

        <div style={{ height: 120, borderRadius: 18, background: offer.photoBg, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72 }}>{offer.emoji}</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, lineHeight: 1.1, margin: '0 0 4px', letterSpacing: '-0.01em' }}>{offer.headline}</h1>
        <p style={{ fontSize: 13, color: 'var(--swo-ink-3)', margin: '0 0 18px' }}>{offer.merchant} · {offer.address}</p>

        {/* QR-like sticker */}
        <div style={{ display: 'inline-block', padding: 14, background: 'white', border: '2px solid var(--swo-ink)', borderRadius: 12, boxShadow: '3px 4px 0 rgba(42,31,26,.95)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 8px)', gap: 0 }}>
            {cells.map((on, i) => <span key={i} style={{ width: 8, height: 8, background: on ? 'var(--swo-ink)' : 'transparent' }}/>)}
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--swo-ink-3)', margin: '14px 0 0', fontFamily: 'var(--font-mono)' }}>{offer.token.slice(0, 8).toUpperCase()}</p>
      </div>

      <div style={{ background: 'var(--swo-shell)', borderRadius: 18, padding: '14px 18px', marginTop: 16, fontSize: 13, color: 'var(--swo-ink-2)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--swo-ink-3)', marginBottom: 4 }}>Generated for</div>
        <div>☁️ 11°C · Quiet afternoon · Coffee preference</div>
      </div>

      <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: 12, color: 'var(--swo-ink-3)' }}>
        ⏱ Expires {offer.expiresAt}
      </div>
    </div>
  );
}

Object.assign(window, { ContextBar, BottomNav, OnboardingScreen, MatchOverlay, CouponScreen });

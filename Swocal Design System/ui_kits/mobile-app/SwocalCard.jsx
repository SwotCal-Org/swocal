// SwocalCard.jsx — the canonical swipe card

function SwocalCard({ offer, swipeDir = 0, dragX = 0, dragY = 0, rotate = 0, style = {}, onClick }) {
  // ghost labels
  const showYes = dragX > 40;
  const showNo = dragX < -40;
  const yesOpacity = Math.min(1, Math.max(0, (dragX - 20) / 80));
  const noOpacity = Math.min(1, Math.max(0, (-dragX - 20) / 80));

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--swo-paper)',
        borderRadius: 24,
        border: '1px solid var(--border-soft)',
        boxShadow: dragX !== 0 || dragY !== 0
          ? '0 4px 0 rgba(70,40,20,.06), 0 20px 48px rgba(70,40,20,.18)'
          : '0 2px 0 rgba(70,40,20,.06), 0 12px 28px rgba(70,40,20,.14)',
        overflow: 'hidden',
        transform: `translate(${dragX}px, ${dragY}px) rotate(${rotate}deg)`,
        transition: dragX === 0 && dragY === 0 ? 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 220ms' : 'none',
        ...style,
      }}>
      {/* photo */}
      <div style={{
        height: '58%',
        background: offer.photoBg,
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 110, opacity: 0.42, filter: 'saturate(1.2)' }}>{offer.emoji}</div>
        {/* gradient protection at bottom of photo */}
        <div style={{
          position: 'absolute', inset: 'auto 0 0 0', height: 60,
          background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.18))',
        }}/>
        {/* discount sticker top-right — mustard primary */}
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: 'var(--swo-mustard)',
          color: 'var(--swo-ink)',
          padding: '6px 12px',
          borderRadius: 999,
          border: '2px solid var(--swo-ink)',
          boxShadow: '2px 3px 0 rgba(42,31,26,.95)',
          fontWeight: 800, fontSize: 13,
          transform: 'rotate(4deg)',
        }}>{offer.discount}% off</div>
        {/* category chip top-left — paper, neutral */}
        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: 'var(--swo-paper)',
          padding: '5px 11px',
          borderRadius: 999,
          border: '2px solid var(--swo-ink)',
          boxShadow: '2px 3px 0 rgba(42,31,26,.18)',
          fontWeight: 700, fontSize: 12,
        }}>{offer.categoryEmoji} {offer.category}</div>
      </div>

      {/* body */}
      <div style={{ padding: '18px 22px 20px', display: 'flex', flexDirection: 'column', gap: 10, height: '42%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Chip>⏱ {offer.timeLeft}</Chip>
          <Chip>{offer.distance}m away</Chip>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 22, fontWeight: 700, lineHeight: 1.1,
          letterSpacing: '-0.01em',
          margin: 0, color: 'var(--swo-ink)',
        }}>{offer.headline}</h2>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--swo-ink-3)', borderTop: '1px solid var(--border-soft)', paddingTop: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--swo-ink)', fontSize: 14 }}>{offer.merchant}</span>
          <span>·</span>
          <span>{offer.address}</span>
        </div>
      </div>

      {/* ghost labels */}
      {showYes && (
        <div style={{
          position: 'absolute', top: 30, left: 30,
          padding: '10px 18px',
          background: 'var(--swo-mint)', color: 'white',
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 22, letterSpacing: '0.04em', textTransform: 'uppercase',
          border: '3px solid var(--swo-ink)',
          borderRadius: 8, transform: 'rotate(-12deg)',
          boxShadow: '3px 4px 0 rgba(42,31,26,.95)',
          opacity: yesOpacity,
        }}>Yes please</div>
      )}
      {showNo && (
        <div style={{
          position: 'absolute', top: 30, right: 30,
          padding: '10px 18px',
          background: 'var(--swo-paper)', color: 'var(--swo-ink)',
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 22, letterSpacing: '0.04em', textTransform: 'uppercase',
          border: '3px solid var(--swo-ink)',
          borderRadius: 8, transform: 'rotate(12deg)',
          boxShadow: '3px 4px 0 rgba(42,31,26,.95)',
          opacity: noOpacity,
        }}>Not for now</div>
      )}
    </div>
  );
}

function Chip({ children, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px',
      background: color || 'var(--swo-cream-deep)',
      borderRadius: 999,
      fontSize: 11, fontWeight: 600,
      color: 'var(--swo-ink-2)',
    }}>{children}</span>
  );
}

Object.assign(window, { SwocalCard, Chip });

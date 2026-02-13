export function DonutDistribution({ peak, tier }: { peak: number; tier: number }) {
  const total = peak + tier || 1;
  const peakPct = Math.round((peak / total) * 100);
  const tierPct = 100 - peakPct;
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <h3>Pricing model distribution</h3>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: '50%',
            background: `conic-gradient(#14b8a6 0 ${peakPct}%, #3b4f56 ${peakPct}% 100%)`,
            position: 'relative'
          }}
        >
          <div style={{ position: 'absolute', inset: 20, borderRadius: '50%', background: 'var(--surface-solid)' }} />
        </div>
        <div>
          <div>Peak Model: {peakPct}%</div>
          <div>Tier Model: {tierPct}%</div>
        </div>
      </div>
    </div>
  );
}

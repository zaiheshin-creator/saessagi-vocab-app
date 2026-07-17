export default function GoalCard({ done, total, children }) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return (
    <div
      style={{
        background: 'linear-gradient(160deg, var(--sprout-tint), var(--paper))',
        border: '1px solid var(--sprout)',
        borderRadius: 20,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div className="flex justify-between items-baseline">
        <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--sprout-deep)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          오늘의 목표
        </span>
        <b className="font-display" style={{ fontSize: 20, color: 'var(--ink)' }}>{done} / {total} 단어</b>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: 'var(--paper-sunk)', overflow: 'hidden' }}>
        <span style={{ display: 'block', height: '100%', borderRadius: 999, width: `${pct}%`, background: 'linear-gradient(90deg, var(--sprout), var(--sprout-deep))', transition: 'width .4s ease' }} />
      </div>
      {children}
    </div>
  );
}

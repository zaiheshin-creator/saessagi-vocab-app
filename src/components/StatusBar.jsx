const HEART_PATH = 'M12 21s-7.5-4.6-10-9.3C0.3 8.4 2.2 4 6.3 4c2 0 3.5 1 4.7 2.6C12.2 5 13.7 4 15.7 4c4.1 0 6 4.4 4.3 7.7C19.5 16.4 12 21 12 21z';

export default function StatusBar({ hearts = 3, streak = 0 }) {
  return (
    <div className="flex items-center justify-between font-display" style={{ fontSize: 13 }}>
      <div className="flex gap-1" aria-label={`남은 하트 ${hearts}개`}>
        {Array.from({ length: 3 }).map((_, i) => (
          <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < hearts ? '#F2637C' : 'var(--paper-sunk)'}>
            <path d={HEART_PATH} />
          </svg>
        ))}
      </div>
      <div className="flex items-center gap-1" style={{ color: 'var(--tangerine)', fontWeight: 700 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2c1 3-3 4.5-3 8a3 3 0 006 0c1.5 1 2 3 2 4.5C17 18.5 14.8 21 12 21s-5-2.5-5-6.5c0-3 1.8-5 2.5-7C10 6 11 4 12 2z" />
        </svg>
        {streak}일째
      </div>
    </div>
  );
}

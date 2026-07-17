import { useStore } from '../store/useStore';

const ICONS = {
  home: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>
  ),
  wordbook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19V5a2 2 0 012-2h11l3 3v13a2 2 0 01-2 2H6a2 2 0 01-2-2z" /><path d="M8 8h8M8 12h8M8 16h5" /></svg>
  ),
  levelmap: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
  ),
  wrongnote: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V9" /><path d="M18 2l4 4-10 10H8v-4z" /></svg>
  ),
  mypage: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
  ),
};

const TABS = [
  { key: 'home', label: '홈' },
  { key: 'wordbook', label: '단어장' },
  { key: 'levelmap', label: '레벨맵' },
  { key: 'wrongnote', label: '오답노트' },
  { key: 'mypage', label: '마이페이지' },
];

// 학습(learn)·테스트(test)·결과(result) 화면은 몰입형 전체화면 흐름이라 하단 네비 없이 진행한다.
const HIDDEN_ON = new Set(['learn', 'test', 'result']);

export default function BottomNav() {
  const activeScreen = useStore((s) => s.activeScreen);
  const setActiveScreen = useStore((s) => s.setActiveScreen);

  if (HIDDEN_ON.has(activeScreen)) return null;

  return (
    <nav
      className="grid"
      style={{ gridTemplateColumns: `repeat(${TABS.length}, 1fr)`, borderTop: '1px solid var(--line)', background: 'var(--paper)', padding: '8px 4px calc(8px + env(safe-area-inset-bottom))' }}
    >
      {TABS.map((tab) => {
        const isOn = activeScreen === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setActiveScreen(tab.key)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer',
              color: isOn ? 'var(--sprout-deep)' : 'var(--ink-faint)',
              fontSize: 10.5, fontWeight: 700, padding: '4px 0',
            }}
          >
            {ICONS[tab.key]}
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

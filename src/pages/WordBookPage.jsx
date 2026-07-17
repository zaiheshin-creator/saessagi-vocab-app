import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import curriculum from '../data/curriculum.json';
import units from '../data/units.json';

const LEVEL_ORDER = ['Lv1', 'Lv2', 'Lv3', 'Lv4'];

export default function WordBookPage() {
  const { completedWordNos, todayBatch, setActiveScreen } = useStore();
  const completedSet = useMemo(() => new Set(completedWordNos), [completedWordNos]);
  const todaySet = useMemo(() => new Set(todayBatch), [todayBatch]);

  const grouped = useMemo(() => {
    const byLevel = {};
    for (const word of curriculum) {
      (byLevel[word.level] ||= {});
      (byLevel[word.level][word.unitId] ||= { meta: units[word.unitId], words: [] });
      byLevel[word.level][word.unitId].words.push(word);
    }
    return byLevel;
  }, []);

  const currentLevel = todayBatch.length > 0 ? curriculum.find((w) => w.no === todayBatch[0])?.level : null;

  return (
    <div className="flex flex-col gap-3 p-4" style={{ flex: 1 }}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveScreen('home')}
          aria-label="홈으로"
          style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-soft)', cursor: 'pointer' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="font-display" style={{ fontSize: 15 }}>단어장</div>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700 }}>{completedWordNos.length} / {curriculum.length} 완료</span>
      </div>

      <div className="flex flex-col gap-2" style={{ overflowY: 'auto' }}>
        {LEVEL_ORDER.map((level) => {
          const levelUnits = grouped[level];
          if (!levelUnits) return null;
          const levelWords = Object.values(levelUnits).flatMap((u) => u.words);
          const levelDone = levelWords.filter((w) => completedSet.has(w.no)).length;
          return (
            <details key={level} open={level === currentLevel} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 14, padding: '10px 12px' }}>
              <summary className="font-display" style={{ cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--sprout-deep)' }}>{level}</span>
                <span style={{ fontFamily: '"Malgun Gothic", sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{levelWords[0]?.levelName}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-soft)' }}>{levelDone}/{levelWords.length}</span>
              </summary>
              <div className="flex flex-col gap-2" style={{ marginTop: 10 }}>
                {Object.values(levelUnits).map(({ meta, words }) => {
                  const unitDone = words.filter((w) => completedSet.has(w.no)).length;
                  return (
                    <details key={meta.id} style={{ background: 'var(--paper-sunk)', borderRadius: 12, padding: '8px 10px' }}>
                      <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-soft)', fontWeight: 400 }}>{unitDone}/{words.length}</span>
                      </summary>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1" style={{ marginTop: 8 }}>
                        {words.map((w) => {
                          const done = completedSet.has(w.no);
                          const today = todaySet.has(w.no);
                          return (
                            <div
                              key={w.no}
                              className="flex items-center gap-1.5"
                              style={{ fontSize: 12.5, padding: '3px 0', opacity: done ? 0.55 : 1 }}
                            >
                              <span
                                style={{
                                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                                  background: done ? 'var(--sprout)' : today ? 'var(--tangerine)' : 'var(--line)',
                                }}
                              />
                              <span className="font-display" style={{ color: 'var(--sprout-deep)' }}>{w.en}</span>
                              <span style={{ color: 'var(--ink-soft)' }}>{w.kr}</span>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

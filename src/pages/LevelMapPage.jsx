import { useMemo, useState } from 'react';
import { useStore, getWordInfo } from '../store/useStore';
import curriculum from '../data/curriculum.json';
import Mascot from '../components/Mascot';

const LEVEL_ORDER = ['Lv1', 'Lv2', 'Lv3', 'Lv4'];

export default function LevelMapPage() {
  const { completedWordNos, todayBatch, setActiveScreen } = useStore();
  const completedSet = useMemo(() => new Set(completedWordNos), [completedWordNos]);
  const todaySet = useMemo(() => new Set(todayBatch), [todayBatch]);

  // 오늘 배우는 첫 단어의 레벨 = 실제로 진행 중인 레벨. todayBatch가 비어있으면(=800단어 완주) null.
  const actualCurrentLevel = todayBatch.length > 0 ? getWordInfo(todayBatch[0])?.level || 'Lv1' : null;
  const [selectedLevel, setSelectedLevel] = useState(actualCurrentLevel || 'Lv1');

  // curriculum.json은 이미 레벨→유닛→단어 순서로 정렬되어 있으므로, 한 번 훑으며
  // 레벨별로 유닛이 처음 등장한 순서를 그대로 유지한 목록을 만든다(units.json은 순서 정보가 없음).
  const unitsByLevel = useMemo(() => {
    const byLevel = {};
    for (const word of curriculum) {
      const list = (byLevel[word.level] ||= []);
      let unit = list.find((u) => u.unitId === word.unitId);
      if (!unit) {
        unit = { unitId: word.unitId, label: word.unitLabel, icon: word.unitIcon, words: [] };
        list.push(unit);
      }
      unit.words.push(word);
    }
    return byLevel;
  }, []);

  const levelUnits = unitsByLevel[selectedLevel] || [];
  const levelName = levelUnits[0]?.words[0]?.levelName || '';

  // "현재" 유닛: 오늘 배우는 단어가 포함된 유닛을 우선으로 하고, 없으면(오늘 학습이 다른 유닛에 걸쳐 있는 경우)
  // 이 레벨 안에서 아직 다 끝내지 못한 첫 유닛을 현재로 삼는다.
  // 단, 이 폴백은 실제로 진행 중인 레벨(actualCurrentLevel)을 보고 있을 때만 적용한다 — 그렇지 않으면
  // 아직 시작도 안 한 미래 레벨 탭을 미리 훑어봤을 때 첫 유닛이 "진행중"으로 잘못 표시된다.
  let currentIndex = levelUnits.findIndex((u) => u.words.some((w) => todaySet.has(w.no)));
  if (currentIndex === -1 && selectedLevel === actualCurrentLevel) {
    currentIndex = levelUnits.findIndex((u) => !u.words.every((w) => completedSet.has(w.no)));
  }

  const nodes = levelUnits.map((unit, idx) => {
    const doneCount = unit.words.filter((w) => completedSet.has(w.no)).length;
    const isDone = unit.words.length > 0 && doneCount === unit.words.length;
    // 단순화: done이 아니고 "현재" 인덱스가 아니면 전부 locked로 취급한다.
    // 정상적인 진행에서는 항상 순서대로 진행되므로 currentIndex 이전 유닛은 모두 done이라 이 케이스에 걸리지 않는다.
    const state = isDone ? 'done' : idx === currentIndex ? 'current' : 'locked';
    return { ...unit, doneCount, state };
  });

  const levelDoneUnits = nodes.filter((n) => n.state === 'done').length;

  const STATE_STYLE = {
    done: { border: 'var(--sprout)', bg: 'var(--sprout-tint)', label: 'var(--ink-soft)' },
    current: { border: 'var(--tangerine)', bg: 'var(--tangerine-tint)', label: 'var(--tangerine)' },
    locked: { border: 'var(--line)', bg: 'var(--paper)', label: 'var(--ink-faint)' },
  };

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
        <div className="font-display" style={{ fontSize: 15 }}>레벨맵</div>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700 }}>{completedWordNos.length} / {curriculum.length} 완료</span>
      </div>

      <div className="flex items-end gap-3">
        <Mascot size={40} />
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '14px 14px 14px 4px', padding: '10px 13px', fontSize: 13.5, lineHeight: 1.4 }}>
          새싹이가 걸어온 길이에요. 다음 유닛까지 함께 가볼까요? 🌿
        </div>
      </div>

      <div className="flex gap-2">
        {LEVEL_ORDER.map((lv) => {
          const hasData = (unitsByLevel[lv] || []).length > 0;
          const isOn = selectedLevel === lv;
          return (
            <button
              key={lv}
              onClick={() => hasData && setSelectedLevel(lv)}
              disabled={!hasData}
              className="font-display"
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: hasData ? 'pointer' : 'default',
                border: isOn ? '1px solid var(--sprout)' : '1px solid var(--line)',
                background: isOn ? 'var(--sprout-tint)' : 'var(--paper)',
                color: isOn ? 'var(--sprout-deep)' : hasData ? 'var(--ink-soft)' : 'var(--ink-faint)',
              }}
            >
              {lv}
            </button>
          );
        })}
      </div>

      {nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 p-4 text-center" style={{ flex: 1, color: 'var(--ink-soft)' }}>
          <Mascot size={60} />
          <p style={{ fontSize: 13.5 }}>아직 이 레벨의 유닛 데이터가 없어요.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="font-display" style={{ fontSize: 14, color: 'var(--sprout-deep)' }}>{selectedLevel} {levelName}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700 }}>유닛 {levelDoneUnits} / {nodes.length}</span>
          </div>

          <div className="flex flex-col" style={{ gap: 4, padding: '6px 0 16px', overflowY: 'auto' }}>
            {nodes.map((node, idx) => {
              const style = STATE_STYLE[node.state];
              const align = idx % 2 === 0 ? 'flex-start' : 'flex-end';
              return (
                <div key={node.unitId} className="flex" style={{ justifyContent: align }}>
                  <div className="flex flex-col items-center" style={{ gap: 5, width: 84 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        border: `3px solid ${style.border}`,
                        background: style.bg,
                        boxShadow: node.state === 'current' ? '0 0 0 6px var(--tangerine-tint)' : 'none',
                      }}
                    >
                      {node.icon || '📘'}
                    </div>
                    <div className="font-display" style={{ fontSize: 11, fontWeight: 700, color: style.label, textAlign: 'center' }}>{node.label}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--ink-faint)' }}>{node.doneCount}/{node.words.length}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

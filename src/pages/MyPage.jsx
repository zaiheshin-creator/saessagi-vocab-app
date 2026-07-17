import { useEffect, useMemo } from 'react';
import { useStore, getWordInfo, getCurriculumProgress } from '../store/useStore';
import curriculum from '../data/curriculum.json';
import units from '../data/units.json';
import Mascot from '../components/Mascot';

const LEVEL_ORDER = ['Lv1', 'Lv2', 'Lv3', 'Lv4'];

export default function MyPage() {
  const { completedWordNos, todayBatch, streak, lastResult, badges, syncBadges } = useStore();

  // 배지 획득 조건(유닛 완주)을 매번 새로 계산하는 대신, 새로 달성한 배지가 있으면 store에 누적 저장한다.
  // syncBadges 내부에서 새로 획득한 게 없으면 아무 것도 하지 않으므로 중복 저장 걱정은 없다.
  useEffect(() => {
    syncBadges();
  }, [completedWordNos.length, syncBadges]);

  const { done: totalDone, total: totalAll } = getCurriculumProgress(completedWordNos);
  const completedSet = useMemo(() => new Set(completedWordNos), [completedWordNos]);

  const currentWord = todayBatch.length > 0 ? getWordInfo(todayBatch[0]) : null;
  const isFullyDone = !currentWord; // todayBatch가 비어있다는 건 800단어를 모두 배웠다는 뜻(useStore computeTodayBatch 참고)

  // 현재 레벨 안에서 다음 단계(레벨업)까지 몇 단어가 남았는지 계산 — 실제 완료 데이터 기반, 추정치 아님
  let growSub = '';
  if (!isFullyDone) {
    const levelWords = curriculum.filter((w) => w.level === currentWord.level);
    const levelDone = levelWords.filter((w) => completedSet.has(w.no)).length;
    const levelRemaining = levelWords.length - levelDone;
    const isLastLevel = LEVEL_ORDER.indexOf(currentWord.level) === LEVEL_ORDER.length - 1;
    growSub = isLastLevel
      ? `마지막 단계예요 · ${totalAll - totalDone}단어 남음`
      : `다음 성장까지 ${levelRemaining}단어 남음`;
  }

  // 통계: "배운 단어"와 "스트릭"은 항상 정확한 값. 정답률은 전체 누적 이력이 store에 없어(lastResult만 저장됨)
  // "정답률"이라는 이름으로 뭉뚱그리지 않고, 가장 최근 테스트 결과가 있을 때만 "최근 테스트 정답률"로 명시해 보여준다.
  const stats = [
    { value: totalDone, label: '배운 단어' },
    { value: `${streak}일`, label: '스트릭' },
  ];
  if (lastResult) {
    const pct = Math.round((lastResult.correct / lastResult.total) * 100);
    stats.push({ value: `${pct}%`, label: '최근 테스트 정답률' });
  }

  const badgeSet = useMemo(() => new Set(badges), [badges]);
  const unitList = Object.values(units);

  return (
    <div className="flex flex-col gap-4 p-4" style={{ flex: 1, overflowY: 'auto' }}>
      <div className="font-display" style={{ fontSize: 15 }}>마이페이지</div>

      {/* 성장 카드 */}
      <div
        className="flex flex-col items-center gap-2.5"
        style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20, padding: '22px 20px' }}
      >
        <Mascot size={100} level={isFullyDone ? 'Lv4' : currentWord.level} />
        <div className="font-display" style={{ fontSize: 16, color: 'var(--sprout-deep)' }}>
          {isFullyDone ? '새싹이 · 완전히 자랐어요!' : `새싹이 · ${currentWord.level} ${currentWord.levelName}`}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
          {isFullyDone ? '800단어 완주! 정말 대단해요 🎉' : growSub}
        </div>
      </div>

      {/* 통계 */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 14, padding: '12px 6px', textAlign: 'center' }}>
            <b className="font-display" style={{ display: 'block', fontSize: 18, color: 'var(--sprout-deep)' }}>{s.value}</b>
            <span style={{ fontSize: 10.5, color: 'var(--ink-soft)', fontWeight: 700 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* 배지함: 유닛의 모든 단어를 다 배우면 그 유닛 배지를 획득한다 (useStore.js의 getEarnedBadgeUnitIds/syncBadges 참고) */}
      <div className="flex items-center justify-between">
        <h3 style={{ margin: 0, fontSize: 14 }}>배지함</h3>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700 }}>{badgeSet.size} / {unitList.length}</span>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {unitList.map((unit) => {
          const earned = badgeSet.has(unit.id);
          return (
            <div
              key={unit.id}
              title={earned ? `${unit.label} 유닛 완료` : `${unit.label} 유닛 (잠김)`}
              style={{
                aspectRatio: '1', borderRadius: 14, background: 'var(--paper)', border: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                opacity: earned ? 1 : 0.35, filter: earned ? 'none' : 'grayscale(1)',
              }}
            >
              {earned ? unit.icon : '🔒'}
            </div>
          );
        })}
      </div>
    </div>
  );
}

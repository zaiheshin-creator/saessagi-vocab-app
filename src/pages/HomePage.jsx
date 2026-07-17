import { useStore, getWordInfo, getCurriculumProgress } from '../store/useStore';
import Mascot from '../components/Mascot';
import StatusBar from '../components/StatusBar';
import GoalCard from '../components/GoalCard';
import PrimaryButton from '../components/PrimaryButton';

const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </svg>
);

export default function HomePage() {
  const { streak, hearts, todayBatch, todayFlipped, testDoneToday, completedWordNos, setActiveScreen } = useStore();
  const total = todayBatch.length;
  const done = todayFlipped.length;
  const learnComplete = total > 0 && done >= total;
  const firstWord = total > 0 ? getWordInfo(todayBatch[0]) : null;
  const { done: totalDone, total: totalAll, pct: totalPct } = getCurriculumProgress(completedWordNos);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-4 text-center" style={{ flex: 1 }}>
        <Mascot size={90} />
        <div style={{ fontSize: 18, fontWeight: 700 }}>800단어를 모두 배웠어요! 🎉</div>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>정말 대단해요, 새싹이가 활짝 자랐어요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4" style={{ flex: 1 }}>
      <div className="flex items-center justify-between">
        <span
          className="font-display"
          style={{ background: 'var(--sprout-tint)', color: 'var(--sprout-deep)', fontSize: 12, padding: '5px 10px', borderRadius: 999, border: '1px solid var(--sprout)' }}
        >
          {firstWord.level}. {firstWord.levelName}
        </span>
        <StatusBar hearts={hearts} streak={streak} />
      </div>

      <div className="flex items-end gap-3">
        <Mascot />
        <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '14px 14px 14px 4px', padding: '10px 13px', fontSize: 13.5, lineHeight: 1.4 }}>
          {learnComplete
            ? (testDoneToday ? '오늘 학습·테스트 다 끝냈어요! 내일 또 만나요 🌿' : '오늘의 단어는 다 배웠어요! 이제 테스트를 볼까요?')
            : `안녕! 오늘도 ${total}단어만 배워볼까요?`}
        </div>
      </div>

      <GoalCard done={done} total={total}>
        <PrimaryButton onClick={() => setActiveScreen('learn')} disabled={learnComplete}>
          {learnComplete ? '오늘의 학습 완료' : '오늘의 학습 시작하기'}
        </PrimaryButton>
      </GoalCard>

      <PrimaryButton
        variant="sky"
        icon={!learnComplete ? <LockIcon /> : null}
        disabled={!learnComplete || testDoneToday}
        onClick={() => setActiveScreen('test')}
      >
        {testDoneToday ? '오늘의 테스트 완료 ✓' : learnComplete ? '일일 테스트 시작하기' : '일일 테스트 (학습을 먼저 완료하세요)'}
      </PrimaryButton>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 26 }}>{firstWord.unitIcon || '📘'}</div>
        <div style={{ flex: 1 }}>
          <b style={{ display: 'block', fontSize: 13.5 }}>{firstWord.unitLabel} 유닛 학습 중</b>
          <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{firstWord.level} {firstWord.levelName} · 전체 진도 {totalDone}/{totalAll} ({totalPct}%)</span>
        </div>
      </div>
    </div>
  );
}

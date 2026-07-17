import { useMemo, useState } from 'react';
import { useStore, getWordInfo, getDueReviews, getUpcomingReviews } from '../store/useStore';
import Mascot from '../components/Mascot';
import PrimaryButton from '../components/PrimaryButton';
import { withExtras } from '../utils/withExtras';

// 라이트너 간격(1일→3일→7일). src/store/useStore.js 내부에도 같은 값이 있지만 export되어
// 있지 않아, 화면 문구(간격 배지·버튼 캡션) 표시용으로만 여기서 값을 복제해 쓴다.
// 실제 상태 전이(다음 dueDate 계산)는 store의 reviewWord()가 전담한다.
const REVIEW_INTERVALS = [1, 3, 7];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysUntil(dueDate) {
  const today = todayStr();
  const diff = (new Date(dueDate + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000;
  return Math.max(1, Math.round(diff));
}

export default function WrongNotePage() {
  const { reviewQueue } = useStore();
  const [mode, setMode] = useState('list'); // 'list' | 'review'
  const [sessionQueue, setSessionQueue] = useState([]);

  const dueWords = useMemo(
    () => getDueReviews(reviewQueue).map((entry) => ({ ...entry, word: withExtras(getWordInfo(entry.wordNo)) })),
    [reviewQueue]
  );
  const upcomingWords = useMemo(
    () => getUpcomingReviews(reviewQueue).map((entry) => ({ ...entry, word: withExtras(getWordInfo(entry.wordNo)) })),
    [reviewQueue]
  );

  function startReview() {
    // 복습 세션 동안 reviewWord()가 실시간 reviewQueue를 계속 바꾸므로, 시작 시점 스냅샷을
    // 로컬 상태로 따로 들고 진행한다(중간에 큐가 바뀌어 순서가 흔들리는 걸 방지).
    setSessionQueue(dueWords);
    setMode('review');
  }

  if (mode === 'review') {
    return <ReviewMode queue={sessionQueue} onExit={() => setMode('list')} />;
  }

  if (reviewQueue.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-3 p-4" style={{ flex: 1 }}>
      <div className="flex items-baseline justify-between">
        <div className="font-display" style={{ fontSize: 15 }}>오답노트</div>
        <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700 }}>총 {reviewQueue.length}단어</span>
      </div>

      {dueWords.length > 0 && (
        <>
          <SectionLabel text={`오늘 복습 (${dueWords.length})`} dotColor="var(--tangerine)" />
          <div className="flex flex-col gap-2">
            {dueWords.map((entry) => (
              <WordRow key={entry.wordNo} word={entry.word} badge={<MissBadge count={entry.missCount} />} />
            ))}
          </div>
          <PrimaryButton onClick={startReview}>오늘 복습 시작하기 ({dueWords.length})</PrimaryButton>
        </>
      )}

      {upcomingWords.length > 0 && (
        <>
          <SectionLabel text="다가오는 복습" dotColor="var(--ink-faint)" muted />
          <div className="flex flex-col gap-2">
            {upcomingWords.map((entry) => (
              <WordRow key={entry.wordNo} word={entry.word} muted badge={<DueBadge days={daysUntil(entry.dueDate)} />} />
            ))}
          </div>
        </>
      )}

      <MascotBubble
        text={
          dueWords.length > 0
            ? `${dueWords.length}개만 다시 보면 오늘 오답노트 끝!`
            : '오늘 복습할 단어가 없어요. 잘하고 있어요 🌿'
        }
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 text-center" style={{ flex: 1 }}>
      <Mascot size={90} />
      <div style={{ fontSize: 18, fontWeight: 700 }}>오답노트가 비어있어요!</div>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, lineHeight: 1.5 }}>
        정답만 맞히고 있나봐요 🌿<br />이대로만 쭉 가봐요!
      </p>
    </div>
  );
}

function SectionLabel({ text, dotColor, muted }) {
  return (
    <div
      className="flex items-center gap-1.5"
      style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.02em', color: 'var(--ink-soft)', textTransform: 'uppercase', opacity: muted ? 0.8 : 1 }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      {text}
    </div>
  );
}

function WordRow({ word, badge, muted }) {
  return (
    <div
      className="flex items-center gap-3"
      style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, padding: '12px 14px', opacity: muted ? 0.6 : 1 }}
    >
      <div className="font-display" style={{ fontSize: 16, color: 'var(--sprout-deep)', minWidth: 64 }}>{word.en}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-soft)', flex: 1 }}>{word.kr}</div>
      {badge}
    </div>
  );
}

function MissBadge({ count }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--berry)', background: 'var(--berry-tint)', borderRadius: 999, padding: '3px 8px', whiteSpace: 'nowrap' }}>
      오답 {count}회
    </span>
  );
}

function DueBadge({ days }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-soft)', background: 'var(--paper-sunk)', borderRadius: 999, padding: '3px 8px', whiteSpace: 'nowrap' }}>
      {days}일 후
    </span>
  );
}

function ReviewMode({ queue, onExit }) {
  const { reviewWord } = useStore();
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [bubble, setBubble] = useState('솔직하게 골라도 괜찮아요!');
  const finished = idx >= queue.length;
  const current = finished ? null : queue[idx];

  function handleReveal() {
    if (revealed) return;
    setRevealed(true);
  }

  function handleAssess(result) {
    reviewWord(current.wordNo, result);
    setBubble(result === 'easy' ? '좋아요! 다음에 또 만나요 🌿' : '괜찮아요, 내일 또 연습해요!');
    setTimeout(() => {
      setIdx((i) => i + 1);
      setRevealed(false);
      setBubble('솔직하게 골라도 괜찮아요!');
    }, 500);
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-4 text-center" style={{ flex: 1 }}>
        <div style={{ fontSize: 48 }}>🎉</div>
        <div className="font-display" style={{ fontSize: 18 }}>오늘 복습 끝!</div>
        <p style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>오늘 오답노트를 다 마쳤어요, 최고예요!</p>
        <div style={{ width: '100%', maxWidth: 280 }}>
          <PrimaryButton onClick={onExit}>오답노트 목록으로</PrimaryButton>
        </div>
      </div>
    );
  }

  const nextStage = current.stage + 1;
  const easyLabel = nextStage >= REVIEW_INTERVALS.length ? '복습 졸업!' : `${REVIEW_INTERVALS[nextStage]}일 뒤 복습`;

  return (
    <div className="flex flex-col gap-3 p-4" style={{ flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)', textAlign: 'center' }}>
        복습 {idx + 1} / {queue.length}
      </div>

      <div className="flex flex-col items-center justify-center gap-4" style={{ flex: 1 }}>
        <div
          onClick={handleReveal}
          style={{
            width: '100%', maxWidth: 280, aspectRatio: '4/5', borderRadius: 24, position: 'relative',
            background: 'var(--tangerine-tint)', border: '1px solid var(--tangerine)', cursor: revealed ? 'default' : 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, textAlign: 'center',
          }}
        >
          <span
            style={{
              position: 'absolute', top: 14, left: 14, fontSize: 11, fontWeight: 700, color: 'var(--tangerine)',
              background: 'var(--paper)', border: '1px solid var(--tangerine)', borderRadius: 999, padding: '3px 9px',
            }}
          >
            {REVIEW_INTERVALS[current.stage]}일 간격
          </span>
          <div style={{ fontSize: 48 }}>{current.word.emoji}</div>
          <div className="font-display" style={{ fontSize: 30, color: 'var(--ink)' }}>{current.word.en}</div>
          {revealed && <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink-soft)' }}>{current.word.kr}</div>}
        </div>

        {!revealed && (
          <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700 }}>카드를 탭해서 뜻을 확인하세요 👆</div>
        )}

        {revealed && (
          <div className="flex gap-2.5" style={{ width: '100%', maxWidth: 280 }}>
            <button
              type="button"
              onClick={() => handleAssess('hard')}
              className="font-display flex flex-col items-center gap-0.5"
              style={{ flex: 1, border: '1.5px solid var(--berry)', background: 'var(--berry-tint)', color: 'var(--berry)', borderRadius: 14, padding: '13px 8px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
            >
              <span>😵 아직 헷갈려요</span>
              <small style={{ fontFamily: '"Malgun Gothic", sans-serif', fontWeight: 700, fontSize: 10.5, opacity: 0.8 }}>내일 다시</small>
            </button>
            <button
              type="button"
              onClick={() => handleAssess('easy')}
              className="font-display flex flex-col items-center gap-0.5"
              style={{ flex: 1, border: '1.5px solid var(--sprout)', background: 'var(--sprout-tint)', color: 'var(--sprout-deep)', borderRadius: 14, padding: '13px 8px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}
            >
              <span>😊 이제 알겠어요</span>
              <small style={{ fontFamily: '"Malgun Gothic", sans-serif', fontWeight: 700, fontSize: 10.5, opacity: 0.8 }}>{easyLabel}</small>
            </button>
          </div>
        )}
      </div>

      <MascotBubble text={bubble} />
    </div>
  );
}

function MascotBubble({ text }) {
  return (
    <div className="flex items-end gap-2.5" style={{ marginTop: 'auto' }}>
      <Mascot />
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '14px 14px 14px 4px', padding: '9px 12px', fontSize: 13, lineHeight: 1.4 }}>
        {text}
      </div>
    </div>
  );
}

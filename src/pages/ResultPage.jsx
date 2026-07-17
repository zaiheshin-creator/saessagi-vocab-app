import { useEffect, useState } from 'react';
import { useStore, getWordInfo } from '../store/useStore';
import Mascot from '../components/Mascot';
import PrimaryButton from '../components/PrimaryButton';

const R = 56;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function ResultPage() {
  const { lastResult, setActiveScreen } = useStore();
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)));
    return () => cancelAnimationFrame(t);
  }, []);

  if (!lastResult) {
    // 직접 URL 등으로 결과 화면에 진입한 경우 방어
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-4" style={{ flex: 1 }}>
        <p style={{ color: 'var(--ink-soft)' }}>아직 오늘의 테스트 결과가 없어요.</p>
        <PrimaryButton onClick={() => setActiveScreen('home')}>홈으로</PrimaryButton>
      </div>
    );
  }

  const { correct, total, exp, streak, batchWordNos, wrongWordNos = [] } = lastResult;
  const pct = Math.round((correct / total) * 100);
  const offset = animated ? CIRCUMFERENCE * (1 - correct / total) : CIRCUMFERENCE;
  const firstWord = batchWordNos?.length ? getWordInfo(batchWordNos[0]) : null;

  return (
    <div className="flex flex-col gap-5 p-4" style={{ flex: 1 }}>
      <div className="flex flex-col items-center justify-center gap-4 text-center" style={{ flex: 1 }}>
        <Mascot size={96} />
        <div style={{ fontSize: 19, fontWeight: 700 }}>오늘의 테스트 완료! 🎉</div>

        <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="140" height="140" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="65" cy="65" r={R} fill="none" stroke="var(--paper-sunk)" strokeWidth="10" />
            <circle
              cx="65" cy="65" r={R} fill="none" stroke="var(--sprout)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE} strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1s ease .2s' }}
            />
          </svg>
          <div className="font-display" style={{ position: 'absolute', fontSize: 30, color: 'var(--sprout-deep)' }}>{correct}/{total}</div>
          <div style={{ position: 'absolute', bottom: 34, fontSize: 11, color: 'var(--ink-soft)', fontWeight: 700 }}>정답률 {pct}%</div>
        </div>

        <div className="flex gap-2.5">
          <RewardChip color="var(--sun-tint)" border="var(--sun)" text={`+${exp} EXP`} textColor="#8a5a06" />
          <RewardChip color="var(--tangerine-tint)" border="var(--tangerine)" text={`${streak}일 연속!`} textColor="#a34c22" />
        </div>

        {firstWord && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 16, padding: '12px 16px', width: '100%', textAlign: 'left' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--sprout-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{firstWord.unitIcon}</div>
            <div>
              <b style={{ display: 'block', fontSize: 13.5 }}>오늘의 {firstWord.unitLabel} 단어 완료</b>
              <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{firstWord.level} {firstWord.levelName} · {firstWord.unitLabel} 유닛 {batchWordNos.length}단어 학습</span>
            </div>
          </div>
        )}

        {wrongWordNos.length > 0 && (
          <div style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
            {wrongWordNos.length}개는 오답노트에 저장됐어요 — 내일 다시 만나요 📖
          </div>
        )}
      </div>

      <PrimaryButton onClick={() => setActiveScreen('home')}>홈으로</PrimaryButton>
    </div>
  );
}

function RewardChip({ color, border, text, textColor }) {
  return (
    <div className="font-display" style={{ display: 'flex', alignItems: 'center', gap: 6, background: color, border: `1px solid ${border}`, color: textColor, borderRadius: 999, padding: '7px 12px', fontSize: 13, fontWeight: 700 }}>
      {text}
    </div>
  );
}

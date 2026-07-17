import { useMemo, useState } from 'react';
import { useStore, getWordInfo } from '../store/useStore';
import Mascot from '../components/Mascot';
import PrimaryButton from '../components/PrimaryButton';
import { withExtras, speak, shuffle } from '../utils/withExtras';

export default function LearnPage() {
  const { todayBatch, markWordFlipped, setActiveScreen } = useStore();
  const sessionWords = useMemo(() => todayBatch.map((no) => withExtras(getWordInfo(no))), [todayBatch]);
  const DICT_WORD = sessionWords[sessionWords.length - 1];
  const [stage, setStage] = useState(1);

  return (
    <div className="flex flex-col gap-3 p-4" style={{ flex: 1 }}>
      <div className="flex items-center justify-center gap-1" style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700 }}>
        <StageDot n={1} active={stage === 1} label="카드뒤집기" />
        <span style={{ color: 'var(--line)' }}>—</span>
        <StageDot n={2} active={stage === 2} label="매칭게임" />
        <span style={{ color: 'var(--line)' }}>—</span>
        <StageDot n={3} active={stage === 3} label="딕테이션" />
      </div>

      {stage === 1 && <FlashcardStage words={sessionWords} onLearn={markWordFlipped} onDone={() => setStage(2)} />}
      {stage === 2 && <MatchingStage words={sessionWords} onDone={() => setStage(3)} />}
      {stage === 3 && <DictationStage word={DICT_WORD} onDone={() => setActiveScreen('home')} />}
    </div>
  );
}

function StageDot({ n, active, label }) {
  return (
    <span style={{ color: active ? 'var(--sprout-deep)' : 'var(--ink-faint)' }}>
      {n}. {label}
    </span>
  );
}

function FlashcardStage({ words, onLearn, onDone }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const word = words[idx];

  function handleFlip() {
    if (!flipped) {
      setFlipped(true);
      onLearn(word.no);
    }
  }

  function handleNext() {
    if (idx + 1 < words.length) {
      setIdx(idx + 1);
      setFlipped(false);
    } else {
      onDone();
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-faint)', fontWeight: 700 }}>
        {flipped ? '다음으로 넘어가볼까요?' : '카드를 탭하면 뒤집혀요 👆'}
      </div>

      <div
        onClick={handleFlip}
        style={{ width: '100%', maxWidth: 280, aspectRatio: '4/5', perspective: 1200, cursor: 'pointer' }}
      >
        <div
          style={{
            position: 'relative', width: '100%', height: '100%',
            transition: 'transform .6s cubic-bezier(.4,.2,.2,1)',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'none',
          }}
        >
          <FaceFront word={word} />
          <FaceBack word={word} />
        </div>
      </div>

      <div className="flex gap-1.5">
        {words.map((_, i) => (
          <span
            key={i}
            style={{
              width: i === idx ? 9 : 7, height: i === idx ? 9 : 7, borderRadius: '50%',
              background: i < idx ? 'var(--sprout)' : i === idx ? 'var(--tangerine)' : 'var(--line)',
            }}
          />
        ))}
      </div>

      {flipped && (
        <div style={{ width: '100%', maxWidth: 280 }}>
          <PrimaryButton onClick={handleNext}>
            {idx + 1 < words.length ? '다음 단어' : '매칭 게임으로'}
          </PrimaryButton>
        </div>
      )}

      <MascotBubble text={`오늘은 ${words[0]?.unitLabel} 유닛 단어 ${words.length}개를 배워요!`} />
    </div>
  );
}

function FaceFront({ word }) {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, borderRadius: 24, backfaceVisibility: 'hidden',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: 20, textAlign: 'center', background: 'var(--sprout-tint)', border: '1px solid var(--sprout)',
      }}
    >
      <div style={{ fontSize: 52 }}>{word.emoji}</div>
      <div className="font-display" style={{ fontSize: 34, color: 'var(--sprout-deep)' }}>{word.en}</div>
      <button
        type="button"
        aria-label="발음 듣기"
        onClick={(e) => { e.stopPropagation(); speak(word.en); }}
        style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--sprout-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 9v6h4l5 5V4L8 9H4z" /><path d="M16 8.5a4.5 4.5 0 010 7" />
        </svg>
      </button>
    </div>
  );
}

function FaceBack({ word }) {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, borderRadius: 24, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
        padding: 20, textAlign: 'center', background: 'var(--sky-tint)', border: '1px solid var(--sky)',
      }}
    >
      <div className="font-display" style={{ fontSize: 22, color: 'var(--sky)' }}>{word.en}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)' }}>{word.kr}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-soft)', maxWidth: 220 }}>
        "{word.example}" — {word.exampleKr}
      </div>
    </div>
  );
}

function MatchingStage({ words, onDone }) {
  const chips = useMemo(() => {
    const en = words.map((w) => ({ key: `en-${w.no}`, pair: w.no, type: 'en', text: w.en }));
    const kr = words.map((w) => ({ key: `kr-${w.no}`, pair: w.no, type: 'kr', text: w.kr }));
    return shuffle([...en, ...kr]);
  }, [words]);

  const [selected, setSelected] = useState(null);
  const [matched, setMatched] = useState([]);
  const [shakeKeys, setShakeKeys] = useState([]);
  const [bubble, setBubble] = useState('영어와 뜻을 하나씩 눌러 짝지어봐요!');

  function handleClick(chip) {
    if (matched.includes(chip.pair)) return;
    if (!selected) {
      setSelected(chip);
      return;
    }
    if (selected.key === chip.key) {
      setSelected(null);
      return;
    }
    if (selected.pair === chip.pair) {
      const next = [...matched, chip.pair];
      setMatched(next);
      setSelected(null);
      setBubble(next.length >= words.length ? '완벽해요! 매칭 게임 끝! 🎉' : '정답이에요! 잘하고 있어요 🌿');
      if (next.length >= words.length) setTimeout(onDone, 700);
    } else {
      setShakeKeys([selected.key, chip.key]);
      setBubble('다시 한번 살펴볼까요?');
      setTimeout(() => { setShakeKeys([]); setSelected(null); }, 350);
    }
  }

  return (
    <div className="flex flex-col gap-3" style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 700, textAlign: 'center' }}>
        짝을 찾아 연결하세요 · <b className="font-display" style={{ color: 'var(--sprout-deep)' }}>{matched.length}</b> / {words.length} 완료
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {chips.map((chip) => {
          const isMatched = matched.includes(chip.pair);
          const isSelected = selected?.key === chip.key;
          const isShaking = shakeKeys.includes(chip.key);
          return (
            <button
              key={chip.key}
              onClick={() => handleClick(chip)}
              disabled={isMatched}
              className={chip.type === 'en' ? 'font-display' : ''}
              style={{
                border: '1.5px solid',
                borderColor: isMatched ? 'var(--sprout)' : isShaking ? 'var(--berry)' : isSelected ? 'var(--sky)' : 'var(--line)',
                background: isMatched ? 'var(--sprout-tint)' : isShaking ? 'var(--berry-tint)' : isSelected ? 'var(--sky-tint)' : 'var(--paper)',
                borderRadius: 14, padding: '14px 8px', fontSize: 14, fontWeight: 700,
                color: isMatched ? 'var(--sprout-deep)' : chip.type === 'en' ? 'var(--sprout-deep)' : 'var(--ink)',
                cursor: isMatched ? 'default' : 'pointer', textAlign: 'center', opacity: isMatched ? 0.55 : 1,
                transition: 'transform .15s ease',
                transform: isSelected ? 'scale(1.03)' : 'none',
              }}
            >
              {chip.text}
            </button>
          );
        })}
      </div>
      <MascotBubble text={bubble} />
    </div>
  );
}

function DictationStage({ word, onDone }) {
  const answer = word.en.split('');
  const keys = useMemo(() => shuffle([...answer, ...extraLetters(answer)]), [word]);
  const [filled, setFilled] = useState([]);
  const [usedIdx, setUsedIdx] = useState([]);
  const [bubble, setBubble] = useState('소리를 잘 듣고 글자를 눌러보세요!');
  const [playing, setPlaying] = useState(false);

  function handlePlay() {
    speak(word.en);
    setPlaying(true);
    setTimeout(() => setPlaying(false), 900);
  }

  function handleKey(letter, i) {
    if (usedIdx.includes(i) || filled.length >= answer.length) return;
    const next = [...filled, letter];
    setFilled(next);
    setUsedIdx([...usedIdx, i]);
    if (next.length === answer.length) {
      const correct = next.every((l, idx) => l === answer[idx]);
      setBubble(correct ? `완벽해요! ${word.en} 스펠링 성공 ${word.emoji}` : `아쉬워요, 정답은 ${word.en} 이에요`);
      setTimeout(onDone, 1400);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5" style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-soft)' }}>들려주는 단어를 받아써보세요</div>
      <div style={{ fontSize: 40 }}>{word.emoji}</div>
      <button
        type="button"
        onClick={handlePlay}
        aria-label="다시 듣기"
        style={{
          width: 84, height: 84, borderRadius: '50%', background: 'var(--sky)', border: 'none', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: playing ? '0 8px 0 #2c86ab, 0 0 0 14px rgba(63,169,214,0)' : '0 8px 0 #2c86ab',
          transition: 'box-shadow .5s ease',
        }}
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 9v6h4l5 5V4L8 9H4z" /><path d="M16 7a6 6 0 010 10" /><path d="M19 4.5a10 10 0 010 15" />
        </svg>
      </button>
      <div className="flex gap-2">
        {answer.map((_, i) => (
          <div
            key={i}
            style={{
              width: 40, height: 48, borderRadius: 10, border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 21,
              borderColor: filled[i] ? 'var(--sprout)' : i === filled.length ? 'var(--tangerine)' : 'var(--line)',
              background: filled[i] ? 'var(--sprout-tint)' : 'var(--paper)',
              color: 'var(--sprout-deep)',
            }}
          >
            {filled[i] || ''}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center" style={{ maxWidth: 280 }}>
        {keys.map((letter, i) => (
          <button
            key={i}
            onClick={() => handleKey(letter, i)}
            disabled={usedIdx.includes(i)}
            className="font-display"
            style={{
              width: 40, height: 40, borderRadius: 10, border: '1.5px solid var(--line)', background: 'var(--paper)',
              fontSize: 17, color: 'var(--ink)', cursor: 'pointer', visibility: usedIdx.includes(i) ? 'hidden' : 'visible',
            }}
          >
            {letter}
          </button>
        ))}
      </div>
      <MascotBubble text={bubble} />
    </div>
  );
}

function extraLetters(answer) {
  const pool = 'aeioustrn'.split('').filter((l) => !answer.includes(l));
  return shuffle(pool).slice(0, Math.max(0, 7 - answer.length));
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

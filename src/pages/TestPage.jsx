import { useMemo, useRef, useState } from 'react';
import { useStore, getWordInfo } from '../store/useStore';
import Mascot from '../components/Mascot';
import allWords from '../data/words.json';
import { withExtras, speak, shuffle } from '../utils/withExtras';

const wordsByLevel = allWords.reduce((acc, w) => {
  (acc[w.level] ||= []).push(w);
  return acc;
}, {});

function buildQuestions(todayBatch) {
  const sessionWords = todayBatch.map((no) => withExtras(getWordInfo(no)));
  return sessionWords.map((word, i) => {
    if (i % 2 === 0) {
      const pool = wordsByLevel[word.level] || allWords;
      const distractors = shuffle(pool.filter((w) => w.no !== word.no)).slice(0, 3).map((w) => w.kr);
      return { type: 'mcq', word, options: shuffle([word.kr, ...distractors]) };
    }
    return { type: 'spelling', word };
  });
}

export default function TestPage() {
  const { todayBatch, setActiveScreen, completeTest, loseHeart } = useStore();
  const [questions] = useState(() => buildQuestions(todayBatch));
  const [qi, setQi] = useState(0);
  const correctCountRef = useRef(0);
  const wrongNosRef = useRef([]);
  const q = questions[qi];

  function handleAnswered(isCorrect) {
    if (isCorrect) correctCountRef.current += 1;
    else {
      loseHeart();
      wrongNosRef.current.push(q.word.no);
    }
    setTimeout(() => {
      if (qi + 1 < questions.length) {
        setQi(qi + 1);
      } else {
        completeTest({ correct: correctCountRef.current, total: questions.length, wrongWordNos: wrongNosRef.current });
        setActiveScreen('result');
      }
    }, 900);
  }

  return (
    <div className="flex flex-col gap-3 p-4" style={{ flex: 1 }}>
      <div className="flex items-center justify-between font-display" style={{ fontSize: 13 }}>
        <span style={{ color: 'var(--ink-soft)' }}>문항 <b style={{ color: 'var(--sprout-deep)' }}>{qi + 1}</b> / {questions.length}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: 'var(--paper-sunk)', overflow: 'hidden' }}>
        <span style={{ display: 'block', height: '100%', borderRadius: 999, width: `${((qi + 1) / questions.length) * 100}%`, background: 'linear-gradient(90deg, var(--sky), #2c86ab)', transition: 'width .3s ease' }} />
      </div>

      {q.type === 'mcq' ? (
        <McqQuestion key={qi} q={q} onAnswered={handleAnswered} />
      ) : (
        <SpellingQuestion key={qi} q={q} onAnswered={handleAnswered} />
      )}
    </div>
  );
}

function McqQuestion({ q, onAnswered }) {
  const [picked, setPicked] = useState(null);
  const letters = ['A', 'B', 'C', 'D'];

  function pick(opt) {
    if (picked) return;
    setPicked(opt);
    onAnswered(opt === q.word.kr);
  }

  return (
    <div className="flex flex-col gap-3" style={{ flex: 1 }}>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20, padding: '22px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: 'var(--sky)', textTransform: 'uppercase' }}>이 단어의 뜻은?</div>
        <div className="font-display" style={{ fontSize: 30 }}>{q.word.en}</div>
        <div style={{ fontSize: 26 }}>{q.word.emoji}</div>
      </div>
      <div className="flex flex-col gap-2.5">
        {q.options.map((opt, i) => {
          const isCorrect = opt === q.word.kr;
          const show = picked !== null;
          const bg = show ? (isCorrect ? 'var(--sprout-tint)' : opt === picked ? 'var(--berry-tint)' : 'var(--paper)') : 'var(--paper)';
          const border = show ? (isCorrect ? 'var(--sprout)' : opt === picked ? 'var(--berry)' : 'var(--line)') : 'var(--line)';
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              disabled={picked !== null}
              style={{ appearance: 'none', textAlign: 'left', border: `1.5px solid ${border}`, background: bg, borderRadius: 14, padding: '13px 16px', fontSize: 15, color: 'var(--ink)', cursor: picked ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <span className="font-display" style={{ width: 24, height: 24, borderRadius: '50%', background: show && isCorrect ? 'var(--sprout)' : show && opt === picked ? 'var(--berry)' : 'var(--paper-sunk)', color: show && (isCorrect || opt === picked) ? '#fff' : 'var(--ink-soft)', fontSize: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {letters[i]}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      <MascotBubble text={picked === null ? '정답을 골라보세요!' : picked === q.word.kr ? '정답이에요! 잘했어요 🌿' : `아쉬워요, 정답은 ${q.word.en} = ${q.word.kr} 예요`} />
    </div>
  );
}

function SpellingQuestion({ q, onAnswered }) {
  const answer = q.word.en.split('');
  const keys = useMemo(() => shuffle([...answer, ...extraLetters(answer)]), [q]);
  const [filled, setFilled] = useState([]);
  const [usedIdx, setUsedIdx] = useState([]);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(null);

  function handleKey(letter, i) {
    if (usedIdx.includes(i) || filled.length >= answer.length) return;
    const next = [...filled, letter];
    setFilled(next);
    setUsedIdx([...usedIdx, i]);
  }

  function handleCheck() {
    if (filled.length < answer.length || done) return;
    const ok = filled.every((l, idx) => l === answer[idx]);
    setCorrect(ok);
    setDone(true);
    onAnswered(ok);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4" style={{ flex: 1 }}>
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 20, padding: '20px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', width: '100%' }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: 'var(--sky)', textTransform: 'uppercase' }}>뜻에 맞는 철자를 완성하세요</div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{q.word.kr}</div>
        <div style={{ fontSize: 24 }}>{q.word.emoji}</div>
        <button type="button" onClick={() => speak(q.word.en)} style={{ fontSize: 12, color: 'var(--sky)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          🔊 발음 듣기
        </button>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {answer.map((_, i) => (
          <div key={i} style={{ width: 38, height: 46, borderRadius: 10, border: '2px solid', borderColor: filled[i] ? 'var(--sky)' : 'var(--line)', background: filled[i] ? 'var(--sky-tint)' : 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka, sans-serif', fontWeight: 700, fontSize: 20, color: 'var(--sky)' }}>
            {filled[i] || ''}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center" style={{ maxWidth: 300 }}>
        {keys.map((letter, i) => (
          <button key={i} onClick={() => handleKey(letter, i)} disabled={usedIdx.includes(i) || done} className="font-display" style={{ width: 38, height: 38, borderRadius: 8, border: '1.5px solid var(--line)', background: 'var(--paper)', fontSize: 15, color: 'var(--ink)', cursor: 'pointer', visibility: usedIdx.includes(i) ? 'hidden' : 'visible' }}>
            {letter}
          </button>
        ))}
      </div>
      {!done && (
        <button type="button" onClick={handleCheck} className="font-display" style={{ appearance: 'none', border: 'none', width: '100%', padding: 13, borderRadius: 14, background: 'var(--sky)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 5px 0 #2c86ab' }}>
          확인하기
        </button>
      )}
      <MascotBubble text={!done ? '글자를 순서대로 눌러보세요!' : correct ? `완벽해요! ${q.word.en} 스펠링 성공 🎉` : `아쉬워요, 정답은 ${q.word.en} 이에요`} />
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
      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '14px 14px 14px 4px', padding: '9px 12px', fontSize: 13, lineHeight: 1.4, minHeight: 18 }}>
        {text}
      </div>
    </div>
  );
}

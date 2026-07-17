import { create } from 'zustand';
import curriculum from '../data/curriculum.json';

const STORAGE_KEY = 'saessagi_progress';

// 학년군별 일일 목표 단어 수 (02_학습목표.md 기준)
const DAILY_COUNT = { Lv1: 5, Lv2: 6, Lv3: 7, Lv4: 8 };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// 라이트너 간격반복: 오답(hard) → 1일 뒤로 리셋, 정답(easy) → 다음 단계로 진급, 7일 통과하면 큐에서 졸업
const REVIEW_INTERVALS = [1, 3, 7];

function computeTodayBatch(completedWordNos) {
  const completedSet = new Set(completedWordNos);
  const remaining = curriculum.filter((w) => !completedSet.has(w.no));
  if (remaining.length === 0) return [];
  const count = DAILY_COUNT[remaining[0].level] || 5;
  return remaining.slice(0, count).map((w) => w.no);
}

function loadProgress() {
  let raw;
  try {
    raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    raw = null;
  }
  const today = todayStr();
  // 예전 데이터 구조(completedWordNos 없이 학습앱을 썼던 경우)로부터도 안전하게 복구
  const saved = raw && Array.isArray(raw.completedWordNos) ? raw : null;
  if (!saved) {
    const base = { streak: raw?.streak ?? 0, hearts: 3, totalExp: raw?.totalExp ?? 0, completedWordNos: [], badges: raw?.badges ?? [], reviewQueue: raw?.reviewQueue ?? [] };
    return { ...base, lastActiveDate: today, todayBatch: computeTodayBatch(base.completedWordNos), todayFlipped: [], testDoneToday: false, lastResult: null };
  }
  if (!Array.isArray(saved.reviewQueue)) saved.reviewQueue = [];
  if (saved.lastActiveDate !== today) {
    // 새 날: 오늘 진도만 초기화, 하트 회복. 완료 단어(completedWordNos)는 계속 누적 유지
    return {
      ...saved,
      lastActiveDate: today,
      hearts: 3,
      todayBatch: computeTodayBatch(saved.completedWordNos),
      todayFlipped: [],
      testDoneToday: false,
      lastResult: null,
    };
  }
  return saved;
}

function saveProgress(state) {
  const { lastActiveDate, streak, hearts, totalExp, completedWordNos, todayBatch, todayFlipped, testDoneToday, lastResult, badges, reviewQueue } = state;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ lastActiveDate, streak, hearts, totalExp, completedWordNos, todayBatch, todayFlipped, testDoneToday, lastResult, badges, reviewQueue })
  );
}

export const useStore = create((set, get) => ({
  activeScreen: 'home', // home | learn | test | result
  setActiveScreen: (screen) => set({ activeScreen: screen }),

  ...loadProgress(),

  markWordFlipped: (wordNo) => {
    const todayFlipped = get().todayFlipped.includes(wordNo) ? get().todayFlipped : [...get().todayFlipped, wordNo];
    set({ todayFlipped });
    saveProgress(get());
  },

  loseHeart: () => {
    const hearts = Math.max(0, get().hearts - 1);
    set({ hearts });
    saveProgress(get());
  },

  completeTest: ({ correct, total, wrongWordNos = [] }) => {
    const exp = correct * 10;
    const streak = get().streak + 1;
    const totalExp = get().totalExp + exp;
    // 커리큘럼 진도는 정답/오답과 무관하게 오늘 배운 단어만큼 전진한다(새 단어 학습은 계속 이어져야 하므로).
    // 대신 틀린 단어는 별도의 복습 큐(reviewQueue)에 넣어 간격반복으로 다시 만나게 한다.
    const completedWordNos = [...get().completedWordNos, ...get().todayBatch];
    const today = todayStr();
    const wrongSet = new Set(wrongWordNos);
    const existingQueue = get().reviewQueue.filter((r) => !wrongSet.has(r.wordNo));
    const newEntries = wrongWordNos.map((wordNo) => ({ wordNo, dueDate: addDays(today, REVIEW_INTERVALS[0]), stage: 0, missCount: 1 }));
    const reviewQueue = [...existingQueue, ...newEntries];
    const lastResult = { correct, total, exp, streak, batchWordNos: get().todayBatch, wrongWordNos };
    set({ testDoneToday: true, totalExp, streak, lastResult, completedWordNos, reviewQueue });
    saveProgress(get());
  },

  // 오답노트 복습 화면에서 자기평가 결과를 반영한다: 'easy'면 다음 간격으로 진급(마지막 단계면 큐 졸업), 'hard'면 1일 뒤로 리셋
  reviewWord: (wordNo, result) => {
    const today = todayStr();
    const queue = get().reviewQueue;
    const entry = queue.find((r) => r.wordNo === wordNo);
    if (!entry) return;
    let next;
    if (result === 'easy') {
      const nextStage = entry.stage + 1;
      if (nextStage >= REVIEW_INTERVALS.length) {
        next = null; // 졸업: 큐에서 제거
      } else {
        next = { ...entry, stage: nextStage, dueDate: addDays(today, REVIEW_INTERVALS[nextStage]) };
      }
    } else {
      next = { ...entry, stage: 0, dueDate: addDays(today, REVIEW_INTERVALS[0]), missCount: entry.missCount + 1 };
    }
    const reviewQueue = next ? queue.map((r) => (r.wordNo === wordNo ? next : r)) : queue.filter((r) => r.wordNo !== wordNo);
    set({ reviewQueue });
    saveProgress(get());
  },
}));

export function getDueReviews(reviewQueue) {
  const today = todayStr();
  return reviewQueue.filter((r) => r.dueDate <= today);
}

export function getUpcomingReviews(reviewQueue) {
  const today = todayStr();
  return reviewQueue.filter((r) => r.dueDate > today).sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));
}

export function getWordInfo(wordNo) {
  return curriculum.find((w) => w.no === wordNo);
}

export function getCurriculumProgress(completedWordNos) {
  const total = curriculum.length;
  const done = completedWordNos.length;
  return { done, total, pct: Math.round((done / total) * 100) };
}

import { create } from 'zustand';
import curriculum from '../data/curriculum.json';
import units from '../data/units.json';

const STORAGE_KEY = 'saessagi_progress';

// 일일 학습 단어 수 기본값. 예전엔 레벨별로 5~8개씩 자동 조절했지만(02_학습목표.md),
// 마이페이지에서 사용자가 직접 설정할 수 있게 되면서 고정 기본값 + 사용자 설정으로 단순화했다.
const DEFAULT_DAILY_GOAL = 10;
const MIN_DAILY_GOAL = 3;
const MAX_DAILY_GOAL = 30;

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

function computeTodayBatch(completedWordNos, dailyGoal) {
  const completedSet = new Set(completedWordNos);
  const remaining = curriculum.filter((w) => !completedSet.has(w.no));
  if (remaining.length === 0) return [];
  return remaining.slice(0, dailyGoal || DEFAULT_DAILY_GOAL).map((w) => w.no);
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
    const dailyGoal = DEFAULT_DAILY_GOAL;
    const base = { streak: raw?.streak ?? 0, hearts: 3, totalExp: raw?.totalExp ?? 0, completedWordNos: [], badges: raw?.badges ?? [], reviewQueue: raw?.reviewQueue ?? [], dailyGoal };
    return { ...base, lastActiveDate: today, todayBatch: computeTodayBatch(base.completedWordNos, dailyGoal), todayFlipped: [], testDoneToday: false, lastResult: null };
  }
  if (!Array.isArray(saved.reviewQueue)) saved.reviewQueue = [];
  if (!saved.dailyGoal) saved.dailyGoal = DEFAULT_DAILY_GOAL;
  if (saved.lastActiveDate !== today) {
    // 새 날: 오늘 진도만 초기화, 하트 회복. 완료 단어(completedWordNos)는 계속 누적 유지
    return {
      ...saved,
      lastActiveDate: today,
      hearts: 3,
      todayBatch: computeTodayBatch(saved.completedWordNos, saved.dailyGoal),
      todayFlipped: [],
      testDoneToday: false,
      lastResult: null,
    };
  }
  return saved;
}

function saveProgress(state) {
  const { lastActiveDate, streak, hearts, totalExp, completedWordNos, todayBatch, todayFlipped, testDoneToday, lastResult, badges, reviewQueue, dailyGoal } = state;
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ lastActiveDate, streak, hearts, totalExp, completedWordNos, todayBatch, todayFlipped, testDoneToday, lastResult, badges, reviewQueue, dailyGoal })
  );
}

export const useStore = create((set, get) => ({
  activeScreen: 'home', // home | learn | test | result
  setActiveScreen: (screen) => set({ activeScreen: screen }),

  ...loadProgress(),

  // 마이페이지 설정에서 호출. 오늘 학습을 아직 시작 안 했으면(카드를 한 장도 안 넘겼으면) 오늘 배치에도
  // 바로 반영하고, 이미 학습 중/완료했으면 오늘 진행 중인 배치는 그대로 두고 내일부터 새 목표치를 적용한다.
  setDailyGoal: (n) => {
    const dailyGoal = Math.max(MIN_DAILY_GOAL, Math.min(MAX_DAILY_GOAL, Math.round(n) || DEFAULT_DAILY_GOAL));
    const patch = { dailyGoal };
    if (get().todayFlipped.length === 0 && !get().testDoneToday) {
      patch.todayBatch = computeTodayBatch(get().completedWordNos, dailyGoal);
    }
    set(patch);
    saveProgress(get());
  },

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
  // 배지 규칙: 한 유닛에 속한 단어가 completedWordNos에 전부 들어있으면 그 유닛 배지를 획득한 것으로 본다.
  // 이미 획득한 배지(badges)는 계속 남아있고, 새로 조건을 만족한 유닛만 추가한다(중복 추가 방지).
  syncBadges: () => {
    const earned = getEarnedBadgeUnitIds(get().completedWordNos);
    const existing = new Set(get().badges);
    const newlyEarned = earned.filter((unitId) => !existing.has(unitId));
    if (newlyEarned.length === 0) return;
    const badges = [...get().badges, ...newlyEarned];
    set({ badges });
    saveProgress(get());
  },

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

// 유닛별 단어 목록을 completedWordNos와 비교해, 유닛의 모든 단어를 다 배운 unitId 목록을 돌려준다.
// 마이페이지 배지함이 이 함수의 결과(또는 store의 badges 누적값)를 그대로 표시한다 — 가짜 데이터 없음.
export const DAILY_GOAL_BOUNDS = { min: MIN_DAILY_GOAL, max: MAX_DAILY_GOAL };

export function getEarnedBadgeUnitIds(completedWordNos) {
  const completedSet = new Set(completedWordNos);
  const byUnit = {};
  for (const w of curriculum) {
    (byUnit[w.unitId] ||= []).push(w.no);
  }
  return Object.keys(units).filter((unitId) => (byUnit[unitId] || []).every((no) => completedSet.has(no)) && (byUnit[unitId] || []).length > 0);
}

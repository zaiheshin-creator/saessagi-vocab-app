// words.json(레벨+카테고리 포함)을 바탕으로, 레벨별 유닛을 자동 구성하고
// 800단어 전체를 "학습 순서"로 정렬한 curriculum.json을 생성한다.
// 규칙(04_주제유닛_그룹화.md 4번 항목 반영): 레벨 내 카테고리 단어수가 8개 이상이면 독립 유닛,
// 미만이면 해당 레벨의 "기타 표현" 유닛으로 통합.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const words = JSON.parse(readFileSync(path.join(__dirname, '..', 'src', 'data', 'words.json'), 'utf-8'));

const ICONS = {
  가족_사람: '👪', 감정_상태: '😊', 감탄사_인사: '👋', 교통_장소: '🚌', 대명사: '🙋',
  동물: '🐾', 방향_위치: '🧭', 사물_도구: '🧰', 색깔: '🎨', 숫자_수량: '🔢',
  시간: '⏰', 신체: '👀', 옷_소지품: '👕', 음식: '🍎', 일반동사: '🏃',
  일반형용사: '✨', 자연_날씨: '🌤️', 집_가구: '🏠', 취미_예술: '🎵', 학교_물건: '✏️',
  핵심표현_문법: '📚',
};
const ETC_ICON = '🧩';
// 내부 분류명(자동분류 스크립트가 붙인 밑줄 표기)을 화면에 보여줄 자연스러운 이름으로 바꾼다.
// unitId/아이콘 매칭 등 내부 로직은 원래 category 값을 그대로 쓰고, label(화면 표시용)만 바꾼다.
const FRIENDLY_LABELS = {
  핵심표현_문법: '핵심 표현',
  사물_도구: '사물·도구',
  교통_장소: '교통·장소',
  자연_날씨: '자연·날씨',
  가족_사람: '가족·사람',
  취미_예술: '취미·예술',
};
const LEVEL_NAMES = { Lv1: '새싹 단계', Lv2: '새싹 단계 완성', Lv3: '도약 단계', Lv4: '도약 단계 완성' };
const MIN_UNIT_SIZE = 8;
// 핵심표현/대명사류는 늘 먼저 배우는 게 자연스러워 우선순위를 준다
const PRIORITY = ['핵심표현_문법', '대명사', '감탄사_인사'];

const levels = ['Lv1', 'Lv2', 'Lv3', 'Lv4'];
const unitsMeta = {};
const curriculum = [];

for (const level of levels) {
  const levelWords = words.filter((w) => w.level === level);
  const byCategory = new Map();
  for (const w of levelWords) {
    if (!byCategory.has(w.category)) byCategory.set(w.category, []);
    byCategory.get(w.category).push(w);
  }

  const qualifying = [];
  const etc = [];
  for (const [category, list] of byCategory) {
    // "기타"는 원 분류 단계의 미분류 캐치올이라 규모와 무관하게 항상 "기타 표현"으로 합친다
    if (category !== '기타' && list.length >= MIN_UNIT_SIZE) qualifying.push({ category, list });
    else etc.push(...list);
  }

  qualifying.sort((a, b) => {
    const pa = PRIORITY.indexOf(a.category);
    const pb = PRIORITY.indexOf(b.category);
    if (pa !== -1 || pb !== -1) return (pa === -1 ? 999 : pa) - (pb === -1 ? 999 : pb);
    return b.list.length - a.list.length; // 단어 많은 유닛(주력 유닛) 먼저
  });

  const unitList = [];
  qualifying.forEach(({ category, list }, i) => {
    const unitId = `${level}-${category}`;
    unitsMeta[unitId] = { id: unitId, level, label: FRIENDLY_LABELS[category] || category, icon: ICONS[category] || ETC_ICON, wordCount: list.length };
    unitList.push({ unitId, words: list.sort((a, b) => a.no - b.no) });
  });
  if (etc.length > 0) {
    const unitId = `${level}-기타표현`;
    unitsMeta[unitId] = { id: unitId, level, label: '기타 표현', icon: ETC_ICON, wordCount: etc.length };
    unitList.push({ unitId, words: etc.sort((a, b) => a.no - b.no) });
  }

  for (const { unitId, words: list } of unitList) {
    const unitLabel = unitsMeta[unitId].label;
    const unitIcon = unitsMeta[unitId].icon;
    for (const w of list) {
      curriculum.push({ ...w, unitId, unitLabel, unitIcon, levelName: LEVEL_NAMES[level] });
    }
  }
}

writeFileSync(path.join(__dirname, '..', 'src', 'data', 'curriculum.json'), JSON.stringify(curriculum, null, 2), 'utf-8');
writeFileSync(path.join(__dirname, '..', 'src', 'data', 'units.json'), JSON.stringify(unitsMeta, null, 2), 'utf-8');

console.log(`curriculum.json: ${curriculum.length}단어, units.json: ${Object.keys(unitsMeta).length}개 유닛`);
for (const level of levels) {
  const levelUnits = Object.values(unitsMeta).filter((u) => u.level === level);
  console.log(`  ${level}: ${levelUnits.map((u) => `${u.label}(${u.wordCount})`).join(', ')}`);
}

// data/raw의 CSV 두 개(레벨 배정 + 주제 분류)를 조인해 src/data/words.json 생성
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = path.join(__dirname, '..', 'data', 'raw');
const OUT_DIR = path.join(__dirname, '..', 'src', 'data');

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const header = lines[0].split(';');
  return lines.slice(1).map((line) => {
    const cols = line.split(';');
    const row = {};
    header.forEach((h, i) => { row[h] = cols[i]; });
    return row;
  });
}

const levelRows = parseCsv(readFileSync(path.join(RAW_DIR, 'data_800단어_레벨배정.csv'), 'utf-8'));
const categoryRows = parseCsv(readFileSync(path.join(RAW_DIR, 'data_800단어_주제분류.csv'), 'utf-8'));

const categoryByNo = new Map(categoryRows.map((r) => [r.no, r.category]));

const words = levelRows.map((r) => ({
  no: Number(r.no),
  en: r.spelling,
  kr: r.meaning,
  level: r.level,
  category: categoryByNo.get(r.no) || '기타',
}));

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(path.join(OUT_DIR, 'words.json'), JSON.stringify(words, null, 2), 'utf-8');

console.log(`words.json 생성 완료: ${words.length}개 단어`);

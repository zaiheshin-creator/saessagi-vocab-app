/**
 * Play Store 피처 그래픽(1024x500) 생성 — 새싹이 마스코트 + 앱 이름
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../store-assets');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#3FAE68"/>
      <stop offset="100%" stop-color="#2E8F52"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>

  <!-- 은은한 원형 장식 -->
  <circle cx="900" cy="80" r="140" fill="#ffffff" opacity="0.06"/>
  <circle cx="120" cy="430" r="100" fill="#ffffff" opacity="0.06"/>

  <!-- 마스코트 (오른쪽) -->
  <g transform="translate(770 90) scale(4.2)">
    <ellipse cx="24" cy="30" rx="15" ry="13" fill="#E4F5EA"/>
    <path d="M24 17c-2-6 2-10 8-10-1 6-3 9-8 10z" fill="#7ED9A3"/>
    <path d="M24 17c2-6-2-10-8-10 1 6 3 9 8 10z" fill="#56C382"/>
    <circle cx="19" cy="30" r="2.2" fill="#26362B"/>
    <circle cx="29" cy="30" r="2.2" fill="#26362B"/>
    <path d="M19 35q5 4 10 0" stroke="#26362B" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>

  <!-- 텍스트 -->
  <text x="72" y="220" font-family="'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif" font-size="64" font-weight="700" fill="#FFFFFF">새싹이와</text>
  <text x="72" y="300" font-family="'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif" font-size="64" font-weight="700" fill="#FFFFFF">오늘의 단어</text>
  <text x="74" y="350" font-family="'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif" font-size="26" font-weight="700" fill="#E4F5EA">초등 영단어 800 · 오프라인 학습 · 광고 없음</text>
</svg>`;

async function main() {
  const { mkdirSync } = await import('node:fs');
  mkdirSync(OUT, { recursive: true });
  await sharp(Buffer.from(svg)).resize(1024, 500).png().toFile(path.join(OUT, 'feature-graphic.png'));
  console.log('✓ feature-graphic.png (1024x500) →', OUT);
}

main();

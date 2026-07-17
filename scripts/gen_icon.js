/**
 * 앱 아이콘 생성 스크립트
 * SVG(새싹이 마스코트) → PNG (192x192, 512x512, apple-touch-icon)
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../public');

function makeSvg(size) {
  const r = Math.round(size * 0.22);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="${(r / size) * 100}" fill="#3FAE68"/>
  <ellipse cx="50" cy="62" rx="30" ry="26" fill="#E4F5EA"/>
  <path d="M50 34c-4-12 4-20 16-20-2 12-6 18-16 20z" fill="#56C382"/>
  <path d="M50 34c4-12-4-20-16-20 2 12 6 18 16 20z" fill="#2E8F52"/>
  <circle cx="40" cy="62" r="4.5" fill="#26362B"/>
  <circle cx="60" cy="62" r="4.5" fill="#26362B"/>
  <path d="M40 71q10 8 20 0" stroke="#26362B" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;
}

async function generate(size, filename) {
  const svg = Buffer.from(makeSvg(size));
  const outPath = path.join(OUT, filename);
  await sharp(svg).resize(size, size).png().toFile(outPath);
  console.log(`✓ ${filename} (${size}×${size})`);
}

(async () => {
  await generate(192, 'icon-192.png');
  await generate(512, 'icon-512.png');
  await generate(180, 'apple-touch-icon.png');
  console.log('아이콘 생성 완료 →', OUT);
})();

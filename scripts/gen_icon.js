/**
 * 앱 아이콘 생성 스크립트
 * SVG(새싹이 마스코트) → PNG (192x192, 512x512, apple-touch-icon)
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../public');

function makeSvg(size, { maskable = false } = {}) {
  const r = maskable ? 0 : Math.round(size * 0.22);
  // 마스커블 아이콘은 OS가 원형/사각형 등으로 잘라낼 수 있어, 내용을 안전 영역(중앙 약 66%)
  // 안쪽으로 축소해 배치한다. 배경은 모서리까지 꽉 채운다(자체 둥근 모서리 없음 — OS가 처리).
  const scale = maskable ? 0.66 : 1;
  const shift = (100 - 100 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="${(r / size) * 100}" fill="#3FAE68"/>
  <g transform="translate(${shift} ${shift}) scale(${scale})">
    <ellipse cx="50" cy="62" rx="30" ry="26" fill="#E4F5EA"/>
    <path d="M50 34c-4-12 4-20 16-20-2 12-6 18-16 20z" fill="#56C382"/>
    <path d="M50 34c4-12-4-20-16-20 2 12 6 18 16 20z" fill="#2E8F52"/>
    <circle cx="40" cy="62" r="4.5" fill="#26362B"/>
    <circle cx="60" cy="62" r="4.5" fill="#26362B"/>
    <path d="M40 71q10 8 20 0" stroke="#26362B" stroke-width="4" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;
}

async function generate(size, filename, opts) {
  const svg = Buffer.from(makeSvg(size, opts));
  const outPath = path.join(OUT, filename);
  await sharp(svg).resize(size, size).png().toFile(outPath);
  console.log(`✓ ${filename} (${size}×${size})`);
}

(async () => {
  await generate(192, 'icon-192.png');
  await generate(512, 'icon-512.png');
  await generate(180, 'apple-touch-icon.png');
  await generate(192, 'icon-192-maskable.png', { maskable: true });
  await generate(512, 'icon-512-maskable.png', { maskable: true });
  console.log('아이콘 생성 완료 →', OUT);
})();

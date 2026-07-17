// 레벨별 성장 파라미터: 레벨이 올라갈수록 몸집(scale)이 커지고 색이 조금씩 짙어진다.
// Lv3부터는 잎이 하나 더 생겨 "더 자란" 느낌을 준다. level을 안 넘기면 기존 Lv1 모습 그대로.
const LEVEL_SCALE = { Lv1: 1, Lv2: 1.06, Lv3: 1.13, Lv4: 1.2 };
const LEVEL_COLORS = {
  Lv1: { body: '#3FAE68', leafL: '#56C382', leafR: '#2E8F52' },
  Lv2: { body: '#399F5F', leafL: '#4FB878', leafR: '#297C48' },
  Lv3: { body: '#2E8F52', leafL: '#47AC6C', leafR: '#1F6E3D' },
  Lv4: { body: '#237A42', leafL: '#3D9C5E', leafR: '#155C31' },
};

export default function Mascot({ size = 44, level }) {
  const scale = level ? (LEVEL_SCALE[level] || 1) : 1;
  const colors = level ? (LEVEL_COLORS[level] || LEVEL_COLORS.Lv1) : LEVEL_COLORS.Lv1;
  const showExtraLeaf = level === 'Lv3' || level === 'Lv4';

  const bodyRx = 15 * scale;
  const bodyRy = 13 * scale;
  const eyeOffset = 5 * scale;
  const mouthHalf = 5 * scale;

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <g>
        <ellipse cx="24" cy="30" rx={bodyRx} ry={bodyRy} fill={colors.body} />
        <path d="M24 17c-2-6 2-10 8-10-1 6-3 9-8 10z" fill={colors.leafL} />
        <path d="M24 17c2-6-2-10-8-10 1 6 3 9 8 10z" fill={colors.leafR} />
        {showExtraLeaf && (
          <path d="M24 18c-1-5-6-7-11-5 2 5 6 6 11 5z" fill={colors.leafR} opacity="0.9" />
        )}
        <circle cx={24 - eyeOffset} cy="30" r="2.2" fill="#26362B" />
        <circle cx={24 + eyeOffset} cy="30" r="2.2" fill="#26362B" />
        <path
          d={`M${24 - mouthHalf} 35q${mouthHalf} 4 ${mouthHalf * 2} 0`}
          stroke="#26362B"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

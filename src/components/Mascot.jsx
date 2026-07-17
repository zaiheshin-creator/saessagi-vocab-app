export default function Mascot({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <g>
        <ellipse cx="24" cy="30" rx="15" ry="13" fill="#3FAE68" />
        <path d="M24 17c-2-6 2-10 8-10-1 6-3 9-8 10z" fill="#56C382" />
        <path d="M24 17c2-6-2-10-8-10 1 6 3 9 8 10z" fill="#2E8F52" />
        <circle cx="19" cy="30" r="2.2" fill="#26362B" />
        <circle cx="29" cy="30" r="2.2" fill="#26362B" />
        <path d="M19 35q5 4 10 0" stroke="#26362B" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

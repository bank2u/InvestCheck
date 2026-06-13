import './AllocationChart.css';

interface AllocationItem {
  name: string;
  percentage: number;
  color: string;
}

interface Props {
  allocations: AllocationItem[];
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startDeg: number,
  endDeg: number
): string {
  const gapDeg = 1.5;
  const s = startDeg + gapDeg / 2;
  const e = endDeg - gapDeg / 2;
  if (e <= s) return '';

  const o1 = polarToCartesian(cx, cy, outerR, s);
  const o2 = polarToCartesian(cx, cy, outerR, e);
  const i1 = polarToCartesian(cx, cy, innerR, e);
  const i2 = polarToCartesian(cx, cy, innerR, s);
  const largeArc = e - s > 180 ? 1 : 0;

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${i2.x} ${i2.y}`,
    'Z',
  ].join(' ');
}

export default function AllocationChart({ allocations }: Props) {
  const nonZero = allocations
    .filter((a) => a.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  const total = nonZero.reduce((sum, a) => sum + a.percentage, 0);
  const scale = total > 0 ? 100 / total : 1;

  const cx = 100, cy = 100, outerR = 80, innerR = 50;
  let currentDeg = 0;

  const segments = nonZero.map((item) => {
    const sweep = ((item.percentage * scale) / 100) * 360;
    const path = describeArc(cx, cy, outerR, innerR, currentDeg, currentDeg + sweep);
    currentDeg += sweep;
    return { ...item, path };
  });

  return (
    <div className="allocation-chart">
      <svg
        viewBox="0 0 200 200"
        className="donut-svg"
        role="img"
        aria-label="กราฟการจัดสรรเงินลงทุน"
      >
        <title>กราฟการจัดสรรเงินลงทุน</title>
        {segments.map((seg) => (
          <path key={seg.name} d={seg.path} fill={seg.color} />
        ))}
      </svg>

      <div className="donut-legend">
        {nonZero.map((item) => (
          <div key={item.name} className="legend-row">
            <span className="legend-swatch" style={{ backgroundColor: item.color }} />
            <span className="legend-name">{item.name}</span>
            <span className="legend-pct">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

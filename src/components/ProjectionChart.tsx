import { useMemo } from 'react';
import { YearlyProjection } from '../utils/projectionCalculations';
import { getReturnRateByLevel } from '../utils/getReturnRateByLevel';
import { RiskLevel } from '../types';
import './ProjectionChart.css';

interface Props {
  projections: YearlyProjection[];
  years: number;
  riskLevel: RiskLevel;
}

const W = 360;
const H = 240;
const PAD = { top: 16, right: 12, bottom: 36, left: 56 };

function formatK(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return String(value);
}

export default function ProjectionChart({ projections, years, riskLevel }: Props) {
  const investmentReturnPercent = (getReturnRateByLevel(riskLevel) * 100).toFixed(1);

  const { xScale, yScale, maxBalance, gridValues } = useMemo(() => {
    if (!projections || projections.length === 0) {
      return { xScale: () => 0, yScale: () => 0, maxBalance: 0, gridValues: [] };
    }

    const maxBal = Math.max(
      ...projections.map((p) => Math.max(p.investmentBalance, p.bankBalance))
    );

    const xRange = W - PAD.left - PAD.right;
    const yRange = H - PAD.top - PAD.bottom;
    const maxYear = projections[projections.length - 1].year;

    const xs = (year: number) => PAD.left + (year / maxYear) * xRange;
    const ys = (balance: number) => H - PAD.bottom - (balance / maxBal) * yRange;

    // Nice round grid values
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxBal)));
    const step = Math.ceil(maxBal / magnitude / 4) * magnitude;
    const grids = [0, 1, 2, 3, 4].map((i) => i * step).filter((v) => v <= maxBal * 1.05);

    return { xScale: xs, yScale: ys, maxBalance: maxBal, gridValues: grids };
  }, [projections, years]);

  if (!projections || projections.length === 0) {
    return <div className="chart-empty">กรุณาใส่จำนวนเงินเพื่อดูการคาดการณ์</div>;
  }

  const investmentPoints = projections
    .map((p) => `${xScale(p.year)},${yScale(p.investmentBalance)}`)
    .join(' ');

  const bankPoints = projections
    .map((p) => `${xScale(p.year)},${yScale(p.bankBalance)}`)
    .join(' ');

  // X-axis labels: show ~5 evenly spaced labels
  const xLabels = projections.filter((_, i) => {
    const total = projections.length;
    const step = Math.max(1, Math.floor(total / 5));
    return i % step === 0 || i === total - 1;
  });

  return (
    <div className="projection-chart">
      {/* Return rate badges */}
      <div className="chart-rates">
        <div className="rate-badge investment-rate">
          <span className="rate-number">{investmentReturnPercent}%</span>
          <span className="rate-desc">ผลตอบแทนลงทุน/ปี</span>
        </div>
        <div className="rate-badge bank-rate">
          <span className="rate-number">1.4%</span>
          <span className="rate-desc">ผลตอบแทนเงินฝาก/ปี</span>
        </div>
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="chart-svg"
        role="img"
        aria-label="กราฟเปรียบเทียบการลงทุน"
      >
        {/* Grid lines + Y labels */}
        {gridValues.map((v, i) => {
          const y = yScale(v);
          return (
            <g key={`grid-${i}`}>
              <line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke={v === 0 ? '#d1d5db' : '#f3f4f6'}
                strokeWidth={v === 0 ? 1.5 : 1}
              />
              <text
                x={PAD.left - 6}
                y={y + 4}
                textAnchor="end"
                fontSize="14"
                fill="#9ca3af"
                fontFamily="inherit"
              >
                {formatK(v)}
              </text>
            </g>
          );
        })}

        {/* Y-axis line */}
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={H - PAD.bottom}
          stroke="#e5e7eb"
          strokeWidth="1"
        />

        {/* Bank line (behind) */}
        <polyline
          points={bankPoints}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6 3"
        />

        {/* Investment line (front) */}
        <polyline
          points={investmentPoints}
          fill="none"
          stroke="#0066cc"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis labels */}
        {xLabels.map((p) => (
          <text
            key={`x-${p.year}`}
            x={xScale(p.year)}
            y={H - PAD.bottom + 20}
            textAnchor="middle"
            fontSize="13"
            fill="#9ca3af"
            fontFamily="inherit"
          >
            {p.year}ปี
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-line investment-line" />
          <span className="legend-label">ลงทุนตามความเสี่ยง</span>
        </div>
        <div className="legend-item">
          <span className="legend-line bank-line" />
          <span className="legend-label">เงินฝากธนาคาร 1.4%</span>
        </div>
      </div>
    </div>
  );
}

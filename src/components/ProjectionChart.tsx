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

export default function ProjectionChart({ projections, years, riskLevel }: Props) {
  const investmentReturnPercent = (getReturnRateByLevel(riskLevel) * 100).toFixed(1);
  const bankReturnPercent = '1.4';
  if (!projections || projections.length === 0) {
    return <div className="chart-empty">กรุณาใส่จำนวนเงินเพื่อดูการคาดการณ์</div>;
  }

  const chartDimensions = useMemo(() => {
    const maxBalance = Math.max(
      ...projections.map((p) => Math.max(p.investmentBalance, p.bankBalance))
    );

    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = 600;
    const height = 300;

    const xScale = (year: number) => {
      const xRange = width - padding.left - padding.right;
      return padding.left + (year / years) * xRange;
    };

    const yScale = (balance: number) => {
      const yRange = height - padding.top - padding.bottom;
      return height - padding.bottom - (balance / maxBalance) * yRange;
    };

    return { xScale, yScale, maxBalance, padding, width, height };
  }, [projections, years]);

  const { xScale, yScale, maxBalance, padding, width, height } = chartDimensions;

  const investmentPath = projections
    .map((p) => `${xScale(p.year)},${yScale(p.investmentBalance)}`)
    .join(' L ');

  const bankPath = projections
    .map((p) => `${xScale(p.year)},${yScale(p.bankBalance)}`)
    .join(' L ');

  const yAxisMax = Math.ceil(maxBalance / 100000) * 100000;

  return (
    <div className="projection-chart">
      <div className="chart-return-rates">
        <div className="return-rate-item">
          <span className="return-rate-label">ผลตอบแทนลงทุน:</span>
          <span className="return-rate-value investment">{investmentReturnPercent}%</span>
        </div>
        <div className="return-rate-item">
          <span className="return-rate-label">ผลตอบแทนเงินฝาก:</span>
          <span className="return-rate-value bank">{bankReturnPercent}%</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" preserveAspectRatio="xMidYMid meet">
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = yAxisMax * ratio;
          const y = yScale((value / yAxisMax) * maxBalance);
          return (
            <g key={`y-label-${i}`}>
              <line x1={padding.left - 4} y1={y} x2={padding.left} y2={y} stroke="#ddd" />
              <text x={padding.left - 8} y={y} textAnchor="end" fontSize="11" fill="#6b7280">
                {Math.round(value / 1000)}K
              </text>
            </g>
          );
        })}

        {/* Y-axis line */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={300 - padding.bottom}
          stroke="#ddd"
          strokeWidth="1"
        />

        {/* X-axis line */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#ddd"
          strokeWidth="1"
        />

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = yScale((ratio / 1) * maxBalance);
          return (
            <line
              key={`grid-${i}`}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="#f5f5f5"
              strokeWidth="1"
            />
          );
        })}

        {/* Investment line */}
        <polyline
          points={investmentPath}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bank deposit line */}
        <polyline
          points={bankPath}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis labels (every 2 years) */}
        {projections
          .filter((p) => p.year % 2 === 0)
          .map((p) => (
            <text
              key={`x-label-${p.year}`}
              x={xScale(p.year)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {p.year}ปี
            </text>
          ))}
      </svg>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#10b981' }} />
          <span className="legend-label">ลงทุนตามความเสี่ยง</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#9ca3af' }} />
          <span className="legend-label">เงินฝากธนาคาร</span>
        </div>
      </div>
    </div>
  );
}

import { RiskLevel } from '../types';
import './ProjectionSummary.css';

interface Props {
  investmentBalance: number;
  bankBalance: number;
  years: number;
  riskLevel: RiskLevel;
}

const riskColors: Record<RiskLevel, string> = {
  1: '#EF4444',
  2: '#F97316',
  3: '#FBBF24',
  4: '#3B82F6',
  5: '#1E40AF',
};

export default function ProjectionSummary({
  investmentBalance,
  bankBalance,
  years,
  riskLevel,
}: Props) {
  const difference = investmentBalance - bankBalance;
  const percentageGain = bankBalance > 0 ? ((difference / bankBalance) * 100).toFixed(1) : '0';

  return (
    <div
      className="projection-summary"
      style={{ borderLeftColor: riskColors[riskLevel] }}
    >
      <div className="summary-header">หลังจาก {years} ปี</div>

      <div className="summary-row">
        <span className="summary-label">ลงทุนตามความเสี่ยง:</span>
        <span className="summary-value">฿{investmentBalance.toLocaleString('th-TH')}</span>
      </div>

      <div className="summary-row">
        <span className="summary-label">เงินฝากธนาคาร:</span>
        <span className="summary-value">฿{bankBalance.toLocaleString('th-TH')}</span>
      </div>

      <div className="summary-divider" />

      <div className="summary-row highlight">
        <span className="summary-label">💰 เงินเพิ่มเติม:</span>
        <span className="summary-value gain">
          ฿{difference.toLocaleString('th-TH')} (+{percentageGain}%)
        </span>
      </div>
    </div>
  );
}

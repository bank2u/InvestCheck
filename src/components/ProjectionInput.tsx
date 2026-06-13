import { RiskLevel } from '../types';
import { getMaxProjectionYears } from '../utils/getMaxProjectionYears';
import './ProjectionInput.css';

interface Props {
  monthlyAmount: number;
  selectedYear: number;
  userAge: number;
  riskLevel: RiskLevel;
  onAmountChange: (amount: number) => void;
  onYearChange: (year: number) => void;
}

export default function ProjectionInput({
  monthlyAmount,
  selectedYear,
  userAge,
  onAmountChange,
  onYearChange,
}: Props) {
  const maxYear = getMaxProjectionYears(userAge);

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    const amount = value ? parseInt(value, 10) : 0;
    onAmountChange(amount);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value, 10);
    onYearChange(year);
  };

  return (
    <div className="projection-input">
      <div className="input-group">
        <label className="input-label">จำนวนเงินออมต่อเดือน</label>
        <div className="currency-input-wrapper">
          <span className="currency-symbol">฿</span>
          <input
            type="text"
            inputMode="numeric"
            className="currency-input"
            placeholder="ใส่จำนวนเงิน"
            value={monthlyAmount.toLocaleString()}
            onChange={handleAmountInput}
          />
        </div>
        {monthlyAmount === 0 && <div className="input-error">กรุณาใส่จำนวนเงิน</div>}
      </div>

      <div className="slider-group">
        <label className="slider-label">
          ระยะเวลาการลงทุน: <span className="slider-value">{selectedYear} ปี</span>
        </label>
        <input
          type="range"
          min={5}
          max={maxYear}
          value={selectedYear}
          onChange={handleYearChange}
          className="year-slider"
        />
        <div className="slider-marks">
          <span>5</span>
          <span>{Math.floor(maxYear / 2)}</span>
          <span>{maxYear}</span>
        </div>
      </div>
    </div>
  );
}

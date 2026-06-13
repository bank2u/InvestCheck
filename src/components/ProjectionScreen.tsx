import { useState, useRef, useEffect } from 'react';
import { RiskLevel } from '../types';
import { useProjectionCalculator } from '../hooks/useProjectionCalculator';
import { getMaxProjectionYears } from '../utils/getMaxProjectionYears';
import { getFinalProjection } from '../utils/projectionCalculations';
import ProjectionInput from './ProjectionInput';
import ProjectionChart from './ProjectionChart';
import ProjectionSummary from './ProjectionSummary';
import './ProjectionScreen.css';

interface Props {
  riskLevel: RiskLevel;
  userAge: number;
  onBack: () => void;
}

export default function ProjectionScreen({ riskLevel, userAge, onBack }: Props) {
  const maxYear = getMaxProjectionYears(userAge);
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [selectedYear, setSelectedYear] = useState(10);
  const chartSectionRef = useRef<HTMLDivElement>(null);

  const projections = useProjectionCalculator(monthlyAmount, selectedYear, riskLevel);
  const finalProjection = getFinalProjection(projections, selectedYear);

  useEffect(() => {
    if (monthlyAmount > 0 && chartSectionRef.current) {
      setTimeout(() => {
        chartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [monthlyAmount]);

  return (
    <div className="projection-screen">
      <div className="projection-header">
        <button className="back-button" onClick={onBack}>
          ← กลับไปผลลัพธ์
        </button>
        <h2 className="projection-title">💡 ดูการลงทุนของคุณ</h2>
      </div>

      <ProjectionInput
        monthlyAmount={monthlyAmount}
        selectedYear={selectedYear}
        userAge={userAge}
        riskLevel={riskLevel}
        onAmountChange={setMonthlyAmount}
        onYearChange={setSelectedYear}
      />

      <div className="chart-section" ref={chartSectionRef}>
        {monthlyAmount > 0 && (
          <>
            <ProjectionSummary
              investmentBalance={finalProjection?.investmentBalance || 0}
              bankBalance={finalProjection?.bankBalance || 0}
              years={selectedYear}
              riskLevel={riskLevel}
            />
            <ProjectionChart projections={projections} years={selectedYear} />
          </>
        )}
      </div>
    </div>
  );
}

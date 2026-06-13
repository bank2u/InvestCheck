import { useMemo } from 'react';
import { RiskLevel } from '../types';
import { calculateProjections, YearlyProjection } from '../utils/projectionCalculations';
import { getReturnRateByLevel } from '../utils/getReturnRateByLevel';

export function useProjectionCalculator(
  monthlyAmount: number,
  years: number,
  riskLevel: RiskLevel
): YearlyProjection[] {
  const returnRate = getReturnRateByLevel(riskLevel);

  const projections = useMemo(() => {
    if (monthlyAmount <= 0 || years < 5) {
      return [];
    }
    return calculateProjections(monthlyAmount, years, returnRate);
  }, [monthlyAmount, years, returnRate]);

  return projections;
}

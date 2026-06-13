import { useMemo } from 'react';
import { calculateProjections } from '../utils/projectionCalculations';
import { getReturnRateByLevel } from '../utils/getReturnRateByLevel';
export function useProjectionCalculator(monthlyAmount, years, riskLevel) {
    const returnRate = getReturnRateByLevel(riskLevel);
    const projections = useMemo(() => {
        if (monthlyAmount <= 0 || years < 5) {
            return [];
        }
        return calculateProjections(monthlyAmount, years, returnRate);
    }, [monthlyAmount, years, returnRate]);
    return projections;
}

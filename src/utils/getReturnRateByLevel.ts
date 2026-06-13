import { RiskLevel } from '../types';

export function getReturnRateByLevel(riskLevel: RiskLevel): number {
  const rates: Record<RiskLevel, number> = {
    1: 0.025,  // 2.5%
    2: 0.045,  // 4.5%
    3: 0.065,  // 6.5%
    4: 0.085,  // 8.5%
    5: 0.10,   // 10%
  };
  return rates[riskLevel];
}

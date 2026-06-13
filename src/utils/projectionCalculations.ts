export interface YearlyProjection {
  year: number;
  investmentBalance: number;
  bankBalance: number;
}

export function calculateProjections(
  monthlyAmount: number,
  years: number,
  annualInvestmentReturn: number
): YearlyProjection[] {
  const bankReturnRate = 0.014; // 1.4%
  const results: YearlyProjection[] = [];

  // Convert annual rates to monthly rates
  const monthlyInvestmentRate = Math.pow(1 + annualInvestmentReturn, 1 / 12) - 1;
  const monthlyBankRate = Math.pow(1 + bankReturnRate, 1 / 12) - 1;

  let investmentBalance = 0;
  let bankBalance = 0;

  for (let year = 0; year <= years; year++) {
    results.push({
      year,
      investmentBalance: Math.round(investmentBalance),
      bankBalance: Math.round(bankBalance),
    });

    // Process 12 months of deposits with monthly compounding
    for (let month = 0; month < 12 && year < years; month++) {
      investmentBalance = investmentBalance * (1 + monthlyInvestmentRate) + monthlyAmount;
      bankBalance = bankBalance * (1 + monthlyBankRate) + monthlyAmount;
    }
  }

  return results;
}

export function getFinalProjection(projections: YearlyProjection[], year: number) {
  return projections.find((p) => p.year === year) || projections[projections.length - 1];
}

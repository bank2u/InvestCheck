// Test for useProjectionCalculator hook behavior
// This test verifies the hook logic without needing React test utilities

// Mock implementation of the calculation utilities
const getReturnRateByLevel = (riskLevel) => {
  const rates = {
    1: 0.025,
    2: 0.045,
    3: 0.065,
    4: 0.085,
    5: 0.10,
  };
  return rates[riskLevel];
};

const calculateProjections = (monthlyAmount, years, annualInvestmentReturn) => {
  const bankReturnRate = 0.014;
  const results = [];

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

    for (let month = 0; month < 12 && year < years; month++) {
      investmentBalance = investmentBalance * (1 + monthlyInvestmentRate) + monthlyAmount;
      bankBalance = bankBalance * (1 + monthlyBankRate) + monthlyAmount;
    }
  }

  return results;
};

// Hook logic (extracted for testing)
const useProjectionCalculator = (monthlyAmount, years, riskLevel) => {
  const returnRate = getReturnRateByLevel(riskLevel);

  // Simulate useMemo behavior
  if (monthlyAmount <= 0 || years < 5) {
    return [];
  }
  return calculateProjections(monthlyAmount, years, returnRate);
};

// Tests
console.log('Testing useProjectionCalculator Hook\n');

// Test 1: Returns empty array if monthlyAmount is 0
console.log('Test 1: monthlyAmount = 0');
const result1 = useProjectionCalculator(0, 10, 3);
console.log(`  Expected: []`);
console.log(`  Got: [${result1.length} items]`);
console.log(`  PASS: ${result1.length === 0}\n`);

// Test 2: Returns empty array if monthlyAmount is negative
console.log('Test 2: monthlyAmount = -100 (negative)');
const result2 = useProjectionCalculator(-100, 10, 3);
console.log(`  Expected: []`);
console.log(`  Got: [${result2.length} items]`);
console.log(`  PASS: ${result2.length === 0}\n`);

// Test 3: Returns empty array if years < 5
console.log('Test 3: years = 4 (less than 5)');
const result3 = useProjectionCalculator(1000, 4, 3);
console.log(`  Expected: []`);
console.log(`  Got: [${result3.length} items]`);
console.log(`  PASS: ${result3.length === 0}\n`);

// Test 4: Returns projections for valid inputs
console.log('Test 4: Valid inputs (monthlyAmount=1000, years=10, riskLevel=3)');
const result4 = useProjectionCalculator(1000, 10, 3);
console.log(`  Expected: array with 11 items (years 0-10)`);
console.log(`  Got: [${result4.length} items]`);
console.log(`  PASS: ${result4.length === 11}`);
if (result4.length > 0) {
  console.log(`  First year (year 0): ${JSON.stringify(result4[0])}`);
  console.log(`  Final year (year 10): ${JSON.stringify(result4[result4.length - 1])}`);
}
console.log();

// Test 5: Verify calculations are correct for risk level 3
console.log('Test 5: Verify return rate calculation (riskLevel=3 should be 6.5%)');
const returnRate = getReturnRateByLevel(3);
console.log(`  Expected return rate: 0.065 (6.5%)`);
console.log(`  Got: ${returnRate}`);
console.log(`  PASS: ${returnRate === 0.065}\n`);

// Test 6: Different risk levels should produce different results
console.log('Test 6: Different risk levels produce different projections');
const resultLevel1 = useProjectionCalculator(1000, 10, 1);
const resultLevel5 = useProjectionCalculator(1000, 10, 5);
const finalBalanceL1 = resultLevel1[resultLevel1.length - 1].investmentBalance;
const finalBalanceL5 = resultLevel5[resultLevel5.length - 1].investmentBalance;
console.log(`  Level 1 final balance: ${finalBalanceL1}`);
console.log(`  Level 5 final balance: ${finalBalanceL5}`);
console.log(`  Level 5 > Level 1: ${finalBalanceL5 > finalBalanceL1}`);
console.log(`  PASS: ${finalBalanceL5 > finalBalanceL1}\n`);

// Test 7: Minimum valid years (5 years)
console.log('Test 7: Minimum valid years (years=5)');
const result7 = useProjectionCalculator(1000, 5, 3);
console.log(`  Expected: array with 6 items (years 0-5)`);
console.log(`  Got: [${result7.length} items]`);
console.log(`  PASS: ${result7.length === 6}\n`);

console.log('All tests completed!');

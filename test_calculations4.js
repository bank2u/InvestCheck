// Test the monthly compounding approach
function calculateProjections(monthlyAmount, years, annualInvestmentReturn) {
  const bankReturnRate = 0.014; // 1.4%
  const results = [];

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

// Test with monthly ฿5,000, 10 years, 6.5% return
const projections = calculateProjections(5000, 10, 0.065);

console.log("Year 0:");
console.log(`  Investment: ฿${projections[0].investmentBalance} (expected ≈฿0)`);
console.log(`  Bank: ฿${projections[0].bankBalance} (expected ≈฿0)`);

console.log("\nYear 1:");
console.log(`  Investment: ฿${projections[1].investmentBalance} (expected ≈฿61,825)`);
console.log(`  Bank: ฿${projections[1].bankBalance} (expected ≈฿60,840)`);

console.log("\nYear 10:");
console.log(`  Investment: ฿${projections[10].investmentBalance} (expected ≈฿700,000)`);
console.log(`  Bank: ฿${projections[10].bankBalance} (expected ≈฿632,000)`);

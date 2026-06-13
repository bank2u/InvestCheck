// Test the projection calculations
function calculateProjections(monthlyAmount, years, annualInvestmentReturn) {
  const bankReturnRate = 0.014; // 1.4%
  const results = [];

  let investmentBalance = 0;
  let bankBalance = 0;

  for (let year = 0; year <= years; year++) {
    results.push({
      year,
      investmentBalance: Math.round(investmentBalance),
      bankBalance: Math.round(bankBalance),
    });

    // Add monthly deposits (12 months) and apply returns
    const yearlyDeposit = monthlyAmount * 12;
    investmentBalance = investmentBalance * (1 + annualInvestmentReturn) + yearlyDeposit;
    bankBalance = bankBalance * (1 + bankReturnRate) + yearlyDeposit;
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

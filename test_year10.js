// Let's trace through more carefully and check different approaches
function calculateProjections(monthlyAmount, years, annualInvestmentReturn) {
  const bankReturnRate = 0.014;
  const monthlyInvestmentRate = Math.pow(1 + annualInvestmentReturn, 1 / 12) - 1;
  const monthlyBankRate = Math.pow(1 + bankReturnRate, 1 / 12) - 1;

  let investmentBalance = 0;
  let bankBalance = 0;

  const yearlyData = [];
  for (let year = 0; year <= years; year++) {
    yearlyData.push({ year, inv: investmentBalance, bank: bankBalance });

    for (let month = 0; month < 12 && year < years; month++) {
      investmentBalance = investmentBalance * (1 + monthlyInvestmentRate) + monthlyAmount;
      bankBalance = bankBalance * (1 + monthlyBankRate) + monthlyAmount;
    }
  }
  return yearlyData;
}

const data = calculateProjections(5000, 10, 0.065);
console.log("Year-by-year breakdown:");
data.forEach(d => {
  console.log(`Year ${d.year}: Inv=฿${Math.round(d.inv)}, Bank=฿${Math.round(d.bank)}`);
});

// Check ratio at year 10
console.log(`\nYear 10 Investment / Expected (833512 / 700000) = ${(833512 / 700000).toFixed(3)}`);
console.log(`Expected might use a lower return rate...`);

// What return rate would give 700,000?
// Let's solve backwards
function findReturnRate() {
  const monthlyAmount = 5000;
  const targetYear10 = 700000;
  
  for (let annualRate = 0.01; annualRate < 0.12; annualRate += 0.001) {
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    let balance = 0;
    for (let month = 0; month < 120; month++) {
      balance = balance * (1 + monthlyRate) + monthlyAmount;
    }
    if (balance >= targetYear10 - 1000 && balance <= targetYear10 + 1000) {
      console.log(`\nReturn rate ${(annualRate * 100).toFixed(2)}% gives Year 10 balance of ฿${Math.round(balance)}`);
    }
  }
}
findReturnRate();

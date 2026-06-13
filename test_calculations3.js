// Testing different calculation approaches
const monthlyAmount = 5000;
const annualReturn = 0.065;
const bankReturn = 0.014;

// Expected Year 1: 61825
// If we deposit 60000 (5000*12) and apply interest mid-year:
// 60000 * (1 + 0.065/2) = 60000 * 1.0325 = 61950
console.log("Approach 1 (half-year compounding):");
console.log("  Investment: " + Math.round(60000 * (1 + 0.065/2)));
console.log("  Bank: " + Math.round(60000 * (1 + 0.014/2)));

// Or maybe deposits spread throughout the year with average 6-month holding:
// Average balance = 30000 after 6 months, earns 0.065 * 6/12 = 0.0325
// Final = 60000 + (30000 * 0.0325) = 60000 + 1950 = 61950
console.log("\nApproach 2 (deposits throughout year, avg 6 months):");
let invBal = 60000 * (1 + 0.065 * 0.5);
let bankBal = 60000 * (1 + 0.014 * 0.5);
console.log("  Investment: " + Math.round(invBal));
console.log("  Bank: " + Math.round(bankBal));

// Actual expected: 61825
// 60000 * x = 61825
// x = 1.030416...
console.log("\nExpected multiplier for 61825:");
console.log("  Rate implied: " + (61825/60000 - 1).toFixed(6));

// That's 3.04%, which is 6.5% * 0.468 (roughly half a year)
// Or it could be monthly compounding: FV = 60000 * (1.065^(1/12))^12 but that's wrong

// Let me try: deposits at beginning, 1 return period for 60000
// Then add the balance and see what rate gives 61825
// Actually, if deposits happen mid-year on average:
// Each monthly deposit earns interest for average 6 months
// First deposit (month 1): earns for 11.5 months
// Last deposit (month 12): earns for 0.5 months
// Average: 6 months
// But the way the code works is: add deposit, then apply returns
// So 60000 at beginning of year gets full return:
// 60000 * 1.065 = 63900

console.log("\nTrying formula: deposits spread, each compounds");
// If we use monthly deposits with monthly compounding:
let monthlyRate = Math.pow(1 + 0.065, 1/12) - 1;
let balance = 0;
for (let month = 0; month < 12; month++) {
  balance = balance * (1 + monthlyRate) + monthlyAmount;
}
console.log("  Monthly compounding: " + Math.round(balance));

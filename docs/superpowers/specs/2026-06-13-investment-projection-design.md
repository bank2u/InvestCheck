# Investment Projection Calculator — Design Specification

**Date:** 2026-06-13  
**Project:** Thai Investment Questionnaire — Phase 2  
**Feature:** Investment Projection & Savings Simulator  
**Scope:** New screen after results showing projected returns over time

---

## 1. Overview

After users complete the risk assessment questionnaire and see their risk profile, they can access an **Investment Projection Calculator** to visualize how their monthly savings would grow over time when invested according to their risk level—compared to saving in a bank deposit at 1.4% interest.

### Purpose
- Help non-investment users understand the **tangible benefit of investing** vs. pure bank savings
- Provide an **interactive sandbox** to explore different savings amounts and time horizons
- Use **historical Thai market returns** for credibility
- Keep experience **mobile-first, simple, non-technical**

### Success Criteria
- Users can input monthly savings amount and adjust projection timeframe
- Chart clearly shows investment advantage growing over time
- All calculations happen client-side (no API calls)
- Mobile-responsive and WCAG AA accessible

---

## 2. User Journey

**Entry Point:**  
On the Results Screen (after completing questionnaire), below the fund recommendations, add button:
```
💡 ดูการลงทุนของคุณใน 10 ปี
(See your 10-year projection)
```

**Flow:**
1. User taps button → navigates to **ProjectionScreen**
2. ProjectionScreen displays:
   - Input section (monthly savings field + year slider)
   - Chart section (two-line chart + summary card)
3. User adjusts monthly amount or year slider → chart updates in real-time
4. User taps "← กลับไปผลลัพธ์" (Back to results) → returns to ResultsScreen

---

## 3. Input Section Design

**Location:** Top of ProjectionScreen  
**Height:** ~120–150px (minimal, not overwhelming)

### Monthly Savings Input
- **Label:** "จำนวนเงินออมต่อเดือน" (Monthly savings amount)
- **Field Type:** Currency input with ฿ symbol prefix
- **Placeholder:** "ใส่จำนวนเงิน" (Enter amount)
- **Min:** ฿0, **Max:** ฿1,000,000
- **Validation:**
  - Reject negative numbers
  - Reject non-numeric input (except ฿ and comma separators)
  - If ฿0: show message "กรุณาใส่จำนวนเงิน" (Please enter amount)
- **Default:** ฿5,000 (reasonable starting point for Thai Gen Y/Z)

### Year Slider
- **Label:** "ระยะเวลาการลงทุน: X ปี" (Investment period: X years)
- **Range:** 5 to (90 - user's age from Q1), default 10
- **Step:** 1 year
- **Visual:** Standard range slider with year markers (5, 10, 15, 20, etc.)
- **Display:** Show selected year value below slider

**Age Calculation:**
- Q1 from questionnaire captures age brackets; use midpoint or specific age if available
- Example: If user is 35, slider goes 5–55 years
- Example: If user is 55, slider goes 5–35 years

---

## 4. Chart Section Design

**Chart Type:** Two-line XY chart (SVG or lightweight library like Recharts)

### Chart Specifications
- **X-Axis:** Years (0 to max slider value, step 1)
- **Y-Axis:** Thai Baht (฿), auto-scaled based on max projection value
- **Line 1 (Investment):** Green (#10b981), solid, 2–3px stroke
  - Label: "ลงทุนตามความเสี่ยง" (Investing at your risk level)
- **Line 2 (Bank Deposit):** Gray (#9ca3af), solid, 2–3px stroke
  - Label: "เงินฝากธนาคาร 1.4%" (Bank deposit at 1.4%)
- **Legend:** Below chart, showing both lines with labels
- **Responsive:** Chart rescales for mobile (stacked on small screens if needed)

### Summary Card (Above Chart)
**Background:** Light color matching risk level (#f5f5f5)  
**Border-left:** 4px solid, color = risk level color

**Content:**
```
หลังจาก [X] ปี
━━━━━━━━━━━━━━━━
ลงทุนตามความเสี่ยง:    ฿[amount formatted]
เงินฝากธนาคาร:         ฿[amount formatted]
━━━━━━━━━━━━━━━━
💰 เงินเพิ่มเติม:      ฿[difference] (+X%)
```

**Example:**
```
หลังจาก 10 ปี
━━━━━━━━━━━━━━━━
ลงทุนตามความเสี่ยง:    ฿700,000
เงินฝากธนาคาร:         ฿632,000
━━━━━━━━━━━━━━━━
💰 เงินเพิ่มเติม:      ฿68,000 (+10.8%)
```

---

## 5. Data & Calculations

### Return Rates by Risk Level
Based on historical Thai market performance:

| Risk Level | Thai Name | Annual Return |
|-----------|-----------|---|
| 1 | เสี่ยงต่ำ | 2.5% |
| 2 | เสี่ยงปานกลางค่อนข้างต่ำ | 4.5% |
| 3 | เสี่ยงปานกลางค่อนข้างสูง | 6.5% |
| 4 | เสี่ยงสูง | 8.5% |
| 5 | เสี่ยงสูงมาก | 10% |

**Bank Deposit Baseline:** 1.4% (annual, fixed)

### Projection Formula
For each year (t = 1 to selected_years):
```
Investment_Balance[t] = Investment_Balance[t-1] × (1 + annual_return) + (monthly_savings × 12)
Bank_Balance[t] = Bank_Balance[t-1] × 1.014 + (monthly_savings × 12)
```

**Starting:** Investment_Balance[0] = ฿0, Bank_Balance[0] = ฿0

### Example Calculation
- Monthly savings: ฿5,000
- Risk Level 3 (6.5% return)
- Period: 10 years

| Year | Investment | Bank (1.4%) | Difference |
|------|-----------|-----------|-----------|
| 0 | ฿0 | ฿0 | ฿0 |
| 1 | ฿61,825 | ฿60,840 | ฿985 |
| 5 | ฿334,000 | ฿309,000 | ฿25,000 |
| 10 | ฿700,000 | ฿632,000 | ฿68,000 |

---

## 6. Technical Architecture

### New Components

**ProjectionScreen.tsx**
- Parent container for projection feature
- Manages state: `monthlyAmount`, `selectedYear`, `riskLevel` (from parent)
- Renders: ProjectionInput + ProjectionChart + ProjectionSummary
- Provides "Back to results" button at top/bottom

**ProjectionInput.tsx**
- Currency input field with validation
- Year slider with range calculation
- Triggers `onInputChange` callback to recalculate chart data
- Responsive layout (stacked on mobile)

**ProjectionChart.tsx**
- Renders two-line chart (Investment vs Bank)
- Receives `projectionData` array with yearly calculations
- Uses SVG or lightweight charting (Recharts, Chart.js, or custom SVG)
- Responsive canvas sizing

**ProjectionSummary.tsx**
- Displays summary card above chart
- Shows final balances and difference
- Color-coded based on risk level

### Utility Functions

**useProjectionCalculator.ts** (Custom Hook)
```typescript
interface ProjectionData {
  year: number;
  investmentBalance: number;
  bankBalance: number;
}

function useProjectionCalculator(
  monthlyAmount: number,
  years: number,
  riskLevel: RiskLevel
): ProjectionData[]
```
Returns array of yearly projections.

**getReturnRateByLevel.ts**
```typescript
function getReturnRateByLevel(riskLevel: RiskLevel): number
```
Maps risk level 1–5 to annual return percentage.

**getMaxProjectionYears.ts**
```typescript
function getMaxProjectionYears(ageFromQ1: number): number
```
Calculates max year slider value (90 - age, min 5).

### Data Flow
```
ResultsScreen
  ↓ (riskLevel passed as prop)
ProjectionScreen
  ├─ ProjectionInput (monthlyAmount, year) 
  │   ↓ onChange
  │   useProjectionCalculator(monthlyAmount, year, riskLevel)
  │   ↓ returns projectionData[]
  ├─ ProjectionChart (projectionData)
  │   Renders two-line chart
  └─ ProjectionSummary (projectionData, year)
      Shows final numbers + difference
```

### Integration with Existing Code
- Add ProjectionScreen to App.tsx routing (new screen after results)
- Pass `riskLevel` and `userAge` from ResultsScreen to ProjectionScreen
- "See projection" button on ResultsScreen navigates to ProjectionScreen
- Use existing color tokens for chart lines and summary card

---

## 7. Edge Cases & Error Handling

| Case | Behavior |
|------|----------|
| User enters ฿0 | Show "กรุณาใส่จำนวนเงิน" validation message |
| Non-numeric input | Strip non-numeric chars, keep only digits |
| Negative number | Reject, show error |
| User age 88+ | Slider max becomes 5–7 years |
| Very large savings (>฿1M) | Allow, recalculate normally |
| Slider at min (5 years) | Chart shows 5-year projection |
| Chart render fails | Show fallback message + table view |

---

## 8. Accessibility & Mobile

**Mobile-First:**
- Input section: stacked layout (input above slider)
- Chart: responsive canvas, scales to viewport width
- Touch targets: slider handle ≥44px, input field tap target ≥44px
- No horizontal scrolling

**Accessibility (WCAG AA):**
- Input field has associated label
- Slider has keyboard controls (arrow keys adjust year)
- Chart has alt text: "Chart comparing investment returns vs bank deposit"
- Color not the only indicator (legend + line styles distinguish lines)
- Contrast: all text ≥4.5:1

**Reduced Motion:**
- Chart rendering: no animation on load
- If `prefers-reduced-motion: reduce`, skip any transitions

---

## 9. Testing Scope

**Unit Tests:**
- `getReturnRateByLevel()` returns correct rate for each level
- `useProjectionCalculator()` calculates correct balances
- Input validation rejects invalid amounts

**Integration Tests:**
- ProjectionScreen receives riskLevel from parent correctly
- Chart updates when monthlyAmount or year changes
- Summary card shows correct final numbers

**Manual Testing:**
- Mobile (iPhone SE, iPad): layout responsive, no overflow
- Different risk levels: chart lines scale appropriately
- Year slider at min/max: calculations correct
- Input field: accepts valid amounts, rejects invalid

---

## 10. Future Enhancements (Out of Scope)

- Export projection as PDF
- Save multiple scenarios and compare side-by-side
- Inflation adjustment option
- Expense/withdrawal scenarios
- Integration with actual brokerage APIs

---

## Design Principles Applied

✅ **Mobile-first** — Inputs and chart stack vertically  
✅ **Show, don't tell** — Chart visualizes benefit better than text  
✅ **Practical Thai language** — All labels in simple Thai, no jargon  
✅ **Accessible** — WCAG AA, keyboard controls, color + text distinction  
✅ **Client-side only** — No backend, all calculations in browser  
✅ **Non-intimidating** — Friendly summary card, encouraging tone

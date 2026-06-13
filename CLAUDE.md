# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Thai Investment Risk Assessment Questionnaire

A **self-assessment web app** for Thai users to determine their investment risk profile. Single-page React app, no backend, deployed on GitHub Pages.

### Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Key Commands

- `npm run dev` — Start local dev server (Vite), typically http://localhost:5173
- `npm run build` — Build static files to `dist/`
- `npm run preview` — Preview production build locally
- `npm run test` — Run unit/integration tests (if configured)
- `npm run lint` — Check code style

### Run a Single Test
```bash
npm test -- <test-file-name>
```

---

## Architecture & Design

### User Journey

1. User lands on app → **Screen 1**: Answer Q1-Q2 (age + financial burden)
2. **Screen 2**: Answer Q3-Q4 (savings status + investment experience)
3. **Screen 3**: Answer Q5-Q6 (investment timeline + goals)
4. **Screen 4**: Answer Q7-Q9 (risk comfort + loss tolerance) — *Q7 includes diverging bar chart*
5. **Screen 5**: Answer Q10 (scenario response)
6. **Results Screen**: Display risk profile (Level 1–5), asset allocations, recommendations
7. User can tap "ทำแบบทดสอบใหม่" to restart

### Scoring System

- **10 questions**, each scored 1–4 points (ก=1, ข=2, ค=3, ง=4)
- **Total score**: 10–40
- **Risk Levels**:
  - < 15: Level 1 (เสี่ยงต่ำ)
  - 15–21: Level 2 (เสี่ยงปานกลางค่อนข้างต่ำ)
  - 22–29: Level 3 (เสี่ยงปานกลางค่อนข้างสูง)
  - 30–36: Level 4 (เสี่ยงสูง)
  - ≥ 37: Level 5 (เสี่ยงสูงมาก)

### Key Components

- **QuestionScreen.tsx** — Renders a screen with 2–3 grouped questions
- **AnswerButton.tsx** — Individual multiple-choice button (ก, ข, ค, ง)
- **Chart.tsx** — SVG diverging bar chart for Q7 (risk/reward visualization)
- **ResultsScreen.tsx** — Display risk profile + asset allocations + recommendations
- **scoring.ts** — Score calculation and risk level determination
- **allocations.ts** — Asset allocation percentages (ตราสารหนี้, ตราสารทุน, etc.) by risk level
- **recommendations.ts** — Recommendation text and descriptions for each level

### Data Structure

```typescript
// Questions
type Question = {
  id: number;
  screen: 1 | 2 | 3 | 4 | 5;
  text: string;
  answers: { label: string; value: string }[];
}

// User Answers
type Answers = Record<number, 1 | 2 | 3 | 4>;

// Risk Level
type RiskLevel = 1 | 2 | 3 | 4 | 5;

// Asset Allocations (by level)
type Allocations = {
  [level in RiskLevel]: {
    debt: number;     // ตราสารหนี้
    equity: number;   // ตราสารทุน
    cash: number;     // เงินฝาก
    alternative: number; // การลงทุนทางเลือก
  }
}
```

---

## Design & UI

### Visual Style

- **Font**: Noto Sans Thai (Google Fonts)
- **Color Scheme**:
  - Primary: #0066cc (blue buttons)
  - Positive (gains in chart): Light orange → dark orange (#f4d5a8 → #f08a4a)
  - Negative (losses in chart): Light red → dark red (#d97a6a → #a83a2a)
  - Neutral: #f5f5f5 (backgrounds), #ddd (borders)
- **Layout**: Mobile-first, responsive 320px–768px
- **Button Height**: ≥ 44px (touch-friendly)
- **Spacing**: 16px standard padding

### Q7 Chart (Diverging Bar Chart)

Shows 4 investment groups with:
- X-axis: Groups 1–4
- Y-axis: -20% to +30%
- Bars above 0%: Gains (orange), below: Losses (red)
- Example: Group 4 shows +25% gain bar, -15% loss bar
- Legend: "กำไร" (gain), "ขาดทุน" (loss)

### Results Screen Layout

1. **Risk Profile Card** — Colored left border, level name + score range
2. **Asset Allocation Grid** — 2×2 grid of colored boxes (ตราสารหนี้, ตราสารทุน, เงินฝาก, ทางเลือก) with percentages
3. **Recommendation Text** — 2–3 sentences explaining risk level + suggested actions
4. **Start Over Button** — "ทำแบบทดสอบใหม่"

---

## Tech Stack

- **React 18+** with TypeScript
- **Vite** (build tool)
- **Noto Sans Thai** (Google Fonts)
- **Plain CSS** (no Tailwind/styled-components)
- **GitHub Pages** (static deployment, no backend)

### No Backend, No Database

- All logic runs client-side
- Scoring computed in browser
- No API calls
- No user data persistence (results are view-only, session-scoped)

---

## Important Notes

### Language & Accessibility

- **Thai-only** for this MVP (all UI text in Thai)
- English financial terms are acceptable (ตราสาร, etc.) or parenthesized
- Designed for **Gen Y/Z** — clean, modern, not corporate-feeling
- All button/form text simplified for non-investment professionals

### Deployment

- Deploy to GitHub Pages: Static `dist/` directory
- Build script should output to `dist/`
- GitHub Actions can automate build + deploy on push
- No server infrastructure needed

### Questions & Scoring

- Q1–Q10 are fixed (see design spec for exact wording)
- Scoring: straightforward 1–4 per question
- No weighted scoring; all questions equally important
- Out of scope: Questions 11–12 (compliance questions) are not included

### Results Data

Asset allocations by risk level are fixed (see `allocations.ts`):

| Level | ตราสารหนี้ | ตราสารทุน | เงินฝาก | ทางเลือก |
|-------|-----------|----------|--------|---------|
| 1 | >60% | <5% | <20% | <10% |
| 2 | <70% | <10% | <20% | <10% |
| 3 | <60% | <10% | <30% | <10% |
| 4 | <40% | <20% | <10% | <40% |
| 5 | <30% | <30% | <5% | >60% |

---

## Testing

- Unit tests: Score calculation, risk level mapping
- Integration tests: Full questionnaire flow → results display
- Manual testing: Mobile device (320px+), touch interactions
- Visual regression: Especially Q7 chart alignment and colors

---

## Future Enhancements (Out of Current Scope)

- Export results as PDF
- Share results via link
- Questions 11–12 (derivatives/currency risk assessment)
- Multi-language support
- User accounts + result history
- Analytics integration
- Advisor notes field (for B2B use)

---

## Design Specification

Full design document: `docs/superpowers/specs/2026-06-13-thai-investment-questionnaire-design.md`

Covers: user flow, scoring system, Q7 chart details, component structure, colors, typography, accessibility, deployment.

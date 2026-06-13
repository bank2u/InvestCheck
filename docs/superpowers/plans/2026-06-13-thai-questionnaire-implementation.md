# Thai Investment Questionnaire Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working React questionnaire app with 5 screens, scoring system, and personalized results display, deployable to GitHub Pages.

**Architecture:** Single-page React app using React hooks for state management. Five question screens (2-3 questions each), followed by a results screen. All scoring/logic client-side. Styling with plain CSS, Noto Sans Thai font from Google Fonts. Static build deployed to GitHub Pages.

**Tech Stack:** React 18+, TypeScript, Vite, CSS (no frameworks), Google Fonts (Noto Sans Thai), GitHub Pages

---

## File Structure

```
src/
├── App.tsx                          # Main app component, state & routing
├── components/
│   ├── QuestionScreen.tsx           # Renders one screen (2-3 questions)
│   ├── AnswerButton.tsx             # Single answer option button
│   ├── ProgressBar.tsx              # Shows screen progress (e.g., "ข้อ 2 of 5")
│   ├── Chart.tsx                    # Q7 diverging bar chart (SVG)
│   ├── ResultsScreen.tsx            # Results display
│   └── AllocationGrid.tsx           # Asset allocation 2x2 grid
├── data/
│   ├── questions.ts                 # Questions array with metadata
│   ├── allocations.ts               # Asset allocation percentages by risk level
│   ├── recommendations.ts           # Risk level descriptions & tips
│   └── scoring.ts                   # Score → risk level mapping
├── types/
│   └── index.ts                     # TypeScript types
├── styles/
│   ├── main.css                     # Global styles, Noto Sans Thai setup
│   ├── components.css               # Component-specific styles
│   └── responsive.css               # Mobile/responsive breakpoints
├── index.tsx                        # App entry point
├── index.html                       # HTML shell
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript config
└── package.json                     # Dependencies, scripts, build config
```

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/index.tsx`

### Step 1: Create package.json with dependencies

```json
{
  "name": "thai-investment-questionnaire",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "gh-pages": "^6.0.0"
  }
}
```

- [ ] **Step 1.1: Create package.json**

Save the JSON above to `/Volumes/mydata/playground/pre-invest-test/package.json`

- [ ] **Step 1.2: Run npm install**

```bash
cd /Volumes/mydata/playground/pre-invest-test
npm install
```

Expected: `node_modules/` directory created, `package-lock.json` generated

### Step 2: Create Vite config

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  base: '/',  // Change to repo name if deploying to subdirectory (e.g., '/thai-questionnaire/')
})
```

- [ ] **Step 2.1: Create vite.config.ts**

Save the TypeScript above to `vite.config.ts`

### Step 3: Create TypeScript config

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3.1: Create tsconfig.json**

Save the JSON above to `tsconfig.json`

### Step 4: Create HTML shell

```html
<!DOCTYPE html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>แบบประเมินความเสี่ยงในการลงทุน</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;500;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4.1: Create index.html**

Save the HTML above to `index.html`

### Step 5: Create React entry point

```typescript
// src/index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 5.1: Create src/index.tsx**

Save the TypeScript above to `src/index.tsx`

- [ ] **Step 5.2: Create src/ directory structure**

```bash
mkdir -p src/components src/data src/types src/styles
```

- [ ] **Step 5.3: Commit project setup**

```bash
git add package.json package-lock.json vite.config.ts tsconfig.json index.html src/index.tsx
git commit -m "setup: Initialize Vite + React + TypeScript project

- Add vite.config.ts with React plugin
- Add TypeScript strict config
- Add HTML shell with Noto Sans Thai font
- Add React entry point
- Add npm scripts (dev, build, preview, deploy)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Data Structures & Types

**Files:**
- Create: `src/types/index.ts`
- Create: `src/data/questions.ts`
- Create: `src/data/scoring.ts`
- Create: `src/data/allocations.ts`
- Create: `src/data/recommendations.ts`

### Step 1: Create TypeScript types

```typescript
// src/types/index.ts

export type RiskLevel = 1 | 2 | 3 | 4 | 5
export type ScreenNumber = 1 | 2 | 3 | 4 | 5
export type AnswerValue = 1 | 2 | 3 | 4

export interface Answer {
  label: string  // Thai text (e.g., "ก. มากกว่า 55 ปี")
}

export interface Question {
  id: number                    // 1-10
  screen: ScreenNumber         // Which screen (1-5)
  textThai: string            // Question in Thai
  answers: Answer[]           // 4 answer options
}

export interface Answers {
  [questionId: number]: AnswerValue
}

export interface AllocationPercentages {
  debt: number              // ตราสารหนี้
  equity: number            // ตราสารทุน
  cash: number              // เงินฝาก
  alternative: number       // การลงทุนทางเลือก
}

export interface RiskLevelData {
  level: RiskLevel
  name: string              // e.g., "เสี่ยงปานกลาง"
  nameEn: string           // e.g., "Moderate Risk"
  minScore: number
  maxScore: number
  allocations: AllocationPercentages
  recommendation: string    // Thai text
}

export interface ScoringResult {
  totalScore: number
  riskLevel: RiskLevel
  data: RiskLevelData
}
```

- [ ] **Step 2.1: Create src/types/index.ts**

Save the TypeScript above to `src/types/index.ts`

### Step 2: Create questions data

```typescript
// src/data/questions.ts
import { Question } from '../types'

export const QUESTIONS: Question[] = [
  // Screen 1
  {
    id: 1,
    screen: 1,
    textThai: 'ปัจจุบันท่านอายุเท่าไร',
    answers: [
      { label: 'ก. มากกว่า 55 ปี' },
      { label: 'ข. 45 – 55 ปี' },
      { label: 'ค. 35 – 44 ปี' },
      { label: 'ง. น้อยกว่า 35 ปี' },
    ],
  },
  {
    id: 2,
    screen: 1,
    textThai: 'เดือนนี้ ค่าใช้จ่ายประจำของท่าน (บ้าน รถ ครอบครัว) เป็นสัดส่วนเท่าไรของเงินได้ทั้งหมด',
    answers: [
      { label: 'ก. มากกว่า 75% (เกือบเสมอ)' },
      { label: 'ข. 50-75% (ส่วนใหญ่)' },
      { label: 'ค. 25-50% (ประมาณครึ่ง)' },
      { label: 'ง. น้อยกว่า 25% (น้อยมาก)' },
    ],
  },
  // Screen 2
  {
    id: 3,
    screen: 2,
    textThai: 'ปัจจุบันท่านมีสถานะทางการเงิน (ทรัพย์สิน vs หนี้สิน) อย่างไร',
    answers: [
      { label: 'ก. ท่านเป็นหนี้มากกว่าที่มี (ค่างวด/เงินกู้ > ทรัพย์สินที่มี)' },
      { label: 'ข. ท่านเป็นหนี้เท่า ๆ กับที่มี (ค่างวด/เงินกู้ ≈ ทรัพย์สินที่มี)' },
      { label: 'ค. ท่านมีสินทรัพย์มากกว่าหนี้ (ทรัพย์สินที่มี > ค่างวด/เงินกู้)' },
      { label: 'ง. ท่านมั่นใจว่ามีเงินออม (พอใช้ชีวิตหลังเกษียณ)' },
    ],
  },
  {
    id: 4,
    screen: 2,
    textThai: 'ท่านเคยเก็บเงินหรือลงทุนด้วยวิธีใด',
    answers: [
      { label: 'ก. เฉพาะเงินฝากธนาคาร (ออมทรัพย์, เงินฝากประจำ)' },
      { label: 'ข. เงินฝาก + พันธบัตรรัฐบาล/กองทุนรวมพันธบัตร' },
      { label: 'ค. เงินฝาก + กองทุนรวมตราสารหนี้' },
      { label: 'ง. เงินฝาก + ลงทุนหุ้น/กองทุนรวมหุ้น หรือสินทรัพย์เสี่ยง' },
    ],
  },
  // Screen 3
  {
    id: 5,
    screen: 3,
    textThai: 'ท่านวางแผนที่จะไม่ต้องใช้เงินลงทุนนี้นานแค่ไหน',
    answers: [
      { label: 'ก. ไม่เกิน 1 ปี' },
      { label: 'ข. 1-3 ปี' },
      { label: 'ค. 3-5 ปี' },
      { label: 'ง. มากกว่า 5 ปี' },
    ],
  },
  {
    id: 6,
    screen: 3,
    textThai: 'ท่านคิดว่าสิ่งใดสำคัญที่สุดสำหรับการลงทุน',
    answers: [
      { label: 'ก. ความปลอดภัยของเงินต้น (ไม่อยากเสีย)' },
      { label: 'ข. สมดุลระหว่างปลอดภัยกับกำไร' },
      { label: 'ค. กำไรมากกว่า แม้มีความเสี่ยง' },
      { label: 'ง. กำไรสูงสุด โดยไม่กังวลความเสี่ยง' },
    ],
  },
  // Screen 4
  {
    id: 7,
    screen: 4,
    textThai: 'ท่านเตมใจลงทุนในกลุ่มไหนมากที่สุด',
    answers: [
      { label: 'ก. ไม่มีความเสี่ยง — โอกาสได้ +2.5%, ไม่มีขาดทุน' },
      { label: 'ข. เสี่ยงน้อย — โอกาสได้ +7%, อาจขาดทุน -1%' },
      { label: 'ค. เสี่ยงปานกลาง — โอกาสได้ +15%, อาจขาดทุน -5%' },
      { label: 'ง. เสี่ยงสูง — โอกาสได้ +25%, อาจขาดทุน -15%' },
    ],
  },
  {
    id: 8,
    screen: 4,
    textThai: 'เมื่อเห็นว่าลงทุนแล้วมี "กำไร/ขาดทุน" มากๆ ท่านรู้สึกอย่างไร',
    answers: [
      { label: 'ก. กังวล อยากขายออก' },
      { label: 'ข. ไม่สบายใจ แต่พอรับได้' },
      { label: 'ค. พอรับได้ เข้าใจว่าตลาดมีความผันผวน' },
      { label: 'ง. ไม่กังวล รอให้กลับมา' },
    ],
  },
  {
    id: 9,
    screen: 4,
    textThai: 'ถ้ามูลค่าเงินลงทุนลดลง ท่านจะรู้สึกกังวลเมื่อลดไปสัดส่วนไหน',
    answers: [
      { label: 'ก. 5% หรือน้อยกว่า' },
      { label: 'ข. ประมาณ 5-10%' },
      { label: 'ค. ประมาณ 10-20%' },
      { label: 'ง. มากกว่า 20%' },
    ],
  },
  // Screen 5
  {
    id: 10,
    screen: 5,
    textThai: 'เมื่อปีที่แล้วท่านลงทุน 100,000 บาท ปีนี้เหลือ 85,000 บาท ท่านจะทำอย่างไร',
    answers: [
      { label: 'ก. ตกใจ ขายออกทั้งหมด' },
      { label: 'ข. กังวล จะเปลี่ยนไปลงทุนที่เสี่ยงน้อย' },
      { label: 'ค. อดทน ถือต่อไปรอตลาดฟื้น' },
      { label: 'ง. เชื่อในแผน ลงทุนเพิ่มเติม' },
    ],
  },
]

export const QUESTIONS_BY_SCREEN: Record<number, Question[]> = {
  1: QUESTIONS.filter(q => q.screen === 1),
  2: QUESTIONS.filter(q => q.screen === 2),
  3: QUESTIONS.filter(q => q.screen === 3),
  4: QUESTIONS.filter(q => q.screen === 4),
  5: QUESTIONS.filter(q => q.screen === 5),
}
```

- [ ] **Step 2.2: Create src/data/questions.ts**

Save the TypeScript above to `src/data/questions.ts`

### Step 3: Create scoring logic

```typescript
// src/data/scoring.ts
import { RiskLevel, ScoringResult } from '../types'
import { RISK_LEVELS } from './recommendations'

export function calculateScore(answers: Record<number, number>): number {
  let score = 0
  for (let i = 1; i <= 10; i++) {
    if (answers[i]) {
      score += answers[i]
    }
  }
  return score
}

export function getRiskLevel(score: number): RiskLevel {
  if (score < 15) return 1
  if (score < 22) return 2
  if (score < 30) return 3
  if (score < 37) return 4
  return 5
}

export function getScoringResult(answers: Record<number, number>): ScoringResult {
  const totalScore = calculateScore(answers)
  const riskLevel = getRiskLevel(totalScore)
  const data = RISK_LEVELS[riskLevel]

  return {
    totalScore,
    riskLevel,
    data,
  }
}
```

- [ ] **Step 3.1: Create src/data/scoring.ts**

Save the TypeScript above to `src/data/scoring.ts`

### Step 4: Create asset allocations

```typescript
// src/data/allocations.ts
import { AllocationPercentages, RiskLevel } from '../types'

export const ALLOCATIONS_BY_LEVEL: Record<RiskLevel, AllocationPercentages> = {
  1: {
    debt: 60,
    equity: 5,
    cash: 20,
    alternative: 10,
  },
  2: {
    debt: 70,
    equity: 10,
    cash: 20,
    alternative: 10,
  },
  3: {
    debt: 60,
    equity: 10,
    cash: 30,
    alternative: 10,
  },
  4: {
    debt: 40,
    equity: 20,
    cash: 10,
    alternative: 40,
  },
  5: {
    debt: 30,
    equity: 30,
    cash: 5,
    alternative: 60,
  },
}
```

- [ ] **Step 4.1: Create src/data/allocations.ts**

Save the TypeScript above to `src/data/allocations.ts`

### Step 5: Create recommendations data

```typescript
// src/data/recommendations.ts
import { RiskLevel, RiskLevelData } from '../types'
import { ALLOCATIONS_BY_LEVEL } from './allocations'

export const RISK_LEVELS: Record<RiskLevel, RiskLevelData> = {
  1: {
    level: 1,
    name: 'เสี่ยงต่ำ',
    nameEn: 'Low Risk',
    minScore: 10,
    maxScore: 14,
    allocations: ALLOCATIONS_BY_LEVEL[1],
    recommendation:
      'ท่านคัดสรรความปลอดภัยของเงินต้นเป็นลำดับแรก เหมาะสำหรับผู้ที่ต้องการหลีกเลี่ยงความเสี่ยง ลองพิจารณาเงินฝากธนาคารและพันธบัตรรัฐบาลสำหรับเงินลงทุนส่วนใหญ่',
  },
  2: {
    level: 2,
    name: 'เสี่ยงปานกลางค่อนข้างต่ำ',
    nameEn: 'Moderate-Low Risk',
    minScore: 15,
    maxScore: 21,
    allocations: ALLOCATIONS_BY_LEVEL[2],
    recommendation:
      'ท่านต้องการสมดุลระหว่างความปลอดภัยและโอกาสได้รับกำไร ลองพิจารณาการลงทุนในกองทุนรวมตราสารหนี้และพันธบัตร เพื่อให้ได้ผลตอบแทนที่มีความเสี่ยงต่ำ',
  },
  3: {
    level: 3,
    name: 'เสี่ยงปานกลางค่อนข้างสูง',
    nameEn: 'Moderate-High Risk',
    minScore: 22,
    maxScore: 29,
    allocations: ALLOCATIONS_BY_LEVEL[3],
    recommendation:
      'ท่านสามารถรับความเสี่ยงในระดับปานกลาง เนื่องจากมีรายได้ที่เพียงพอและอายุที่เหมาะสม ลองพิจารณาการลงทุนในกองทุนรวมหุ้นและตราสารหนี้โดยมีอัตราส่วนที่เหมาะสม',
  },
  4: {
    level: 4,
    name: 'เสี่ยงสูง',
    nameEn: 'High Risk',
    minScore: 30,
    maxScore: 36,
    allocations: ALLOCATIONS_BY_LEVEL[4],
    recommendation:
      'ท่านยอมรับความเสี่ยงในระดับที่สูงขึ้น เพื่อให้ได้ผลตอบแทนที่สูงขึ้น ลองพิจารณาการลงทุนในหุ้นและกองทุนรวมหุ้น พร้อมกับตราสารหนี้เพื่อให้หลังคาคุ้มครอง',
  },
  5: {
    level: 5,
    name: 'เสี่ยงสูงมาก',
    nameEn: 'Very High Risk',
    minScore: 37,
    maxScore: 40,
    allocations: ALLOCATIONS_BY_LEVEL[5],
    recommendation:
      'ท่านมีอพยพความเสี่ยงสูงและพร้อมสำหรับการลงทุนที่ก้าวหน้า เนื่องจากมีศักยภาพ เป็นแนวทางในการลงทุนที่หลากหลายและระยะยาว',
  },
}
```

- [ ] **Step 5.1: Create src/data/recommendations.ts**

Save the TypeScript above to `src/data/recommendations.ts`

- [ ] **Step 5.2: Commit data structures**

```bash
git add src/types/ src/data/
git commit -m "feat: Add data structures, types, and scoring logic

- Create TypeScript types (Question, Answer, RiskLevel, etc.)
- Add all 10 questions with Thai text and 4 answer options each
- Implement scoring calculation (Q1-10 sum, 10-40 range)
- Add risk level mapping (5 levels based on score ranges)
- Create asset allocation percentages for each risk level
- Add risk level descriptions and recommendations in Thai

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Reusable Components

**Files:**
- Create: `src/components/AnswerButton.tsx`
- Create: `src/components/ProgressBar.tsx`

### Step 1: Create AnswerButton component

```typescript
// src/components/AnswerButton.tsx
import React from 'react'
import { AnswerValue } from '../types'

interface AnswerButtonProps {
  label: string
  value: AnswerValue
  selected: boolean
  onClick: (value: AnswerValue) => void
}

export const AnswerButton: React.FC<AnswerButtonProps> = ({
  label,
  value,
  selected,
  onClick,
}) => {
  return (
    <button
      className={`answer-button ${selected ? 'selected' : ''}`}
      onClick={() => onClick(value)}
      type="button"
    >
      {label}
    </button>
  )
}
```

- [ ] **Step 1.1: Create src/components/AnswerButton.tsx**

Save the TypeScript above to `src/components/AnswerButton.tsx`

### Step 2: Create ProgressBar component

```typescript
// src/components/ProgressBar.tsx
import React from 'react'

interface ProgressBarProps {
  currentScreen: number
  totalScreens: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentScreen,
  totalScreens,
}) => {
  const percentage = (currentScreen / totalScreens) * 100

  return (
    <div className="progress-container">
      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="progress-text">
        ข้อ {currentScreen} of {totalScreens}
      </div>
    </div>
  )
}
```

- [ ] **Step 2.1: Create src/components/ProgressBar.tsx**

Save the TypeScript above to `src/components/ProgressBar.tsx`

- [ ] **Step 2.2: Commit reusable components**

```bash
git add src/components/AnswerButton.tsx src/components/ProgressBar.tsx
git commit -m "feat: Create AnswerButton and ProgressBar components

- AnswerButton: Multi-choice button with selected state
- ProgressBar: Visual progress indicator showing current screen / total

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Q7 Chart Component

**Files:**
- Create: `src/components/Chart.tsx`

### Step 1: Create diverging bar chart for Q7

```typescript
// src/components/Chart.tsx
import React from 'react'

interface ChartData {
  group: number
  gain: number
  loss: number
}

const chartData: ChartData[] = [
  { group: 1, gain: 2.5, loss: 0 },
  { group: 2, gain: 7, loss: -1 },
  { group: 3, gain: 15, loss: -5 },
  { group: 4, gain: 25, loss: -15 },
]

export const Chart: React.FC = () => {
  const maxGain = 25
  const maxLoss = 15
  const chartHeight = 260
  const centerY = 155
  const yRange = 50 // pixels per 10%

  return (
    <div className="chart-container">
      <svg
        viewBox="0 0 420 280"
        className="chart"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y-Axis */}
        <line x1="50" y1="30" x2="50" y2="220" stroke="#333" strokeWidth="2" />

        {/* X-Axis (0% line) */}
        <line x1="50" y1="155" x2="380" y2="155" stroke="#333" strokeWidth="2" />

        {/* Y-Axis Labels */}
        <text x="45" y="35" fontSize="11" textAnchor="end" fill="#666">
          30%
        </text>
        <text x="45" y="75" fontSize="11" textAnchor="end" fill="#666">
          10%
        </text>
        <text x="45" y="115" fontSize="11" textAnchor="end" fill="#666">
          0%
        </text>
        <text x="45" y="200" fontSize="11" textAnchor="end" fill="#666">
          -10%
        </text>
        <text x="45" y="225" fontSize="11" textAnchor="end" fill="#666">
          -20%
        </text>

        {/* Grid lines */}
        <line x1="50" y1="40" x2="380" y2="40" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="2,2" />
        <line x1="50" y1="80" x2="380" y2="80" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="2,2" />
        <line x1="50" y1="190" x2="380" y2="190" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="2,2" />

        {/* Bars */}
        {chartData.map(({ group, gain, loss }) => {
          const barX = 50 + (group - 1) * 55 + 25
          const gainHeight = (gain / maxGain) * (yRange * 2.5)
          const lossHeight = (Math.abs(loss) / maxLoss) * (yRange * 1.5)
          const gainColor = gain === 2.5 ? '#f4d5a8' : gain === 7 ? '#f4c896' : gain === 15 ? '#f4a972' : '#f08a4a'
          const lossColor = loss === 0 ? 'transparent' : loss === -1 ? '#d97a6a' : loss === -5 ? '#c85a4a' : '#a83a2a'

          return (
            <g key={group}>
              {/* Gain bar */}
              <rect
                x={barX - 18}
                y={centerY - gainHeight}
                width="36"
                height={gainHeight}
                fill={gainColor}
              />
              <text
                x={barX}
                y={centerY - gainHeight - 5}
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fill="#333"
              >
                {gain}%
              </text>

              {/* Loss bar */}
              {loss !== 0 && (
                <>
                  <rect
                    x={barX - 18}
                    y={centerY}
                    width="36"
                    height={lossHeight}
                    fill={lossColor}
                  />
                  <text
                    x={barX}
                    y={centerY + lossHeight + 18}
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#333"
                  >
                    {loss}%
                  </text>
                </>
              )}

              {/* Group label */}
              <text
                x={barX}
                y="250"
                fontSize="13"
                fontWeight="bold"
                textAnchor="middle"
                fill="#333"
              >
                {group}
              </text>
            </g>
          )
        })}

        {/* Legend */}
        <rect x="280" y="50" width="18" height="18" fill="#f4d5a8" stroke="#999" strokeWidth="1" />
        <text x="310" y="63" fontSize="11" fill="#333">
          กำไร
        </text>

        <rect x="280" y="80" width="18" height="18" fill="#a83a2a" stroke="#999" strokeWidth="1" />
        <text x="310" y="93" fontSize="11" fill="#333">
          ขาดทุน
        </text>
      </svg>
    </div>
  )
}
```

- [ ] **Step 1.1: Create src/components/Chart.tsx**

Save the TypeScript above to `src/components/Chart.tsx`

- [ ] **Step 1.2: Commit Chart component**

```bash
git add src/components/Chart.tsx
git commit -m "feat: Create Q7 diverging bar chart component

- SVG-based chart showing 4 risk/reward options
- Gains above 0% line (orange gradient)
- Losses below 0% line (red gradient)
- Percentages labeled on bars
- Legend for gain/loss colors

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create QuestionScreen Component

**Files:**
- Create: `src/components/QuestionScreen.tsx`

### Step 1: Create QuestionScreen component

```typescript
// src/components/QuestionScreen.tsx
import React from 'react'
import { ScreenNumber, AnswerValue, Answers } from '../types'
import { QUESTIONS_BY_SCREEN } from '../data/questions'
import { AnswerButton } from './AnswerButton'
import { ProgressBar } from './ProgressBar'
import { Chart } from './Chart'

interface QuestionScreenProps {
  screen: ScreenNumber
  answers: Answers
  onAnswerChange: (questionId: number, value: AnswerValue) => void
  onNext: () => void
  onBack: () => void
  canGoBack: boolean
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  screen,
  answers,
  onAnswerChange,
  onNext,
  onBack,
  canGoBack,
}) => {
  const questions = QUESTIONS_BY_SCREEN[screen]
  const allAnswered = questions.every(q => answers[q.id])

  return (
    <div className="question-screen">
      {/* Screen header */}
      <div className="screen-header">
        <div className="section-label">ส่วนที่ {screen} | ข้อ {questions[0].id}-{questions[questions.length - 1].id}</div>
      </div>

      {/* Questions */}
      <div className="questions-container">
        {questions.map(question => (
          <div key={question.id} className="question-group">
            <h3 className="question-text">{question.textThai}</h3>
            <div className="answers">
              {question.answers.map((answer, idx) => {
                const value = (idx + 1) as AnswerValue
                return (
                  <AnswerButton
                    key={`${question.id}-${value}`}
                    label={answer.label}
                    value={value}
                    selected={answers[question.id] === value}
                    onClick={value => onAnswerChange(question.id, value)}
                  />
                )
              })}
            </div>
          </div>
        ))}

        {/* Q7 Chart */}
        {screen === 4 && <Chart />}
      </div>

      {/* Navigation */}
      <div className="navigation">
        <button
          className="btn btn-secondary"
          onClick={onBack}
          disabled={!canGoBack}
          type="button"
        >
          ย้อนกลับ
        </button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!allAnswered}
          type="button"
        >
          ถัดไป
        </button>
      </div>

      {/* Progress */}
      <ProgressBar currentScreen={screen} totalScreens={5} />
    </div>
  )
}
```

- [ ] **Step 1.1: Create src/components/QuestionScreen.tsx**

Save the TypeScript above to `src/components/QuestionScreen.tsx`

- [ ] **Step 1.2: Commit QuestionScreen component**

```bash
git add src/components/QuestionScreen.tsx
git commit -m "feat: Create QuestionScreen component

- Displays 2-3 questions per screen
- Shows section header (e.g., 'ส่วนที่ 1 | ข้อ 1-2')
- Includes Q7 diverging bar chart for screen 4
- Navigation buttons (Back/Next) with validation
- Progress indicator

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create ResultsScreen Component

**Files:**
- Create: `src/components/AllocationGrid.tsx`
- Create: `src/components/ResultsScreen.tsx`

### Step 1: Create AllocationGrid component

```typescript
// src/components/AllocationGrid.tsx
import React from 'react'
import { AllocationPercentages } from '../types'

interface AllocationGridProps {
  allocations: AllocationPercentages
}

export const AllocationGrid: React.FC<AllocationGridProps> = ({ allocations }) => {
  const items = [
    { label: 'ตราสารหนี้', value: allocations.debt, color: '#e3f2fd' },
    { label: 'ตราสารทุน', value: allocations.equity, color: '#fff3e0' },
    { label: 'เงินฝาก', value: allocations.cash, color: '#f3e5f5' },
    { label: 'ทางเลือก', value: allocations.alternative, color: '#e8f5e9' },
  ]

  return (
    <div className="allocation-grid">
      {items.map(item => (
        <div key={item.label} className="allocation-item" style={{ backgroundColor: item.color }}>
          <div className="allocation-label">{item.label}</div>
          <div className="allocation-percentage">{item.value}%</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 1.1: Create src/components/AllocationGrid.tsx**

Save the TypeScript above to `src/components/AllocationGrid.tsx`

### Step 2: Create ResultsScreen component

```typescript
// src/components/ResultsScreen.tsx
import React from 'react'
import { ScoringResult } from '../types'
import { AllocationGrid } from './AllocationGrid'

interface ResultsScreenProps {
  result: ScoringResult
  onRestart: () => void
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, onRestart }) => {
  const { data } = result
  const levelColor = (() => {
    switch (data.level) {
      case 1: return '#4CAF50'
      case 2: return '#8BC34A'
      case 3: return '#FFC107'
      case 4: return '#FF9800'
      case 5: return '#F44336'
    }
  })()

  return (
    <div className="results-screen">
      {/* Risk Profile Card */}
      <div className="risk-profile-card" style={{ borderLeftColor: levelColor }}>
        <h2 className="risk-level-name">ระดับ {data.level}: {data.name}</h2>
        <p className="risk-level-range">คะแนน: {data.minScore}-{data.maxScore}</p>
      </div>

      {/* Asset Allocation */}
      <div className="allocation-section">
        <h3 className="section-title">สัดส่วนการลงทุน</h3>
        <AllocationGrid allocations={data.allocations} />
      </div>

      {/* Recommendation */}
      <div className="recommendation-section">
        <h3 className="section-title">คำแนะนำ</h3>
        <p className="recommendation-text">{data.recommendation}</p>
      </div>

      {/* Restart Button */}
      <button className="btn btn-primary btn-block" onClick={onRestart} type="button">
        ทำแบบทดสอบใหม่
      </button>
    </div>
  )
}
```

- [ ] **Step 2.1: Create src/components/ResultsScreen.tsx**

Save the TypeScript above to `src/components/ResultsScreen.tsx`

- [ ] **Step 2.2: Commit Results components**

```bash
git add src/components/AllocationGrid.tsx src/components/ResultsScreen.tsx
git commit -m "feat: Create ResultsScreen and AllocationGrid components

- AllocationGrid: 2x2 grid showing asset allocations with percentages
- ResultsScreen: Displays risk profile card with color border
  - Shows risk level name and score range
  - Displays allocation percentages
  - Shows recommendation text
  - Includes restart button

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create Main App Component

**Files:**
- Create: `src/App.tsx`

### Step 1: Create App component with state management

```typescript
// src/App.tsx
import React, { useState } from 'react'
import { ScreenNumber, Answers, AnswerValue } from './types'
import { getScoringResult } from './data/scoring'
import { QuestionScreen } from './components/QuestionScreen'
import { ResultsScreen } from './components/ResultsScreen'

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenNumber>(1)
  const [answers, setAnswers] = useState<Answers>({})
  const [submitted, setSubmitted] = useState(false)

  const handleAnswerChange = (questionId: number, value: AnswerValue) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleNext = () => {
    if (currentScreen === 5) {
      // Submit
      setSubmitted(true)
    } else {
      setCurrentScreen((prev) => (prev + 1) as ScreenNumber)
    }
  }

  const handleBack = () => {
    if (currentScreen > 1) {
      setCurrentScreen((prev) => (prev - 1) as ScreenNumber)
    }
  }

  const handleRestart = () => {
    setAnswers({})
    setCurrentScreen(1)
    setSubmitted(false)
  }

  if (submitted) {
    const result = getScoringResult(answers)
    return <ResultsScreen result={result} onRestart={handleRestart} />
  }

  return (
    <div className="app">
      <QuestionScreen
        screen={currentScreen}
        answers={answers}
        onAnswerChange={handleAnswerChange}
        onNext={handleNext}
        onBack={handleBack}
        canGoBack={currentScreen > 1}
      />
    </div>
  )
}
```

- [ ] **Step 1.1: Create src/App.tsx**

Save the TypeScript above to `src/App.tsx`

- [ ] **Step 1.2: Verify app structure is correct**

Check that `src/index.tsx` imports from `./App`, which it should (created in Task 1)

- [ ] **Step 1.3: Commit App component**

```bash
git add src/App.tsx
git commit -m "feat: Create main App component with state management

- Manages current screen, answers, and submitted state
- Handles answer changes, navigation (Next/Back)
- Switches to ResultsScreen on final submission
- Includes restart functionality to reset quiz

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create Global Styles

**Files:**
- Create: `src/styles/main.css`
- Create: `src/styles/components.css`
- Create: `src/styles/responsive.css`

### Step 1: Create main global styles

```css
/* src/styles/main.css */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --color-primary: #0066cc;
  --color-secondary: #f5f5f5;
  --color-text: #333;
  --color-text-light: #666;
  --color-border: #ddd;
  --color-gain-light: #f4d5a8;
  --color-gain-dark: #f08a4a;
  --color-loss-light: #d97a6a;
  --color-loss-dark: #a83a2a;
  --spacing-xs: 8px;
  --spacing-sm: 12px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Noto Sans Thai', sans-serif;
  background-color: #fafafa;
  color: var(--color-text);
  line-height: 1.5;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
}

/* Typography */
h2 {
  font-size: 1.3em;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

h3 {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

p {
  font-size: 0.95em;
  margin-bottom: var(--spacing-md);
}

.subtitle {
  font-size: 0.85em;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-md);
}

/* Buttons */
.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: 6px;
  font-family: 'Noto Sans Thai', sans-serif;
  font-size: 0.95em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-block {
  width: 100%;
}

/* Answer Button */
.answer-button {
  display: block;
  width: 100%;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  border: 2px solid var(--color-border);
  border-radius: 6px;
  background-color: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Noto Sans Thai', sans-serif;
  font-size: 0.95em;
}

.answer-button:hover {
  border-color: var(--color-primary);
  background-color: rgba(0, 102, 204, 0.05);
}

.answer-button.selected {
  border-color: var(--color-primary);
  background-color: #e6f0ff;
  font-weight: 500;
}

/* Progress Bar */
.progress-container {
  padding: var(--spacing-md);
  background-color: var(--color-secondary);
  margin-top: var(--spacing-lg);
}

.progress-bar-bg {
  width: 100%;
  height: 6px;
  background-color: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-bar-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.85em;
  color: var(--color-text-light);
}

/* Chart */
.chart-container {
  margin: var(--spacing-md) 0;
  overflow-x: auto;
}

.chart {
  width: 100%;
  height: auto;
}
```

- [ ] **Step 1.1: Create src/styles/main.css**

Save the CSS above to `src/styles/main.css`

### Step 2: Create component-specific styles

```css
/* src/styles/components.css */

/* Question Screen */
.question-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
}

.screen-header {
  margin-bottom: var(--spacing-lg);
}

.section-label {
  display: inline-block;
  font-size: 0.85em;
  text-transform: uppercase;
  color: var(--color-text-light);
  background-color: var(--color-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  margin-bottom: var(--spacing-md);
}

.questions-container {
  flex: 1;
}

.question-group {
  margin-bottom: var(--spacing-lg);
}

.question-text {
  font-weight: 500;
  margin-bottom: var(--spacing-md);
  font-size: 0.95em;
}

.answers {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* Navigation */
.navigation {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.navigation .btn {
  flex: 1;
}

/* Results Screen */
.results-screen {
  flex: 1;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
}

.risk-profile-card {
  padding: var(--spacing-md);
  background-color: white;
  border-left: 4px solid var(--color-primary);
  border-radius: 4px;
  margin-bottom: var(--spacing-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.risk-level-name {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 1.3em;
}

.risk-level-range {
  margin: 0;
  font-size: 0.9em;
  color: var(--color-text-light);
}

/* Allocation Section */
.allocation-section,
.recommendation-section {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: 1em;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.allocation-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.allocation-item {
  padding: var(--spacing-md);
  border-radius: 6px;
  text-align: center;
}

.allocation-label {
  font-size: 0.85em;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
}

.allocation-percentage {
  font-weight: bold;
  font-size: 1.3em;
  color: var(--color-text);
}

/* Recommendation */
.recommendation-text {
  font-size: 0.9em;
  line-height: 1.6;
  color: var(--color-text);
  background-color: var(--color-secondary);
  padding: var(--spacing-md);
  border-radius: 6px;
}
```

- [ ] **Step 2.1: Create src/styles/components.css**

Save the CSS above to `src/styles/components.css`

### Step 3: Create responsive styles

```css
/* src/styles/responsive.css */

/* Mobile (320px - 480px) */
@media (max-width: 480px) {
  .btn {
    min-height: 44px;
    font-size: 0.9em;
  }

  .question-screen {
    padding: var(--spacing-sm);
  }

  .allocation-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-sm);
  }

  h2 {
    font-size: 1.1em;
  }

  .risk-level-name {
    font-size: 1.1em;
  }
}

/* Tablet (768px and up) */
@media (min-width: 768px) {
  .question-screen {
    max-width: 600px;
    margin: 0 auto;
  }

  .results-screen {
    max-width: 600px;
    margin: 0 auto;
  }

  .allocation-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-contrast: more) {
  .answer-button {
    border-width: 3px;
  }

  .btn {
    text-decoration: underline;
  }
}
```

- [ ] **Step 3.1: Create src/styles/responsive.css**

Save the CSS above to `src/styles/responsive.css`

- [ ] **Step 3.2: Update src/index.tsx to import all stylesheets**

Open `src/index.tsx` and update the import to include all stylesheets:

```typescript
import './styles/main.css'
import './styles/components.css'
import './styles/responsive.css'
```

- [ ] **Step 3.3: Commit all styles**

```bash
git add src/styles/
git commit -m "style: Add global, component, and responsive CSS

- Global: Colors, typography, buttons, spacing variables
- Components: Question screen, results, allocation grid styling
- Responsive: Mobile-first breakpoints (320px, 768px+)
- Accessibility: Reduced motion, contrast preferences

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Manual Testing & Bug Fixes

**Files:**
- No new files (testing phase)

### Step 1: Start dev server and test

- [ ] **Step 1.1: Install dependencies if not done**

```bash
npm install
```

- [ ] **Step 1.2: Start dev server**

```bash
npm run dev
```

Expected output:
```
VITE v5.x.x ready in xxx ms

➜ Local:   http://localhost:5173/
➜ press h + enter to show help
```

- [ ] **Step 1.3: Open browser to http://localhost:5173**

Verify:
- Page loads without errors
- Noto Sans Thai font is applied
- Screen 1 shows questions 1-2 with 4 answer buttons each
- Progress indicator shows "ข้อ 1 of 5"

### Step 2: Test navigation flow

- [ ] **Step 2.1: Test answer selection**

- Click on answer for Q1 (should turn blue)
- Click on answer for Q2 (should turn blue)
- Verify "ถัดไป" button becomes enabled

- [ ] **Step 2.2: Click ถัดไป and verify Screen 2 loads**

Expected: Q3-Q4 appear, progress shows "ข้อ 2 of 5"

- [ ] **Step 2.3: Test Back button**

Click "ย้อนกลับ" — should return to Screen 1 with previous answers preserved

### Step 3: Test Q7 Chart

- [ ] **Step 3.1: Navigate to Screen 4**

Answer Q1-Q6, click ถัดไป until Screen 4

- [ ] **Step 3.2: Verify chart displays**

Check:
- SVG chart is visible
- 4 groups (1-4) with bars
- Orange bars above 0% (gains)
- Red bars below 0% (losses)
- Legend showing "กำไร" (orange) and "ขาดทุน" (red)

### Step 4: Test Results Screen

- [ ] **Step 4.1: Answer all 10 questions and submit**

Complete the quiz, click ถัดไป on Screen 5 to submit

- [ ] **Step 4.2: Verify Results Screen**

Check:
- Risk profile card displays (e.g., "ระดับ 3: เสี่ยงปานกลางค่อนข้างสูง")
- Asset allocation grid shows 4 items with percentages
- Recommendation text appears
- "ทำแบบทดสอบใหม่" button is visible

- [ ] **Step 4.3: Click restart and verify quiz resets**

Click "ทำแบบทดสอบใหม่" — should return to Screen 1 with no answers

### Step 5: Test on mobile (browser dev tools)

- [ ] **Step 5.1: Open DevTools (F12 or Cmd+Opt+I)**

- [ ] **Step 5.2: Toggle device toolbar (mobile view)**

- [ ] **Step 5.3: Test on multiple screen sizes**

Test viewport sizes: 320px, 375px, 480px
Verify:
- Text is readable (no horizontal scroll)
- Buttons are large enough (≥44px height)
- Spacing is comfortable
- Chart doesn't overflow

### Step 6: Fix any issues found

If errors occur:
- Check browser console (F12 > Console tab)
- Read error message carefully
- Fix the corresponding file
- Save and refresh browser (Page should hot-reload)
- Re-test

- [ ] **Step 6.1: Commit after manual testing**

```bash
git add -A
git commit -m "test: Verify questionnaire functionality

- Tested full quiz flow (Screen 1-5 → Results)
- Verified question selection and navigation
- Confirmed Q7 chart renders correctly
- Tested results display and allocation grid
- Verified restart functionality
- Manual testing on mobile viewport (320px-480px)
- All interactions working as expected

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Production Build & GitHub Pages Setup

**Files:**
- Modify: `vite.config.ts` (if using subdirectory)
- Modify: `package.json` (update deploy script)
- Create: `.github/workflows/deploy.yml` (optional CI/CD)

### Step 1: Build for production

- [ ] **Step 1.1: Run production build**

```bash
npm run build
```

Expected output:
```
vite v5.x.x building for production...
✓ 1234 modules transformed.
dist/index.html
dist/assets/index-abc123.js
dist/assets/index-def456.css
✓ built in 2.34s
```

Verify: `dist/` directory is created with `index.html` and assets

### Step 2: Preview production build locally

- [ ] **Step 2.1: Run preview**

```bash
npm run preview
```

Expected: "Local: http://localhost:4173/" appears

- [ ] **Step 2.2: Open preview in browser**

Verify app works identically to dev version

### Step 3: Setup GitHub Pages deployment

#### Option A: Deploy to `username.github.io/repo-name/`

- [ ] **Step 3.1: Update vite.config.ts base path**

If deploying to a subdirectory like `github.com/username/thai-questionnaire/`:

```typescript
// vite.config.ts
export default defineConfig({
  ...
  base: '/thai-questionnaire/',  // Change to your repo name
})
```

Then rebuild:
```bash
npm run build
```

#### Option B: Deploy to root (if repo is `username.github.io`)

Leave `base: '/'` as-is.

### Step 4: Deploy using gh-pages command

- [ ] **Step 4.1: Ensure gh-pages is in devDependencies**

Check `package.json` — should have `"gh-pages": "^6.0.0"` (already added in Task 1)

- [ ] **Step 4.2: Deploy to GitHub Pages**

```bash
npm run deploy
```

Expected:
```
> gh-pages -d dist
Published
```

- [ ] **Step 4.3: Verify deployment**

Visit: `https://username.github.io/thai-questionnaire/` (or your URL)

Check:
- App loads and is fully functional
- Noto Sans Thai font renders
- All interactions work

### Step 5: Optional CI/CD Setup (GitHub Actions)

- [ ] **Step 5.1: Create GitHub Actions workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run deploy
```

- [ ] **Step 5.2: Push to GitHub**

```bash
git add .github/
git commit -m "ci: Add GitHub Actions deploy workflow"
git push origin main
```

On each push to `main`, workflow automatically builds and deploys to GitHub Pages.

- [ ] **Step 5.3: Final commit**

```bash
git add -A
git commit -m "build: Setup production build and GitHub Pages deployment

- Configure Vite production build
- Add gh-pages deployment script
- Setup GitHub Actions for auto-deploy on push
- Verify dist/ directory builds without errors
- Test deployed app on GitHub Pages

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

---

## Spec Coverage Check

✅ **User Journey** — 5 screens → results (Tasks 5, 6, 7)  
✅ **Scoring System** — Q1-Q10, 1-4 points, 5 risk levels (Task 2)  
✅ **Q7 Chart** — Diverging bar chart (Task 4)  
✅ **Asset Allocations** — Percentages by level (Task 2)  
✅ **Recommendations** — Risk level descriptions (Task 2)  
✅ **Tech Stack** — React 18 + Vite + TypeScript (Task 1)  
✅ **Styling** — Noto Sans Thai, colors, mobile-first (Task 8)  
✅ **GitHub Pages** — Static build + deploy script (Task 10)  
✅ **No Backend** — All logic client-side (throughout)  

No gaps identified.

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-13-thai-questionnaire-implementation.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
# Thai Investment Risk Assessment Questionnaire — Design Specification

**Date:** 2026-06-13  
**Project:** Pre-Invest Test — Thai Investment Risk Profiling Tool  
**Scope:** Self-assessment web app (no backend, GitHub Pages deployment)  
**Audience:** Thai users (Gen Y/Z), non-investment professionals  

---

## 1. Project Overview

### Purpose
Create a **self-assessment questionnaire app** that helps Thai users understand their investment risk profile. Users complete a 10-question form, receive a calculated risk level, and see detailed investment recommendations tailored to their profile.

### Use Case
- Users access the app online (mobile-first)
- Fill out questionnaire alone
- View their results (risk level + asset allocation + recommendations)
- Results are view-only (no export, no persistent save)

### Key Design Decisions
- **Mobile-first design** (Gen Y/Z friendly, clean aesthetic using Noto Sans Thai)
- **No backend, no database** — all scoring/logic runs in browser
- **No intro screen** — jump straight to question 1 for faster completion
- **Grouped questions** — 2-3 related questions per screen (~5 screens total)
- **Visual aid for risk/reward** — Q7 uses diverging bar chart to show gain/loss tradeoff
- **Thai language** — all text in Thai; English financial terms kept or parenthesized
- **Deploy on GitHub Pages** — static files only

---

## 2. Question Structure & Scoring

### Five Question Sections (Screens 1-5)

All answers scored 1-4 points (ก=1, ข=2, ค=3, ง=4). Total score determines risk profile.

#### Screen 1: Your Financial Situation (ส่วนที่ 1 | ข้อ 1-2)

**Q1: ปัจจุบันท่านอายุเท่าไร**
- ก. มากกว่า 55 ปี
- ข. 45 – 55 ปี
- ค. 35 – 44 ปี
- ง. น้อยกว่า 35 ปี

**Q2: เดือนนี้ ค่าใช้จ่ายประจำของท่าน (บ้าน รถ ครอบครัว) เป็นสัดส่วนเท่าไรของเงินได้ทั้งหมด**
- ก. มากกว่า 75% (เกือบเสมอ)
- ข. 50-75% (ส่วนใหญ่)
- ค. 25-50% (ประมาณครึ่ง)
- ง. น้อยกว่า 25% (น้อยมาก)

---

#### Screen 2: Your Savings & Experience (ส่วนที่ 2 | ข้อ 3-4)

**Q3: ปัจจุบันท่านมีสถานะทางการเงิน (ทรัพย์สิน vs หนี้สิน) อย่างไร**
- ก. ท่านเป็นหนี้มากกว่าที่มี (ค่างวด/เงินกู้ > ทรัพย์สินที่มี)
- ข. ท่านเป็นหนี้เท่า ๆ กับที่มี (ค่างวด/เงินกู้ ≈ ทรัพย์สินที่มี)
- ค. ท่านมีสินทรัพย์มากกว่าหนี้ (ทรัพย์สินที่มี > ค่างวด/เงินกู้)
- ง. ท่านมั่นใจว่ามีเงินออม (พอใช้ชีวิตหลังเกษียณ)

**Q4: ท่านเคยเก็บเงินหรือลงทุนด้วยวิธีใด** (Select furthest you've gone)
- ก. เฉพาะเงินฝากธนาคาร (ออมทรัพย์, เงินฝากประจำ)
- ข. เงินฝาก + พันธบัตรรัฐบาล/กองทุนรวมพันธบัตร
- ค. เงินฝาก + กองทุนรวมตราสารหนี้
- ง. เงินฝาก + ลงทุนหุ้น/กองทุนรวมหุ้น หรือสินทรัพย์เสี่ยง

---

#### Screen 3: Your Goals (ส่วนที่ 3 | ข้อ 5-6)

**Q5: ท่านวางแผนที่จะไม่ต้องใช้เงินลงทุนนี้นานแค่ไหน**
- ก. ไม่เกิน 1 ปี
- ข. 1-3 ปี
- ค. 3-5 ปี
- ง. มากกว่า 5 ปี

**Q6: ท่านคิดว่าสิ่งใดสำคัญที่สุดสำหรับการลงทุน**
- ก. ความปลอดภัยของเงินต้น (ไม่อยากเสีย)
- ข. สมดุลระหว่างปลอดภัยกับกำไร
- ค. กำไรมากกว่า แม้มีความเสี่ยง
- ง. กำไรสูงสุด โดยไม่กังวลความเสี่ยง

---

#### Screen 4: Your Risk Comfort (ส่วนที่ 4 | ข้อ 7-9)

**Q7: ท่านเตมใจลงทุนในกลุ่มไหนมากที่สุด**

*(Presented with diverging bar chart showing 4 options:)*
- ก. ไม่มีความเสี่ยง — โอกาสได้ +2.5%, ไม่มีขาดทุน
- ข. เสี่ยงน้อย — โอกาสได้ +7%, อาจขาดทุน -1%
- ค. เสี่ยงปานกลาง — โอกาสได้ +15%, อาจขาดทุน -5%
- ง. เสี่ยงสูง — โอกาสได้ +25%, อาจขาดทุน -15%

**Q8: เมื่อเห็นว่าลงทุนแล้วมี "กำไร/ขาดทุน" มากๆ ท่านรู้สึกอย่างไร**
- ก. กังวล อยากขายออก
- ข. ไม่สบายใจ แต่พอรับได้
- ค. พอรับได้ เข้าใจว่าตลาดมีความผันผวน
- ง. ไม่กังวล รอให้กลับมา

**Q9: ถ้ามูลค่าเงินลงทุนลดลง ท่านจะรู้สึกกังวลเมื่อลดไปสัดส่วนไหน**
- ก. 5% หรือน้อยกว่า
- ข. ประมาณ 5-10%
- ค. ประมาณ 10-20%
- ง. มากกว่า 20%

---

#### Screen 5: Your Reaction (ส่วนที่ 5 | ข้อ 10)

**Q10: เมื่อปีที่แล้วท่านลงทุน 100,000 บาท ปีนี้เหลือ 85,000 บาท ท่านจะทำอย่างไร**
- ก. ตกใจ ขายออกทั้งหมด
- ข. กังวล จะเปลี่ยนไปลงทุนที่เสี่ยงน้อย
- ค. อดทน ถือต่อไปรอตลาดฟื้น
- ง. เชื่อในแผน ลงทุนเพิ่มเติม

---

### Scoring & Risk Profile

Scores range 10–40 (1 point per question).

| Score Range | Risk Level | Description |
|-------------|-----------|-------------|
| < 15 | Level 1 | เสี่ยงต่ำ (Low Risk) |
| 15–21 | Level 2 | เสี่ยงปานกลางค่อนข้างต่ำ (Moderate-Low Risk) |
| 22–29 | Level 3 | เสี่ยงปานกลางค่อนข้างสูง (Moderate-High Risk) |
| 30–36 | Level 4 | เสี่ยงสูง (High Risk) |
| ≥ 37 | Level 5 | เสี่ยงสูงมาก (Very High Risk) |

---

## 3. Results Screen

After Q10, display a **results page** with four sections:

### 3.1 Risk Profile Card
- **Header**: Colored left border (orange for moderate, etc.)
- **Content**:
  - Risk level name (e.g., "ระดับ 3: เสี่ยงปานกลางค่อนข้างสูง")
  - Score range (e.g., "คะแนน: 22-29")

### 3.2 Asset Allocation Grid
Display 4 key asset classes in a 2×2 grid with color-coded boxes:
- ตราสารหนี้ (Debt/Bonds)
- ตราสารทุน (Equities)
- เงินฝาก (Cash/Savings)
- การลงทุนทางเลือก (Alternative Investments)

Each box shows:
- Asset class name
- Recommended percentage (%)

**Allocation by Risk Level:**

| Level | ตราสารหนี้ | ตราสารทุน | เงินฝาก | ทางเลือก |
|-------|-----------|----------|--------|---------|
| 1 | >60% | <5% | <20% | <10% |
| 2 | <70% | <10% | <20% | <10% |
| 3 | <60% | <10% | <30% | <10% |
| 4 | <40% | <20% | <10% | <40% |
| 5 | <30% | <30% | <5% | >60% |

### 3.3 Recommendation Text
2-3 sentences explaining:
- What this risk level means
- Why it suits the user (based on age/situation)
- Suggested investment types or strategies

**Example for Level 3:**
> "ท่านสามารถรับความเสี่ยงในระดับปานกลาง เนื่องจากมีรายได้ที่เพียงพอและอายุที่เหมาะสมสำหรับการลงทุนระยะปานกลาง ลองพิจารณาการลงทุนในกองทุนรวมหุ้นและตราสารหนี้โดยมีอัตราส่วนที่เหมาะสม"

### 3.4 Start Over Button
- Label: "ทำแบบทดสอบใหม่"
- Action: Clear all answers, return to Q1

---

## 4. Architecture & Technology

### Tech Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS (plain, no framework)
- **Font**: Noto Sans Thai (Google Fonts)
- **Deployment**: GitHub Pages (static build artifacts)

### Component Structure (Approximate)

```
src/
├── App.tsx                 # Main container, state management
├── components/
│   ├── QuestionScreen.tsx  # Renders one screen (2-3 questions)
│   ├── QuestionGroup.tsx   # Groups related questions
│   ├── AnswerButton.tsx    # Multi-choice answer option
│   ├── ProgressBar.tsx     # Shows screen progress (e.g., "ข้อ 2 of 5")
│   ├── Chart.tsx           # Diverging bar chart for Q7
│   └── ResultsScreen.tsx   # Final results display
├── utils/
│   ├── scoring.ts          # Score calculation, level determination
│   ├── recommendations.ts  # Risk level descriptions & tips
│   └── allocations.ts      # Asset allocation data by level
└── styles/
    └── main.css            # Global styles, Noto Sans Thai setup
```

### Key Data
- **Questions**: Array of question objects with text, answers, and screen grouping
- **Scoring**: Lookup table (score → risk level)
- **Allocations**: Table of asset percentages by risk level
- **Recommendations**: Text blurbs for each risk level

### State Management
Use React `useState` for:
- Current screen (0–4)
- Answers array (10 items, each 1–4)
- Calculated score & risk level (computed on submission)

---

## 5. User Flow

1. **Land on app** → User sees Q1 immediately (no splash screen)
2. **Screen 1**: Answer Q1 & Q2, tap "ถัดไป"
3. **Screen 2**: Answer Q3 & Q4, tap "ถัดไป"
4. **Screen 3**: Answer Q5 & Q6, tap "ถัดไป"
5. **Screen 4**: Answer Q7 (with chart), Q8, Q9, tap "ถัดไป"
6. **Screen 5**: Answer Q10, tap "ส่ง" → Calculate score
7. **Results**: Display risk profile, allocations, recommendations
8. **Optional**: Tap "ทำแบบทดสอบใหม่" to reset and restart at Q1

---

## 6. Visual Design

### Colors
- **Primary**: #0066cc (blue, for buttons and accents)
- **Success/Positive**: Light orange (#f4d5a8 → #f08a4a) for gains in Q7 chart
- **Danger/Negative**: Light red → dark red (#d97a6a → #a83a2a) for losses in Q7 chart
- **Neutral**: #f5f5f5 (light gray backgrounds), #ddd (borders)
- **Text**: #333 (dark gray for readability)

### Typography
- **Font Family**: Noto Sans Thai (Google Fonts)
- **Headings** (h2, h3): 1.3em–1.1em, font-weight: bold
- **Body**: 0.95em, line-height: 1.5
- **Labels/Small**: 0.85em–0.9em, color: #666

### Mobile Layout
- **Viewport**: 100% width, vertical scrolling
- **Button Height**: min 44px (touch-friendly)
- **Padding/Spacing**: 16px standard (6px gaps between buttons)
- **Responsive**: Scales well 320px–768px (phone to tablet)

### Q7 Chart Details
- **Type**: Diverging horizontal bar chart (SVG)
- **Layout**: Gains above 0% line (light to dark orange), losses below 0% line (light to dark red)
- **Y-Axis**: -20% to +30% range
- **Legend**: "กำไร" (gain, orange), "ขาดทุน" (loss, red)
- **Labels**: Percentage text centered on each bar

---

## 7. Accessibility & Performance

### Accessibility
- Button text must be clear and descriptive
- Color not the only indicator (labels + legend for chart)
- Touch targets ≥ 44×44px minimum
- Sufficient contrast: text #333 on #f5f5f5 and white backgrounds

### Performance
- Single-page app (no external API calls)
- Minimal CSS, no heavy JS libraries
- Chart rendered as SVG (lightweight)
- Build: Static HTML/CSS/JS, deployed to GitHub Pages (instant load)

---

## 8. Deployment

- **Repository**: GitHub
- **Build**: `npm run build` → static files to `dist/`
- **Hosting**: GitHub Pages (serves `dist/` root)
- **URL**: `https://username.github.io/repo/` (or custom domain)
- **No backend required** — all logic in browser

---

## 9. Success Criteria

✅ Users complete questionnaire in <3 minutes  
✅ Results clearly show risk profile and allocations  
✅ Mobile experience is smooth and readable  
✅ Q7 chart visually communicates risk/reward tradeoff  
✅ Recommendations are actionable and understandable  
✅ App loads instantly (no server delay)  
✅ Thai language is natural and accessible to Gen Y/Z users  

---

## 10. Out of Scope

- User accounts, login, or persistent storage
- PDF export or result sharing
- Questions 11–12 (optional compliance questions) — not included in MVP
- Backend API or database
- Multiple language support (Thai-only for now)
- Analytics or tracking
- Admin dashboard or questionnaire editor

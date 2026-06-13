# Thai Investment Questionnaire

A client-side web application that helps Thai users discover their investment risk profile through a simple 10-question self-assessment questionnaire.

## Overview

**Thai Investment Questionnaire** is a lightweight, mobile-first web app designed for Thai Gen Y/Z users (ages 25–45) who want to understand their investment risk profile — without financial jargon or complexity.

Answer 10 simple questions across 5 screens, and receive:
- Your **risk level** (1–5 scale)
- **Asset allocation recommendations** (debt/equity/alternative split)
- **Personalized guidance** tailored to your profile

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite 5 |
| Styling | CSS with CSS Variables |
| Deployment | GitHub Pages |

## Features

- **10-question assessment** across 5 topics (financial situation, savings, goals, volatility comfort)
- **5 risk levels** from conservative (1) to aggressive (5)
- **Visual asset allocation** with interactive pie charts
- **Investment projections** with customizable inputs
- **Mobile-first design** — built for phones, works on desktop
- **Accessible UI** — WCAG AA compliant, reduced-motion support
- **Thai-language UI** — financial terms explained in Thai
- **No backend required** — everything runs in the browser

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pre-invest-test

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## Project Structure

```
pre-invest-test/
├── src/
│   ├── App.tsx                    # Main application component
│   ├── types.ts                   # TypeScript type definitions
│   ├── components/                # React components
│   │   ├── Header.tsx
│   │   ├── QuestionScreen.tsx
│   │   ├── ResultsScreen.tsx
│   │   ├── AnswerButton.tsx
│   │   ├── AllocationChart.tsx
│   │   ├── Chart.tsx
│   │   ├── ProjectionChart.tsx
│   │   ├── ProjectionInput.tsx
│   │   ├── ProjectionScreen.tsx
│   │   └── ProjectionSummary.tsx
│   ├── hooks/
│   │   └── useProjectionCalculator.ts
│   ├── utils/
│   │   ├── questions.ts           # Question definitions
│   │   ├── scoring.ts             # Score calculation
│   │   ├── recommendations.ts     # Risk profiles
│   │   ├── allocations.ts         # Asset allocation logic
│   │   └── ...
│   └── styles/
│       ├── global.css
│       └── variables.css
├── docs/
│   └── superpowers/
│       ├── plans/
│       └── specs/
├── PRODUCT.md                     # Product specification
├── package.json
└── vite.config.ts
```

## How It Works

1. **Answer questions** — One question at a time, 2 per screen
2. **Get your score** — Calculated from your answers (1–4 scale per question)
3. **See your risk level** — Mapped to 5 risk profiles (1=Conservative, 5=Aggressive)
4. **View recommendations** — Asset allocation pie chart + personalized guidance

## Risk Levels

| Level | Thai Name | Description |
|-------|-----------|-------------|
| 1 | ผู้พิทักษ์ | Conservative protector — prioritizes capital preservation |
| 2 | ผู้เสถียร | Stability seeker — values steady, predictable returns |
| 3 | ผู้สมดุล | Balanced grower — comfortable with moderate risk |
| 4 | ผู้เติบโต | Growth driver — actively seeks growth |
| 5 | ผู้บุกเบิก | Pioneer explorer — max growth, high volatility tolerance |

## Design Principles

- **Calm, clear, practical** — No corporate jargon, no fear-mongering
- **Show, don't tell** — Visual charts over text explanations
- **Mobile-first** — Built for phones, works on desktop
- **~3 minutes** — Quick assessment, no fluff
- **Accessible** — WCAG AA compliant, Thai-friendly typography

## Accessibility

- WCAG AA target for all UI text
- Reduced-motion support via `prefers-reduced-motion`
- Touch-friendly buttons (≥44px height)
- Proper contrast ratios (body text ≥4.5:1)
- Color blindness consideration in charts

## License

Private project — all rights reserved.
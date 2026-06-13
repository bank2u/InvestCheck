# Product

## Register

product

## Users

Thai Gen Y/Z users (age 25–45), non-investment professionals with no formal finance background. They come to the app to understand their own investment risk profile for personal financial planning. Context: mostly mobile users, seeking a quick self-assessment without jargon or corporate feel.

## Product Purpose

A **self-assessment questionnaire app** that helps Thai users determine their investment risk profile (1–5 scale) through a 10-question form. The app calculates a risk level based on the user's financial situation, savings, goals, and comfort with volatility. Users receive tailored asset allocation recommendations and explanatory text for their profile. All logic runs client-side; no backend, no data persistence. Deploy on GitHub Pages.

## Brand Personality

**Modern, accessible, approachable.** Not corporate or formal. Built for people who don't speak investment finance. Clean, minimal design with Thai typography (Noto Sans Thai) that feels contemporary, not stiff. Gen Y/Z sensibility—direct, uncluttered, helpful.

3 words: *Calm, clear, practical.*

## Anti-references

- **Corporate financial-advisor tone** (heavy, jargon-laden, trust-me-I'm-an-expert)
- **Overly decorative or playful** (sketchy illustrations, bright cheerful colors that undermine seriousness)
- **Dense form layouts** (cramped, cramped text, too many questions per screen)
- **Technical or intimidating language** (avoid terms like "portfolio volatility" without Thai translation or explanation)

## Design Principles

1. **Mobile-first, distraction-free** — Assume mobile. Streamline to the essential: question + 4 answers per screen, 2–3 questions grouped by topic. No navigation chrome, no intro, no fluff.
2. **Show, don't tell** — Use visual aids (diverging bar chart on Q7) to explain risk/reward tradeoffs instead of text.
3. **Practical Thai-language design** — Thai-first UI; financial terms kept or parenthesized (ตราสาร, etc.). Avoid English-heavy UI.
4. **Results that act as guidance, not judgment** — Risk level + asset allocations + actionable recommendations. Tone: "Here's where you sit. Here's what to consider." Not shame, not upsale.
5. **Speed** — No onboarding screen, no splash screen. Land → Q1. Users complete in ~3 min.

## Accessibility & Inclusion

- **WCAG AA target** for all UI text and interactive elements
- **Reduced-motion support** — Any animations must respect `prefers-reduced-motion`
- **Touch-friendly buttons** — ≥44px height for mobile
- **Contrast** — Body text ≥4.5:1 on backgrounds; all buttons and labels legible
- **No decorative barriers** — Information always accessible; decorative SVG/motion is enhancement, not blocking
- **Color blindness consideration** — Chart uses distinct forms (bars + legend); not color-only encoding

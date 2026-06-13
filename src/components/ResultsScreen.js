import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import ProjectionScreen from './ProjectionScreen';
import './ResultsScreen.css';
function getUserAgeFromQ1Answer(answer) {
    // Q1: age brackets mapped to midpoint
    // ก. >55 → 60, ข. 45–55 → 50, ค. 35–44 → 40, ง. <35 → 30
    const ageMap = {
        1: 60,
        2: 50,
        3: 40,
        4: 30,
    };
    return ageMap[answer];
}
export default function ResultsScreen({ profile, score, answers, onRestart }) {
    const [showProjection, setShowProjection] = useState(false);
    const userAge = getUserAgeFromQ1Answer(answers[1]);
    const allocations = [
        profile.allocations.debt,
        profile.allocations.equity,
        profile.allocations.cash,
        profile.allocations.alternative,
    ];
    return (_jsxs("div", { className: "results-screen", children: [_jsxs("div", { className: "risk-card", style: { borderLeftColor: profile.color }, children: [_jsx("div", { className: "risk-level", style: { color: profile.color }, children: profile.thaiName }), _jsxs("div", { className: "risk-score", children: ["\u0E04\u0E30\u0E41\u0E19\u0E19: ", score, " (", profile.scoreRange, ")"] })] }), _jsxs("div", { className: "allocations-section", children: [_jsx("h2", { className: "section-title", children: "\u0E01\u0E32\u0E23\u0E08\u0E31\u0E14\u0E2A\u0E23\u0E23\u0E40\u0E07\u0E34\u0E19\u0E25\u0E07\u0E17\u0E38\u0E19" }), _jsx("div", { className: "allocations-grid", children: allocations.map((allocation) => (_jsxs("div", { className: "allocation-box", children: [_jsx("div", { className: "allocation-color", style: { backgroundColor: allocation.color } }), _jsx("div", { className: "allocation-name", children: allocation.name }), _jsxs("div", { className: "allocation-percentage", children: [allocation.percentage, "%"] })] }, allocation.name))) })] }), _jsxs("div", { className: "recommendation-section", children: [_jsx("h2", { className: "section-title", children: "\u0E04\u0E33\u0E41\u0E19\u0E30\u0E19\u0E33" }), _jsx("p", { className: "recommendation-text", children: profile.recommendation })] }), _jsxs("div", { className: "fund-recommendations-section", children: [_jsx("h2", { className: "section-title", children: "\uD83D\uDCA1 \u0E01\u0E2D\u0E07\u0E17\u0E38\u0E19\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E2A\u0E21" }), _jsx("div", { className: "funds-list", children: profile.fundRecommendations.map((fund, idx) => (_jsx("div", { className: "fund-item", children: fund }, idx))) })] }), _jsxs("button", { className: "projection-button", onClick: () => setShowProjection(true), children: ["\uD83D\uDCA1 \u0E14\u0E39\u0E01\u0E32\u0E23\u0E25\u0E07\u0E17\u0E38\u0E19\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E43\u0E19 ", Math.min(10, 90 - (userAge || 25)), " \u0E1B\u0E35"] }), _jsx("button", { className: "restart-button", onClick: onRestart, children: "\u0E17\u0E33\u0E41\u0E1A\u0E1A\u0E17\u0E14\u0E2A\u0E2D\u0E1A\u0E43\u0E2B\u0E21\u0E48" }), showProjection && (_jsx(ProjectionScreen, { riskLevel: profile.level, userAge: userAge, onBack: () => setShowProjection(false) }))] }));
}

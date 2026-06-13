import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import './ProjectionSummary.css';
const riskColors = {
    1: '#EF4444',
    2: '#F97316',
    3: '#FBBF24',
    4: '#3B82F6',
    5: '#1E40AF',
};
export default function ProjectionSummary({ investmentBalance, bankBalance, years, riskLevel, }) {
    const difference = investmentBalance - bankBalance;
    const percentageGain = bankBalance > 0 ? ((difference / bankBalance) * 100).toFixed(1) : '0';
    return (_jsxs("div", { className: "projection-summary", style: { borderLeftColor: riskColors[riskLevel] }, children: [_jsxs("div", { className: "summary-header", children: ["\u0E2B\u0E25\u0E31\u0E07\u0E08\u0E32\u0E01 ", years, " \u0E1B\u0E35"] }), _jsxs("div", { className: "summary-row", children: [_jsx("span", { className: "summary-label", children: "\u0E25\u0E07\u0E17\u0E38\u0E19\u0E15\u0E32\u0E21\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07:" }), _jsxs("span", { className: "summary-value", children: ["\u0E3F", investmentBalance.toLocaleString('th-TH')] })] }), _jsxs("div", { className: "summary-row", children: [_jsx("span", { className: "summary-label", children: "\u0E40\u0E07\u0E34\u0E19\u0E1D\u0E32\u0E01\u0E18\u0E19\u0E32\u0E04\u0E32\u0E23:" }), _jsxs("span", { className: "summary-value", children: ["\u0E3F", bankBalance.toLocaleString('th-TH')] })] }), _jsx("div", { className: "summary-divider" }), _jsxs("div", { className: "summary-row highlight", children: [_jsx("span", { className: "summary-label", children: "\uD83D\uDCB0 \u0E40\u0E07\u0E34\u0E19\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E40\u0E15\u0E34\u0E21:" }), _jsxs("span", { className: "summary-value gain", children: ["\u0E3F", difference.toLocaleString('th-TH'), " (+", percentageGain, "%)"] })] })] }));
}

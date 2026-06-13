import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { getReturnRateByLevel } from '../utils/getReturnRateByLevel';
import './ProjectionChart.css';
export default function ProjectionChart({ projections, years, riskLevel }) {
    const investmentReturnPercent = (getReturnRateByLevel(riskLevel) * 100).toFixed(1);
    const bankReturnPercent = '1.4';
    if (!projections || projections.length === 0) {
        return _jsx("div", { className: "chart-empty", children: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E43\u0E2A\u0E48\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E01\u0E32\u0E23\u0E04\u0E32\u0E14\u0E01\u0E32\u0E23\u0E13\u0E4C" });
    }
    const chartDimensions = useMemo(() => {
        const maxBalance = Math.max(...projections.map((p) => Math.max(p.investmentBalance, p.bankBalance)));
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const width = 600;
        const height = 300;
        const xScale = (year) => {
            const xRange = width - padding.left - padding.right;
            return padding.left + (year / years) * xRange;
        };
        const yScale = (balance) => {
            const yRange = height - padding.top - padding.bottom;
            return height - padding.bottom - (balance / maxBalance) * yRange;
        };
        return { xScale, yScale, maxBalance, padding, width, height };
    }, [projections, years]);
    const { xScale, yScale, maxBalance, padding, width, height } = chartDimensions;
    const investmentPath = projections
        .map((p) => `${xScale(p.year)},${yScale(p.investmentBalance)}`)
        .join(' L ');
    const bankPath = projections
        .map((p) => `${xScale(p.year)},${yScale(p.bankBalance)}`)
        .join(' L ');
    const yAxisMax = Math.ceil(maxBalance / 100000) * 100000;
    return (_jsxs("div", { className: "projection-chart", children: [_jsxs("div", { className: "chart-return-rates", children: [_jsxs("div", { className: "return-rate-item", children: [_jsx("span", { className: "return-rate-label", children: "\u0E1C\u0E25\u0E15\u0E2D\u0E1A\u0E41\u0E17\u0E19\u0E25\u0E07\u0E17\u0E38\u0E19:" }), _jsxs("span", { className: "return-rate-value investment", children: [investmentReturnPercent, "%"] })] }), _jsxs("div", { className: "return-rate-item", children: [_jsx("span", { className: "return-rate-label", children: "\u0E1C\u0E25\u0E15\u0E2D\u0E1A\u0E41\u0E17\u0E19\u0E40\u0E07\u0E34\u0E19\u0E1D\u0E32\u0E01:" }), _jsxs("span", { className: "return-rate-value bank", children: [bankReturnPercent, "%"] })] })] }), _jsxs("svg", { viewBox: `0 0 ${width} ${height}`, className: "chart-svg", preserveAspectRatio: "xMidYMid meet", children: [[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const value = yAxisMax * ratio;
                        const y = yScale((value / yAxisMax) * maxBalance);
                        return (_jsxs("g", { children: [_jsx("line", { x1: padding.left - 4, y1: y, x2: padding.left, y2: y, stroke: "#ddd" }), _jsxs("text", { x: padding.left - 8, y: y, textAnchor: "end", fontSize: "11", fill: "#6b7280", children: [Math.round(value / 1000), "K"] })] }, `y-label-${i}`));
                    }), _jsx("line", { x1: padding.left, y1: padding.top, x2: padding.left, y2: 300 - padding.bottom, stroke: "#ddd", strokeWidth: "1" }), _jsx("line", { x1: padding.left, y1: height - padding.bottom, x2: width - padding.right, y2: height - padding.bottom, stroke: "#ddd", strokeWidth: "1" }), [0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = yScale((ratio / 1) * maxBalance);
                        return (_jsx("line", { x1: padding.left, y1: y, x2: width - padding.right, y2: y, stroke: "#f5f5f5", strokeWidth: "1" }, `grid-${i}`));
                    }), _jsx("polyline", { points: investmentPath, fill: "none", stroke: "#10b981", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), _jsx("polyline", { points: bankPath, fill: "none", stroke: "#9ca3af", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }), projections
                        .filter((p) => p.year % 2 === 0)
                        .map((p) => (_jsxs("text", { x: xScale(p.year), y: height - padding.bottom + 20, textAnchor: "middle", fontSize: "11", fill: "#6b7280", children: [p.year, "\u0E1B\u0E35"] }, `x-label-${p.year}`)))] }), _jsxs("div", { className: "chart-legend", children: [_jsxs("div", { className: "legend-item", children: [_jsx("span", { className: "legend-color", style: { backgroundColor: '#10b981' } }), _jsx("span", { className: "legend-label", children: "\u0E25\u0E07\u0E17\u0E38\u0E19\u0E15\u0E32\u0E21\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07" })] }), _jsxs("div", { className: "legend-item", children: [_jsx("span", { className: "legend-color", style: { backgroundColor: '#9ca3af' } }), _jsx("span", { className: "legend-label", children: "\u0E40\u0E07\u0E34\u0E19\u0E1D\u0E32\u0E01\u0E18\u0E19\u0E32\u0E04\u0E32\u0E23" })] })] })] }));
}

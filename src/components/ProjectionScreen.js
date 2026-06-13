import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { useProjectionCalculator } from '../hooks/useProjectionCalculator';
import { getMaxProjectionYears } from '../utils/getMaxProjectionYears';
import { getFinalProjection } from '../utils/projectionCalculations';
import ProjectionInput from './ProjectionInput';
import ProjectionChart from './ProjectionChart';
import ProjectionSummary from './ProjectionSummary';
import './ProjectionScreen.css';
export default function ProjectionScreen({ riskLevel, userAge, onBack }) {
    const maxYear = getMaxProjectionYears(userAge);
    const [monthlyAmount, setMonthlyAmount] = useState(5000);
    const [selectedYear, setSelectedYear] = useState(10);
    const chartSectionRef = useRef(null);
    const projections = useProjectionCalculator(monthlyAmount, selectedYear, riskLevel);
    const finalProjection = getFinalProjection(projections, selectedYear);
    useEffect(() => {
        if (monthlyAmount > 0 && chartSectionRef.current) {
            setTimeout(() => {
                chartSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [monthlyAmount]);
    return (_jsxs("div", { className: "projection-screen", children: [_jsxs("div", { className: "projection-header", children: [_jsx("button", { className: "back-button", onClick: onBack, children: "\u2190 \u0E01\u0E25\u0E31\u0E1A\u0E44\u0E1B\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C" }), _jsx("h2", { className: "projection-title", children: "\uD83D\uDCA1 \u0E14\u0E39\u0E01\u0E32\u0E23\u0E25\u0E07\u0E17\u0E38\u0E19\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13" })] }), _jsx(ProjectionInput, { monthlyAmount: monthlyAmount, selectedYear: selectedYear, userAge: userAge, riskLevel: riskLevel, onAmountChange: setMonthlyAmount, onYearChange: setSelectedYear }), _jsx("div", { className: "chart-section", ref: chartSectionRef, children: monthlyAmount > 0 && (_jsxs(_Fragment, { children: [_jsx(ProjectionSummary, { investmentBalance: finalProjection?.investmentBalance || 0, bankBalance: finalProjection?.bankBalance || 0, years: selectedYear, riskLevel: riskLevel }), _jsx(ProjectionChart, { projections: projections, years: selectedYear })] })) })] }));
}

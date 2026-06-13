import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { getMaxProjectionYears } from '../utils/getMaxProjectionYears';
import './ProjectionInput.css';
export default function ProjectionInput({ monthlyAmount, selectedYear, userAge, onAmountChange, onYearChange, }) {
    const maxYear = getMaxProjectionYears(userAge);
    const handleAmountInput = (e) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        const amount = value ? parseInt(value, 10) : 0;
        onAmountChange(amount);
    };
    const handleYearChange = (e) => {
        const year = parseInt(e.target.value, 10);
        onYearChange(year);
    };
    return (_jsxs("div", { className: "projection-input", children: [_jsxs("div", { className: "input-group", children: [_jsx("label", { className: "input-label", children: "\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19\u0E2D\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E40\u0E14\u0E37\u0E2D\u0E19" }), _jsxs("div", { className: "currency-input-wrapper", children: [_jsx("span", { className: "currency-symbol", children: "\u0E3F" }), _jsx("input", { type: "text", inputMode: "numeric", className: "currency-input", placeholder: "\u0E43\u0E2A\u0E48\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19", value: monthlyAmount.toLocaleString(), onChange: handleAmountInput })] }), monthlyAmount === 0 && _jsx("div", { className: "input-error", children: "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E43\u0E2A\u0E48\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19" })] }), _jsxs("div", { className: "slider-group", children: [_jsxs("label", { className: "slider-label", children: ["\u0E23\u0E30\u0E22\u0E30\u0E40\u0E27\u0E25\u0E32\u0E01\u0E32\u0E23\u0E25\u0E07\u0E17\u0E38\u0E19: ", _jsxs("span", { className: "slider-value", children: [selectedYear, " \u0E1B\u0E35"] })] }), _jsx("input", { type: "range", min: 5, max: maxYear, value: selectedYear, onChange: handleYearChange, className: "year-slider" }), _jsxs("div", { className: "slider-marks", children: [_jsx("span", { children: "5" }), _jsx("span", { children: Math.floor(maxYear / 2) }), _jsx("span", { children: maxYear })] })] })] }));
}

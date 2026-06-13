import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './Chart.css';
export default function Chart({ answers, selectedValue, onSelect }) {
    const data = [
        { gain: 2.5, loss: 0 },
        { gain: 7, loss: 1 },
        { gain: 15, loss: 5 },
        { gain: 25, loss: 15 },
    ];
    return (_jsx("div", { className: "chart-container", children: _jsx("div", { className: "chart-grid", children: answers.map((answer, idx) => {
                const { gain, loss } = data[idx];
                const isSelected = selectedValue === answer.value;
                return (_jsxs("button", { className: `chart-option ${isSelected ? 'selected' : ''}`, onClick: () => onSelect(answer.value), type: "button", children: [_jsx("div", { className: "option-header", children: answer.label.split(' —')[0] }), _jsxs("div", { className: "option-bars", children: [_jsxs("div", { className: "bar-pair", children: [_jsx("div", { className: "bar-label", children: "\u0E01\u0E33\u0E44\u0E23" }), _jsx("div", { className: "bar-bar gain-bar", style: { width: `${(gain / 25) * 100}%` }, children: _jsxs("span", { className: "bar-value", children: ["+", gain, "%"] }) })] }), _jsxs("div", { className: "bar-pair", children: [_jsx("div", { className: "bar-label", children: "\u0E02\u0E32\u0E14\u0E17\u0E38\u0E19" }), _jsx("div", { className: "bar-bar loss-bar", style: { width: loss > 0 ? `${(loss / 15) * 100}%` : '0%' }, children: loss > 0 && _jsxs("span", { className: "bar-value", children: ["-", loss, "%"] }) })] })] })] }, answer.value));
            }) }) }));
}

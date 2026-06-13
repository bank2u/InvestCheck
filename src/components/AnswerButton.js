import { jsx as _jsx } from "react/jsx-runtime";
import './AnswerButton.css';
export default function AnswerButton({ label, value, isSelected, onClick }) {
    return (_jsx("button", { className: `answer-button ${isSelected ? 'selected' : ''}`, onClick: () => onClick(value), "aria-pressed": isSelected, children: label }));
}

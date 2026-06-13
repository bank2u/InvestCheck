import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AnswerButton from './AnswerButton';
import Chart from './Chart';
import './QuestionScreen.css';
export default function QuestionScreen({ questions, currentAnswers, onAnswer, progressText, }) {
    return (_jsxs("div", { className: "question-screen", children: [_jsxs("div", { className: "progress-indicator", children: [_jsx("span", { className: "progress-text", children: progressText }), _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: {
                                width: `${(parseInt(progressText.split(' ')[0]) / 10) * 100}%`,
                            } }) })] }), _jsx("div", { className: "questions-container", children: questions.map((question) => (_jsxs("div", { className: "question-group", children: [_jsx("h2", { className: "question-text", children: question.text }), question.id === 7 ? (_jsx(Chart, { answers: question.answers.map((a) => ({
                                ...a,
                                label: getChartLabel(a.label, a.value),
                            })), selectedValue: currentAnswers[question.id], onSelect: (value) => onAnswer(question.id, value) })) : (_jsx("div", { className: "answers-grid", children: question.answers.map((answer) => (_jsx(AnswerButton, { label: answer.label, value: answer.value, isSelected: currentAnswers[question.id] === answer.value, onClick: (value) => onAnswer(question.id, value) }, answer.value))) }))] }, question.id))) })] }));
}
function getChartLabel(label, value) {
    const gains = ['+2.5%', '+7%', '+15%', '+25%'];
    const losses = ['0%', '-1%', '-5%', '-15%'];
    return `${label} — โอกาสได้ ${gains[value - 1]}, ${losses[value - 1] === '0%' ? 'ไม่มี' : 'อาจ'}ขาดทุน ${losses[value - 1]}`;
}

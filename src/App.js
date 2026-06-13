import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { QUESTIONS } from './utils/questions';
import { calculateScore, calculateRiskLevel } from './utils/scoring';
import { getRiskProfile } from './utils/recommendations';
import Header from './components/Header';
import QuestionScreen from './components/QuestionScreen';
import ResultsScreen from './components/ResultsScreen';
import './styles/global.css';
import './App.css';
export default function App() {
    const [appState, setAppState] = useState('questions');
    const [currentScreen, setCurrentScreen] = useState(1);
    const [answers, setAnswers] = useState({});
    const handleAnswer = (questionId, value) => {
        const newAnswers = { ...answers, [questionId]: value };
        setAnswers(newAnswers);
        const currentQuestion = QUESTIONS.find((q) => q.id === questionId);
        const currentScreenQuestions = QUESTIONS.filter((q) => q.screen === currentQuestion.screen);
        // Check if all questions on current screen are answered
        const allCurrentScreenAnswered = currentScreenQuestions.every((q) => newAnswers[q.id] !== undefined);
        if (allCurrentScreenAnswered) {
            // Check if there's a next screen
            const nextScreenQuestions = QUESTIONS.filter((q) => q.screen === currentQuestion.screen + 1);
            if (nextScreenQuestions.length === 0) {
                // No more screens, all 10 questions answered
                const score = calculateScore(newAnswers);
                if (score > 0) {
                    setAppState('results');
                }
            }
            else {
                // Move to next screen
                setCurrentScreen(currentQuestion.screen + 1);
            }
        }
    };
    const handleRestart = () => {
        setAppState('questions');
        setCurrentScreen(1);
        setAnswers({});
    };
    if (appState === 'results') {
        const score = calculateScore(answers);
        const riskLevel = calculateRiskLevel(score);
        const profile = getRiskProfile(riskLevel);
        return (_jsxs("div", { className: "app", children: [_jsx(Header, {}), _jsx(ResultsScreen, { profile: profile, score: score, answers: answers, onRestart: handleRestart })] }));
    }
    const screenQuestions = QUESTIONS.filter((q) => q.screen === currentScreen);
    const answeredCount = Object.values(answers).filter((v) => v !== undefined).length;
    const progressText = `ข้อที่ ${answeredCount} จาก 10`;
    return (_jsxs("div", { className: "app", children: [_jsx(Header, {}), _jsx(QuestionScreen, { questions: screenQuestions, currentAnswers: answers, onAnswer: handleAnswer, progressText: progressText })] }));
}

import { useState } from 'react';
import { AnswerValue, Answers } from './types';
import { QUESTIONS } from './utils/questions';
import { calculateScore, calculateRiskLevel } from './utils/scoring';
import { getRiskProfile } from './utils/recommendations';
import Header from './components/Header';
import QuestionScreen from './components/QuestionScreen';
import ResultsScreen from './components/ResultsScreen';
import './styles/global.css';
import './App.css';

type AppState = 'questions' | 'results';

export default function App() {
  const [appState, setAppState] = useState<AppState>('questions');
  const [currentScreen, setCurrentScreen] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});

  const handleAnswer = (questionId: number, value: AnswerValue) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    const currentScreenQuestions = QUESTIONS.filter(
      (q) => q.screen === currentScreen
    );
    const allCurrentScreenAnswered = currentScreenQuestions.every(
      (q) => answers[q.id] !== undefined
    );

    if (allCurrentScreenAnswered) {
      const nextScreenQuestions = QUESTIONS.filter(
        (q) => q.screen === currentScreen + 1
      );

      if (nextScreenQuestions.length === 0) {
        const score = calculateScore(answers);
        if (score > 0) {
          setAppState('results');
        }
      } else {
        setCurrentScreen(currentScreen + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentScreen > 1) {
      setCurrentScreen(currentScreen - 1);
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

    return (
      <div className="app">
        <Header />
        <ResultsScreen profile={profile} score={score} answers={answers} onRestart={handleRestart} />
      </div>
    );
  }

  const screenQuestions = QUESTIONS.filter((q) => q.screen === currentScreen);
  const answeredCount = Object.values(answers).filter((v) => v !== undefined).length;
  const progressText = `ข้อที่ ${answeredCount} จาก 10`;

  return (
    <div className="app">
      <Header />
      <QuestionScreen
        questions={screenQuestions}
        currentAnswers={answers}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onBack={handleBack}
        canGoBack={currentScreen > 1}
        progressText={progressText}
      />
    </div>
  );
}

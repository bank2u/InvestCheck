import { Question, AnswerValue } from '../types';
import AnswerButton from './AnswerButton';
import Chart from './Chart';
import './QuestionScreen.css';

interface Props {
  questions: Question[];
  currentAnswers: Record<number, AnswerValue | undefined>;
  onAnswer: (questionId: number, value: AnswerValue) => void;
  onNext: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
  progressText: string;
}

export default function QuestionScreen({
  questions,
  currentAnswers,
  onAnswer,
  onNext,
  onBack,
  canGoBack,
  progressText,
}: Props) {
  return (
    <div className="question-screen">
      <div className="progress-indicator">
        <span className="progress-text">{progressText}</span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(parseInt(progressText.split(' ')[0]) / 10) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="questions-container">
        {questions.map((question) => (
          <div key={question.id} className="question-group">
            <h2 className="question-text">{question.text}</h2>

            {question.id === 7 ? (
              <Chart
                answers={question.answers.map((a) => ({
                  ...a,
                  label: getChartLabel(a.label, a.value),
                }))}
                selectedValue={currentAnswers[question.id]}
                onSelect={(value) => onAnswer(question.id, value)}
              />
            ) : (
              <div className="answers-grid">
                {question.answers.map((answer) => (
                  <AnswerButton
                    key={answer.value}
                    label={answer.label}
                    value={answer.value}
                    isSelected={currentAnswers[question.id] === answer.value}
                    onClick={(value) => onAnswer(question.id, value)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="button-bar">
        {canGoBack && (
          <button
            className="btn btn-secondary"
            onClick={onBack}
          >
            ← ย้อนกลับ
          </button>
        )}
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={questions.some((q) => currentAnswers[q.id] === undefined)}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}

function getChartLabel(label: string, value: 1 | 2 | 3 | 4): string {
  const gains = ['+2.5%', '+7%', '+15%', '+25%'];
  const losses = ['0%', '-1%', '-5%', '-15%'];
  return `${label} — โอกาสได้ ${gains[value - 1]}, ${losses[value - 1] === '0%' ? 'ไม่มี' : 'อาจ'}ขาดทุน ${losses[value - 1]}`;
}

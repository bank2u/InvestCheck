import { AnswerValue } from '../types';
import './Chart.css';

interface Answer {
  label: string;
  value: AnswerValue;
}

interface Props {
  answers: Answer[];
  selectedValue: AnswerValue | undefined;
  onSelect: (value: AnswerValue) => void;
}

export default function Chart({ answers, selectedValue, onSelect }: Props) {
  const data = [
    { gain: 2.5, loss: 0 },
    { gain: 7, loss: 1 },
    { gain: 15, loss: 5 },
    { gain: 25, loss: 15 },
  ];

  return (
    <div className="chart-container">
      <div className="chart-grid">
        {answers.map((answer, idx) => {
          const { gain, loss } = data[idx];
          const isSelected = selectedValue === answer.value;

          return (
            <button
              key={answer.value}
              className={`chart-option ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(answer.value)}
              type="button"
            >
              <div className="option-header">{answer.label.split(' —')[0]}</div>

              <div className="option-bars">
                <div className="bar-pair">
                  <div className="bar-label">กำไร</div>
                  <div className="bar-bar gain-bar" style={{ width: `${(gain / 25) * 100}%` }}>
                    <span className="bar-value">+{gain}%</span>
                  </div>
                </div>
                <div className="bar-pair">
                  <div className="bar-label">ขาดทุน</div>
                  <div className="bar-bar loss-bar" style={{ width: loss > 0 ? `${(loss / 15) * 100}%` : '0%' }}>
                    {loss > 0 && <span className="bar-value">-{loss}%</span>}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

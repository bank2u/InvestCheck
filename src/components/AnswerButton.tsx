import { AnswerValue } from '../types';
import './AnswerButton.css';

interface Props {
  label: string;
  value: AnswerValue;
  isSelected: boolean;
  onClick: (value: AnswerValue) => void;
}

export default function AnswerButton({ label, value, isSelected, onClick }: Props) {
  return (
    <button
      className={`answer-button ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(value)}
      aria-pressed={isSelected}
    >
      {label}
    </button>
  );
}

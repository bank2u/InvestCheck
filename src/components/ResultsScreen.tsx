import { useState } from 'react';
import { RiskProfile, AnswerValue, Answers } from '../types';
import ProjectionScreen from './ProjectionScreen';
import AllocationChart from './AllocationChart';
import './ResultsScreen.css';

interface Props {
  profile: RiskProfile;
  score: number;
  answers: Answers;
  onRestart: () => void;
}

function getUserAgeFromQ1Answer(answer: AnswerValue): number {
  // Q1: age brackets mapped to midpoint
  // ก. >55 → 60, ข. 45–55 → 50, ค. 35–44 → 40, ง. <35 → 30
  const ageMap: Record<AnswerValue, number> = {
    1: 60,
    2: 50,
    3: 40,
    4: 30,
  };
  return ageMap[answer];
}

export default function ResultsScreen({ profile, score, answers, onRestart }: Props) {
  const [showProjection, setShowProjection] = useState(false);
  const userAge = getUserAgeFromQ1Answer(answers[1] as AnswerValue);
  const allocations = [
    profile.allocations.debt,
    profile.allocations.equity,
    profile.allocations.cash,
    profile.allocations.alternative,
  ];

  return (
    <div className="results-screen">
      <div className="risk-card" style={{ borderLeftColor: profile.color }}>
        <div className="risk-level" style={{ color: profile.color }}>
          {profile.thaiName}
        </div>
        <div className="risk-score">
          คะแนน: {score} ({profile.scoreRange})
        </div>
      </div>

      <div className="allocations-section">
        <h2 className="section-title">การจัดสรรเงินลงทุน</h2>
        <AllocationChart allocations={allocations} />
      </div>

      <div className="recommendation-section">
        <h2 className="section-title">คำแนะนำ</h2>
        <p className="recommendation-text">{profile.recommendation}</p>
      </div>

      <div className="fund-recommendations-section">
        <h2 className="section-title">💡 กองทุนที่เหมาะสม</h2>
        <div className="funds-list">
          {profile.fundRecommendations.map((fund, idx) => (
            <div key={idx} className="fund-item">
              {fund}
            </div>
          ))}
        </div>
      </div>

      <button className="projection-button" onClick={() => setShowProjection(true)}>
        💡 ดูการลงทุนของคุณใน {Math.min(10, 90 - (userAge || 25))} ปี
      </button>

      <button className="restart-button" onClick={onRestart}>
        ทำแบบทดสอบใหม่
      </button>

      {showProjection && (
        <ProjectionScreen
          riskLevel={profile.level}
          userAge={userAge}
          onBack={() => setShowProjection(false)}
        />
      )}
    </div>
  );
}

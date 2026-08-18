const LEVEL_LABELS = {
  LOW: 'LOW CLOUD READINESS',
  MODERATE: 'MODERATE CLOUD READINESS',
  HIGH: 'HIGH CLOUD READINESS',
  'CLOUD READY': 'CLOUD READY',
};

function levelClass(level) {
  return `readiness-badge-${level.toLowerCase().replace(/\s+/g, '-')}`;
}

function ReadinessScore({ score, level }) {
  return (
    <div className="readiness-score">
      <span className="readiness-score-value">{score}%</span>
      <span className={`readiness-badge ${levelClass(level)}`}>
        {LEVEL_LABELS[level] || level}
      </span>
    </div>
  );
}

export default ReadinessScore;

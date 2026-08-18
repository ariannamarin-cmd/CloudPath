function RecommendationCard({ priority, action, reason, compact }) {
  return (
    <div className={`recommendation-card${compact ? ' recommendation-card-compact' : ''}`}>
      <span className={`priority-badge priority-${priority.toLowerCase()}`}>{priority} PRIORITY</span>
      <p className="recommendation-action">{action}</p>
      <p className="recommendation-reason">{reason}</p>
    </div>
  );
}

export default RecommendationCard;

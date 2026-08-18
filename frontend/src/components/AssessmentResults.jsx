import ReadinessScore from './ReadinessScore';
import StrategyCard from './StrategyCard';
import RecommendationCard from './RecommendationCard';

function AssessmentResults({ result, onReset }) {
  const {
    readinessScore,
    readinessLevel,
    modernizationStrategy,
    strategyExplanation,
    summary,
    strengths,
    gaps,
    recommendations,
  } = result;

  const topRecommendations = recommendations.slice(0, 3);
  const remainingRecommendations = recommendations.slice(3);

  return (
    <div className="assessment-results">
      <section className="card score-card">
        <ReadinessScore score={readinessScore} level={readinessLevel} />
        <p className="result-summary">{summary}</p>
      </section>

      <StrategyCard strategy={modernizationStrategy} explanation={strategyExplanation} />

      <section className="card">
        <h2>Strengths</h2>
        {strengths.length > 0 ? (
          <ul className="strengths-list">
            {strengths.map((strength) => (
              <li key={strength}>
                <span className="strength-check" aria-hidden="true">✓</span> {strength}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No cloud-ready capabilities identified yet.</p>
        )}
      </section>

      <section className="card">
        <h2>Modernization Gaps</h2>
        {gaps.length > 0 ? (
          <ul className="gaps-list">
            {gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No modernization gaps identified.</p>
        )}
      </section>

      <section className="card">
        <h2>Prioritized Recommendations</h2>
        <div className="recommendations-top">
          {topRecommendations.map((rec) => (
            <RecommendationCard key={rec.action} {...rec} />
          ))}
        </div>
        {remainingRecommendations.length > 0 && (
          <div className="recommendations-more">
            {remainingRecommendations.map((rec) => (
              <RecommendationCard key={rec.action} {...rec} compact />
            ))}
          </div>
        )}
      </section>

      <button type="button" className="secondary-button" onClick={onReset}>
        Assess Another Application
      </button>
    </div>
  );
}

export default AssessmentResults;

function StrategyCard({ strategy, explanation }) {
  return (
    <section className="card strategy-card">
      <h2>Recommended Modernization Strategy</h2>
      <p className="strategy-name">{strategy}</p>
      <p className="strategy-explanation">{explanation}</p>
    </section>
  );
}

export default StrategyCard;

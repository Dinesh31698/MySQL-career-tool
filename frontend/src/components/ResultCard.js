function ResultCard({ result }) {
  const totalAnswers = Object.values(result.scores || {}).reduce(
    (sum, score) => sum + score,
    0
  );

  const sortedScores = Object.entries(result.scores || {})
    .map(([career, total]) => ({
      career,
      total,
      percent: totalAnswers ? Math.round((total / totalAnswers) * 100) : 0
    }))
    .sort((a, b) => b.total - a.total);

  const alternativeCareer = sortedScores.find((item) => item.career !== result.career);

  return (
    <div className="result-card">
      <div className="result-banner">
        <span className="eyebrow">Best Career Match</span>
        <h1>{result.heading || result.career}</h1>
        <p>{result.shortDescription}</p>
      </div>

      <div className="insight-grid">
        <div className="insight-card">
          <span>Top Match</span>
          <strong>{result.career}</strong>
        </div>
        <div className="insight-card">
          <span>Confidence</span>
          <strong>{sortedScores[0]?.percent || 0}%</strong>
        </div>
        <div className="insight-card">
          <span>Questions Answered</span>
          <strong>{totalAnswers}</strong>
        </div>
        <div className="insight-card">
          <span>Alternative Path</span>
          <strong>{alternativeCareer?.career || "None yet"}</strong>
        </div>
      </div>

      <div className="panel-block">
        <h3>Why this career fits you</h3>
        <p>{result.detail}</p>
      </div>

      <div className="panel-block">
        <h3>Score breakdown</h3>
        <div className="chart-list">
          {sortedScores.map((item) => (
            <div className="chart-row" key={item.career}>
              <div className="chart-head">
                <span>{item.career}</span>
                <span>{item.percent}%</span>
              </div>
              <div className="chart-track">
                <div className="chart-fill" style={{ width: `${item.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResultCard;

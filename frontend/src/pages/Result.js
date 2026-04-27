import { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ResultCard from "../components/ResultCard";
import { getLatestResult } from "../services/api";

function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = useMemo(() => {
    if (location.state?.result) {
      return location.state.result;
    }

    return getLatestResult();
  }, [location.state]);

  if (!result) {
    return (
      <section className="page-section">
        <div className="container narrow-container">
          <div className="panel centered-text">
            <span className="eyebrow">Result</span>
            <h2>No result found</h2>
            <p className="muted-text">Complete the quiz first to see your result.</p>
            <button className="primary-button" type="button" onClick={() => navigate("/quiz")}>
              Go to Quiz
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container narrow-container">
        <ResultCard result={result} />

        <div className="action-row centered-row">
          <Link className="primary-button" to="/quiz">
            Retake Quiz
          </Link>
          <Link className="secondary-button" to="/">
            Back Home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Result;

import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="page-section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Career Assessment Quiz</span>
          <h1>Discover the career path that matches your mindset.</h1>
          <p>
            Answer a few simple questions, get an instant recommendation, and explore
            whether you match best with Engineering, Teaching/Healthcare, or Design.
          </p>

          <div className="action-row">
            <Link className="primary-button" to="/quiz">
              Start Quiz
            </Link>
            <Link className="secondary-button" to="/admin">
              Open Admin
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-block">
            <h3>What this app includes</h3>
            <ul className="feature-list">
              <li>Quiz page with one answer per question</li>
              <li>Separate result page with breakdown</li>
              <li>Admin login system</li>
              <li>Admin panel to add questions</li>
              <li>Result analysis charts</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container info-grid">
        <div className="info-card">
          <h3>Engineer</h3>
          <p>For users who enjoy solving problems, systems, logic, and building solutions.</p>
        </div>

        <div className="info-card">
          <h3>Teacher/Doctor</h3>
          <p>For users who care deeply about helping people, guiding others, and service.</p>
        </div>

        <div className="info-card">
          <h3>Designer</h3>
          <p>For users who enjoy creativity, visuals, ideas, and making things beautiful.</p>
        </div>
      </div>
    </section>
  );
}

export default Home;

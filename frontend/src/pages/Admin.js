import { useEffect, useState } from "react";
import {
  addQuestion,
  clearAdminSession,
  getQuestions,
  getResultAnalysis,
  loginAdmin
} from "../services/api";

function createDefaultQuestionForm() {
  return {
    question: "",
    options: [
      { text: "Solving problems", careerTag: "Engineer" },
      { text: "Helping people", careerTag: "Teacher/Doctor" },
      { text: "Designing things", careerTag: "Designer" }
    ]
  };
}

function Admin({ adminSession, onAuthChange }) {
  const [loginForm, setLoginForm] = useState({
    email: "admin@careercompass.com",
    password: "admin123"
  });
  const [questionForm, setQuestionForm] = useState(createDefaultQuestionForm);
  const [questions, setQuestions] = useState([]);
  const [analysis, setAnalysis] = useState([]);
  const [loading, setLoading] = useState(Boolean(adminSession?.token));
  const [saving, setSaving] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadDashboard = async (token) => {
    try {
      setLoading(true);
      setError("");

      const [questionData, analysisData] = await Promise.all([
        getQuestions(),
        getResultAnalysis(token)
      ]);

      setQuestions(Array.isArray(questionData) ? questionData : []);
      setAnalysis(Array.isArray(analysisData.analysis) ? analysisData.analysis : []);
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403) {
        clearAdminSession();
        onAuthChange(null);
      }

      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminSession?.token) {
      loadDashboard(adminSession.token);
    } else {
      setQuestions([]);
      setAnalysis([]);
      setLoading(false);
    }
  }, [adminSession]);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;

    setLoginForm((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoginLoading(true);

    try {
      const session = await loginAdmin(loginForm);
      onAuthChange(session);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuestionChange = (event) => {
    setQuestionForm((current) => ({
      ...current,
      question: event.target.value
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setQuestionForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();

    if (!adminSession?.token) {
      setError("Please login first.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await addQuestion(questionForm, adminSession.token);
      setQuestionForm(createDefaultQuestionForm());
      setSuccessMessage("Question added successfully.");
      await loadDashboard(adminSession.token);
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403) {
        clearAdminSession();
        onAuthChange(null);
      }

      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const totalResponses = analysis.reduce((sum, item) => sum + Number(item.total), 0);

  if (!adminSession?.token) {
    return (
      <section className="page-section">
        <div className="container narrow-container">
          <div className="panel auth-panel">
            <span className="eyebrow">Admin Login</span>
            <h2>Manage questions and result analysis</h2>
            <p className="muted-text">
              Demo credentials are already filled for quick testing.
            </p>

            {error && <div className="message-box error-box">{error}</div>}

            <form className="form-grid" onSubmit={handleLoginSubmit}>
              <label className="form-field">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                />
              </label>

              <label className="form-field">
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                />
              </label>

              <button className="primary-button" type="submit" disabled={loginLoading}>
                {loginLoading ? "Signing in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container admin-layout">
        <div className="panel">
          <span className="eyebrow">Admin Panel</span>
          <h2>Add quiz questions</h2>
          <p className="muted-text">
            Create new questions and map each option to a career result.
          </p>

          {error && <div className="message-box error-box">{error}</div>}
          {successMessage && <div className="message-box success-box">{successMessage}</div>}

          <form className="form-grid" onSubmit={handleQuestionSubmit}>
            <label className="form-field">
              <span>Question</span>
              <input
                type="text"
                value={questionForm.question}
                onChange={handleQuestionChange}
                placeholder="Enter your new question"
                required
              />
            </label>

            {questionForm.options.map((option, index) => (
              <div className="option-editor" key={`admin-option-${index}`}>
                <label className="form-field">
                  <span>Option {index + 1}</span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(event) =>
                      handleOptionChange(index, "text", event.target.value)
                    }
                    required
                  />
                </label>

                <label className="form-field">
                  <span>Career Tag</span>
                  <select
                    value={option.careerTag}
                    onChange={(event) =>
                      handleOptionChange(index, "careerTag", event.target.value)
                    }
                  >
                    <option value="Engineer">Engineer</option>
                    <option value="Teacher/Doctor">Teacher/Doctor</option>
                    <option value="Designer">Designer</option>
                  </select>
                </label>
              </div>
            ))}

            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Add Question"}
            </button>
          </form>
        </div>

        <div className="dashboard-stack">
          <div className="stats-grid">
            <div className="insight-card">
              <span>Total Questions</span>
              <strong>{questions.length}</strong>
            </div>
            <div className="insight-card">
              <span>Total Responses</span>
              <strong>{totalResponses}</strong>
            </div>
            <div className="insight-card">
              <span>Top Career</span>
              <strong>{analysis[0]?.career || "No data"}</strong>
            </div>
          </div>

          <div className="panel">
            <h3>Result analysis chart</h3>
            <p className="muted-text">See which career result users get most often.</p>

            {loading ? (
              <p className="muted-text">Loading dashboard...</p>
            ) : analysis.length === 0 ? (
              <div className="empty-state">
                <h4>No result data yet</h4>
                <p>Once users submit the quiz, analysis will appear here.</p>
              </div>
            ) : (
              <div className="chart-list">
                {analysis.map((item) => {
                  const width = totalResponses
                    ? Math.round((Number(item.total) / totalResponses) * 100)
                    : 0;

                  return (
                    <div className="chart-row" key={item.career}>
                      <div className="chart-head">
                        <span>{item.career}</span>
                        <span>{item.total}</span>
                      </div>
                      <div className="chart-track">
                        <div className="chart-fill" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="panel">
            <h3>Current questions</h3>

            {questions.length === 0 ? (
              <div className="empty-state">
                <h4>No questions available</h4>
                <p>Add your first question from the form.</p>
              </div>
            ) : (
              <div className="question-preview-list">
                {questions.map((question) => (
                  <div className="question-preview" key={question.id}>
                    <h4>{question.question}</h4>
                    <ul>
                      {question.options.map((option) => (
                        <li key={option.id}>{option.text}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Admin;

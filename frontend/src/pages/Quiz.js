import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import {
  clearQuizProgress,
  getQuestions,
  getQuizProgress,
  saveLatestResult,
  saveQuizProgress,
  submitQuizResult
} from "../services/api";

const careerProfiles = {
  Engineer: {
    heading: "Engineer",
    shortDescription:
      "You enjoy solving problems, thinking logically, and building practical solutions.",
    detail:
      "Your answers show a strong preference for structured thinking, technical curiosity, and real problem-solving. Engineering-related careers could be a great match for you."
  },
  "Teacher/Doctor": {
    heading: "Teacher/Doctor",
    shortDescription:
      "You are motivated by helping people, supporting others, and making a positive difference.",
    detail:
      "Your responses reflect empathy, care, and a people-first mindset. Careers in teaching, healthcare, counseling, or social support may suit you well."
  },
  Designer: {
    heading: "Designer",
    shortDescription:
      "You are drawn to creativity, aesthetics, and turning ideas into experiences.",
    detail:
      "Your answers suggest imagination, visual thinking, and creative energy. Design-focused roles like UI/UX, graphic design, branding, or product design may fit you best."
  }
};

function mapOptionToCareer(answer = {}) {
  const combinedValue = `${answer.careerTag || ""} ${answer.text || ""}`.trim().toLowerCase();

  if (combinedValue.includes("engineer") || combinedValue.includes("problem")) {
    return "Engineer";
  }

  if (
    combinedValue.includes("teacher") ||
    combinedValue.includes("doctor") ||
    combinedValue.includes("help")
  ) {
    return "Teacher/Doctor";
  }

  if (combinedValue.includes("designer") || combinedValue.includes("design")) {
    return "Designer";
  }

  return "Engineer";
}

function calculateCareerResult(answers) {
  const scores = {
    Engineer: 0,
    "Teacher/Doctor": 0,
    Designer: 0
  };

  answers.forEach((answer) => {
    const career = mapOptionToCareer(answer);
    scores[career] += 1;
  });

  const winningCareer = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  return {
    career: winningCareer,
    scores,
    ...careerProfiles[winningCareer]
  };
}

function Quiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        const questionData = await getQuestions();
        const questionList = Array.isArray(questionData) ? questionData : [];
        const storedProgress = getQuizProgress();

        const safeProgress = {};
        questionList.forEach((question) => {
          if (storedProgress[question.id]) {
            safeProgress[question.id] = storedProgress[question.id];
          }
        });

        setQuestions(questionList);
        setSelectedAnswers(safeProgress);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  useEffect(() => {
    saveQuizProgress(selectedAnswers);
  }, [selectedAnswers]);

  const answeredCount = useMemo(
    () => Object.keys(selectedAnswers).length,
    [selectedAnswers]
  );

  const progressPercent = useMemo(() => {
    if (!questions.length) {
      return 0;
    }

    return Math.round((answeredCount / questions.length) * 100);
  }, [answeredCount, questions.length]);

  const handleSelect = (question, option) => {
    setError("");

    setSelectedAnswers((current) => ({
      ...current,
      [question.id]: {
        questionId: question.id,
        questionText: question.question,
        optionId: option.id,
        text: option.text,
        careerTag: option.careerTag
      }
    }));
  };

  const handleSubmit = async () => {
    if (answeredCount !== questions.length) {
      setError("Please answer every question before submitting the quiz.");
      return;
    }

    const answers = Object.values(selectedAnswers);
    const result = calculateCareerResult(answers);

    setSubmitting(true);
    setError("");
    saveLatestResult(result);

    try {
      await submitQuizResult({
        answers,
        recommendedCareer: result.career,
        scoreBreakdown: result.scores
      });
    } catch (_error) {
      // The user can still continue to the result page even if saving analytics fails.
    } finally {
      clearQuizProgress();
      setSubmitting(false);
      navigate("/result", { state: { result } });
    }
  };

  if (loading) {
    return (
      <section className="page-section">
        <div className="container narrow-container">
          <div className="panel centered-text">
            <span className="eyebrow">Quiz</span>
            <h2>Loading questions...</h2>
            <p className="muted-text">Please wait while we prepare your quiz.</p>
          </div>
        </div>
      </section>
    );
  }

  if (error && questions.length === 0) {
    return (
      <section className="page-section">
        <div className="container narrow-container">
          <div className="panel centered-text">
            <span className="eyebrow">Quiz</span>
            <h2>Unable to load questions</h2>
            <p className="muted-text">{error}</p>
            <div className="action-row centered-row">
              <Link className="secondary-button" to="/">
                Back Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section className="page-section">
        <div className="container narrow-container">
          <div className="panel centered-text">
            <span className="eyebrow">Quiz</span>
            <h2>No questions available yet</h2>
            <p className="muted-text">
              Ask the admin to add quiz questions from the dashboard.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="container narrow-container">
        <div className="section-heading">
          <span className="eyebrow">Quiz Page</span>
          <h2>Choose one option for each question</h2>
          <p className="muted-text">
            Your result is calculated instantly after submission.
          </p>
        </div>

        <div className="progress-card">
          <div className="progress-row">
            <div>
              <h3>Your Progress</h3>
              <p className="muted-text">
                {answeredCount} of {questions.length} answered
              </p>
            </div>
            <strong>{progressPercent}%</strong>
          </div>

          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {error && <div className="message-box error-box">{error}</div>}

        <div className="question-list">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              selectedOptionId={selectedAnswers[question.id]?.optionId}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <div className="submit-panel">
          <button
            className="primary-button"
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Quiz;

function QuestionCard({ question, index, selectedOptionId, onSelect }) {
  return (
    <article className="question-card">
      <div className="question-header">
        <span className="question-tag">Question {index + 1}</span>
        <h3>{question.question}</h3>
        <p className="muted-text">
          {selectedOptionId ? "Answer selected" : "Choose one option below"}
        </p>
      </div>

      <div className="option-grid">
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              className={`option-button ${isSelected ? "selected" : ""}`}
              onClick={() => onSelect(question, option)}
            >
              {option.text}
            </button>
          );
        })}
      </div>
    </article>
  );
}

export default QuestionCard;

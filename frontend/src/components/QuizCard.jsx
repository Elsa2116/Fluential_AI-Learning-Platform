export default function QuizCard({
  question,
  selected,
  onSelect,
  disabled = false,
  revealAnswer = false,
}) {
  function getButtonStyle(choice) {
    const isSelected = selected === choice;
    const isCorrect = question.answer === choice;

    if (revealAnswer && isCorrect) {
      return { background: "#16a34a" };
    }

    if (revealAnswer && isSelected && !isCorrect) {
      return { background: "#dc2626" };
    }

    return {
      background: isSelected ? "#1d4ed8" : "#2563eb",
      opacity: disabled && !isSelected ? 0.9 : 1,
    };
  }

  return (
    <article className="card">
      <h4 style={{ marginTop: 0 }}>{question.prompt}</h4>
      <div className="grid" style={{ gap: 8 }}>
        {question.choices.map((choice) => (
          <button
            key={choice}
            type="button"
            className="button"
            disabled={disabled}
            onClick={() => onSelect(choice)}
            style={getButtonStyle(choice)}
          >
            {choice}
          </button>
        ))}
      </div>
    </article>
  );
}

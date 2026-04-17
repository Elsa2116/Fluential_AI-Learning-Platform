export default function QuizCard({ question, selected, onSelect }) {
  return (
    <article className="card">
      <h4 style={{ marginTop: 0 }}>{question.prompt}</h4>
      <div className="grid" style={{ gap: 8 }}>
        {question.choices.map((choice) => (
          <button
            key={choice}
            type="button"
            className="button"
            onClick={() => onSelect(choice)}
            style={{
              background: selected === choice ? "#1d4ed8" : "#2563eb",
            }}
          >
            {choice}
          </button>
        ))}
      </div>
    </article>
  );
}

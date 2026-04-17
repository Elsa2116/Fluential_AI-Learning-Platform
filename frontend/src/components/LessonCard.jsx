export default function LessonCard({ lesson }) {
  return (
    <article className="card">
      <h3 style={{ marginTop: 0 }}>{lesson.title}</h3>
      <p className="muted" style={{ marginBottom: 0 }}>
        Difficulty: {lesson.difficulty} · Duration: {lesson.duration_minutes}{" "}
        minutes
      </p>
    </article>
  );
}

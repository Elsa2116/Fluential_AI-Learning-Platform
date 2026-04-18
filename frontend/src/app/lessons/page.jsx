import Link from "next/link";

export default function LessonsPage() {
  return (
    <section className="card">
      <h2>Lessons moved to Courses</h2>
      <p className="muted">
        Use the Courses page to view content, summaries, and generated quizzes.
      </p>
      <Link
        href="/courses"
        className="button"
        style={{ display: "inline-block", width: "auto", marginTop: 8 }}
      >
        Open Courses
      </Link>
    </section>
  );
}

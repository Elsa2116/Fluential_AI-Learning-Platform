import { buildProgressLabel } from "@/features/learning/learning.service";

export default function ProgressOverview({ data }) {
  return (
    <article className="card glass-panel">
      <div className="card-header">
        <h3 style={{ margin: 0 }}>Progress Overview</h3>
        <span className="course-pill">{data.progress_percent ?? 0}%</span>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Completed</span>
          <div className="stat-value">
            {data.completed_lessons ?? data.completed ?? 0}
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <div className="stat-value">
            {data.total_lessons ?? data.total ?? 0}
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Next Lesson</span>
          <div className="stat-value">{data.next_lesson_id ?? "—"}</div>
        </div>
      </div>
      <p className="muted" style={{ marginBottom: 0 }}>
        {buildProgressLabel(
          data.completed_lessons ?? data.completed ?? 0,
          data.total_lessons ?? data.total ?? 0,
        )}
      </p>
      <p className="muted" style={{ marginTop: 8, marginBottom: 0 }}>
        Recent topic:{" "}
        {data.recent_topic || data.recentTopic || "Not available yet"}
      </p>
    </article>
  );
}

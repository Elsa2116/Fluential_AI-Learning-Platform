import { buildProgressLabel } from "@/features/learning/learning.service";

export default function ProgressOverview({ data }) {
  return (
    <article className="card">
      <h3>Progress Overview</h3>
      <p className="muted" style={{ marginBottom: 0 }}>
        {buildProgressLabel(data.completed, data.total)}
      </p>
      <p className="muted" style={{ marginTop: 8 }}>
        Recent topic: {data.recentTopic}
      </p>
    </article>
  );
}

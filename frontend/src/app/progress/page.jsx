import ProgressOverview from "@/components/ProgressOverview";
import { recommendNextTopic } from "@/features/recommendation/recommendation.strategy";

const progressData = {
  completed: 4,
  total: 10,
  recentTopic: "APIs with FastAPI",
};

export default function ProgressPage() {
  const recommendation = recommendNextTopic(progressData);

  return (
    <section className="grid" style={{ gap: 16 }}>
      <ProgressOverview data={progressData} />
      <article className="card">
        <h3>AI Recommendation</h3>
        <p className="muted" style={{ marginBottom: 0 }}>
          {recommendation}
        </p>
      </article>
    </section>
  );
}

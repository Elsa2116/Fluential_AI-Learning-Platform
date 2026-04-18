import AITutorPanel from "@/components/AITutorPanel";

export default function AITutorPage() {
  return (
    <section className="grid" style={{ gap: 16 }}>
      <div className="page-intro">
        <span className="page-kicker">Virtual Teacher</span>
        <h2 style={{ margin: 0 }}>AI Tutor</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          Ask a question and get a guided hint that helps the learner think
          through the answer.
        </p>
      </div>
      <AITutorPanel />
    </section>
  );
}

import AITutorPanel from "@/components/AITutorPanel";

export default function ChatPage() {
  return (
    <section>
      <h2>AI Chat</h2>
      <p className="muted">
        Ask course questions and receive virtual tutor guidance.
      </p>
      <AITutorPanel />
    </section>
  );
}

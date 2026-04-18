import ChatRoomPanel from "@/components/ChatRoomPanel";

export default function ChatPage() {
  return (
    <section className="grid" style={{ gap: 16 }}>
      <div>
        <h2>AI Chat</h2>
        <p className="muted">
          Talk with learners, send files, and keep the learning room active.
        </p>
      </div>
      <ChatRoomPanel />
    </section>
  );
}

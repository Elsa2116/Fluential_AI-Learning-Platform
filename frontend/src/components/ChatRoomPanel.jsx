"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchChatMessages,
  requestHint,
  sendChatFile,
  sendChatMessage,
} from "@/lib/api-client";

export default function ChatRoomPanel() {
  const [roomId, setRoomId] = useState("general-room");
  const [senderId, setSenderId] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [aiReply, setAiReply] = useState("");
  const [status, setStatus] = useState("Messages will appear here.");

  useEffect(() => {
    const storedUser = localStorage.getItem("apl_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) {
          setSenderId(String(parsed.id));
        }
      } catch {
        setSenderId("");
      }
    }
  }, []);

  async function loadMessages() {
    try {
      const data = await fetchChatMessages(roomId);
      setMessages(data || []);
      setStatus(
        data?.length ? "Chat history loaded." : "No messages in this room yet.",
      );
    } catch (error) {
      setStatus(error.message || "Could not load messages.");
    }
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 7000);
    return () => clearInterval(interval);
  }, [roomId]);

  async function handleSend(event) {
    event.preventDefault();
    try {
      const normalizedSenderId = Number(senderId) || 1;
      if (file) {
        await sendChatFile({
          room_id: roomId,
          sender_id: normalizedSenderId,
          file,
        });
      } else {
        await sendChatMessage({
          room_id: roomId,
          sender_id: normalizedSenderId,
          text,
        });

        if (text.trim()) {
          try {
            const aiData = await requestHint("General", text.trim());
            const hintText = aiData?.hint || "No AI response returned.";
            setAiReply(hintText);
            await sendChatMessage({
              room_id: roomId,
              sender_id: normalizedSenderId,
              text: `AI: ${hintText}`,
            });
          } catch (error) {
            setAiReply(
              error.message ||
                "Could not get AI response. Check backend and LLM settings.",
            );
          }
        }
      }
      setText("");
      setFile(null);
      await loadMessages();
      setStatus("Message sent and saved to chat history.");
    } catch (error) {
      setStatus(error.message || "Failed to send message.");
    }
  }

  const lastMessagePreview = useMemo(() => messages.at(-1), [messages]);

  return (
    <section className="grid" style={{ gap: 16 }}>
      <article className="card grid" style={{ gap: 12 }}>
        <div className="card-header">
          <h3 style={{ margin: 0 }}>AI Learning Chat</h3>
          <button
            className="button button-secondary"
            type="button"
            onClick={loadMessages}
          >
            Refresh
          </button>
        </div>

        <label>
          Room ID
          <input
            className="input"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
          />
        </label>

        <label>
          Sender ID
          <input
            className="input"
            value={senderId}
            onChange={(event) => setSenderId(event.target.value)}
          />
        </label>

        <form className="grid" onSubmit={handleSend} style={{ gap: 10 }}>
          <label>
            Message
            <textarea
              className="textarea"
              rows={4}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Ask a question or share a note"
            />
          </label>

          <label>
            Attachment (optional)
            <input
              className="input"
              type="file"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>

          <button className="button" type="submit">
            Send
          </button>
        </form>

        <p className="muted" style={{ marginBottom: 0 }}>
          {status}
        </p>
        {lastMessagePreview ? (
          <p className="muted" style={{ marginBottom: 0 }}>
            Latest:{" "}
            {lastMessagePreview.text ||
              lastMessagePreview.file_name ||
              "Attachment"}
          </p>
        ) : null}
        {aiReply ? (
          <div className="card" style={{ marginTop: 4 }}>
            <strong>AI Answer</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              {aiReply}
            </p>
          </div>
        ) : null}
      </article>

      <div className="grid">
        {messages.length === 0 ? (
          <p className="card">No chat messages yet.</p>
        ) : (
          messages.map((message) => (
            <article
              className="card"
              key={message.id || `${message.created_at}-${message.text}`}
            >
              <div className="message-header">
                <strong>Sender {message.sender_id}</strong>
                <span className="muted">{message.message_type}</span>
              </div>
              <p className="muted" style={{ marginBottom: 0 }}>
                {message.text || message.file_name || message.file_url}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

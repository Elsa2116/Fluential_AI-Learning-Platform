"use client";

import { useState } from "react";
import { requestHint } from "@/lib/api-client";

export default function AITutorPanel() {
  const [topic, setTopic] = useState("FastAPI");
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const data = await requestHint(topic, question);
      setHint(data.hint || "No hint returned.");
    } catch {
      setHint("Could not fetch hint. Check backend status and try again.");
    }
  }

  return (
    <form className="card grid" onSubmit={handleSubmit} style={{ gap: 10 }}>
      <label>
        Topic
        <input
          className="input"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="e.g. FastAPI"
        />
      </label>
      <label>
        Question
        <textarea
          className="textarea"
          rows={4}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask your learning question"
        />
      </label>
      <button className="button" type="submit">
        Get AI Hint
      </button>
      {hint ? (
        <div>
          <strong>Hint</strong>
          <p className="muted" style={{ marginBottom: 0 }}>
            {hint}
          </p>
        </div>
      ) : null}
    </form>
  );
}

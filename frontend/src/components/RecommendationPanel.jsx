"use client";

import { useEffect, useState } from "react";
import { fetchRecommendations } from "@/lib/api-client";

export default function RecommendationPanel() {
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(
    "Personalized recommendations will appear here.",
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("apl_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.id) {
          setUserId(String(parsed.id));
        }
      } catch {
        setUserId("");
      }
    }
  }, []);

  async function loadRecommendations() {
    const data = await fetchRecommendations(userId ? Number(userId) : 1);
    const normalized = Array.isArray(data) ? data : data.recommendations || [];
    setItems(normalized);
    setStatus(
      normalized.length ? "Recommendations loaded." : "No recommendations yet.",
    );
  }

  return (
    <article className="card grid" style={{ gap: 12 }}>
      <div className="card-header">
        <h3 style={{ margin: 0 }}>Personalized Recommendations</h3>
        <button
          className="button button-secondary"
          type="button"
          onClick={loadRecommendations}
        >
          Refresh
        </button>
      </div>

      <label>
        User ID
        <input
          className="input"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="Enter user ID or use saved login"
        />
      </label>

      <p className="muted" style={{ marginBottom: 0 }}>
        {status}
      </p>

      {items.length > 0 ? (
        <ul className="list">
          {items.map((item, index) => (
            <li
              key={`${index}-${typeof item === "string" ? item : item.title || item.course_id}`}
            >
              {typeof item === "string"
                ? item
                : `${item.title} - ${item.reason}`}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

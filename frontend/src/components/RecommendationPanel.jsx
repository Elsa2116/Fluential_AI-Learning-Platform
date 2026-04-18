"use client";

import { useEffect, useState } from "react";
import { fetchRecommendations } from "@/lib/api-client";

export default function RecommendationPanel() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchRecommendations()
      .then((data) =>
        setItems(Array.isArray(data) ? data : data.recommendations || []),
      )
      .catch(() => setItems([]));
  }, []);

  return (
    <article className="card">
      <h3 style={{ marginTop: 0 }}>Personalized Recommendations</h3>
      {items.length === 0 ? (
        <p className="muted" style={{ marginBottom: 0 }}>
          No recommendations yet.
        </p>
      ) : (
        <ul className="list">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </article>
  );
}

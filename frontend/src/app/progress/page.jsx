"use client";

import { useEffect, useState } from "react";
import ProgressOverview from "@/components/ProgressOverview";
import { fetchProgressSummary, fetchRecommendations } from "@/lib/api-client";

export default function ProgressPage() {
  const [userId, setUserId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [status, setStatus] = useState(
    "Track progress across lessons and courses.",
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

  async function loadProgress() {
    if (!userId || !courseId) {
      setStatus("Please enter both user ID and course ID.");
      return;
    }

    try {
      const data = await fetchProgressSummary(Number(userId), Number(courseId));
      setSummary(data);
      setStatus("Progress summary loaded.");
    } catch (error) {
      setSummary(null);
      setStatus(error.message || "Could not load progress.");
    }
  }

  async function loadRecommendations() {
    try {
      const data = await fetchRecommendations(Number(userId || 1));
      const normalized = Array.isArray(data)
        ? data
        : data.recommendations || [];
      setRecommendations(normalized);
    } catch {
      setRecommendations([]);
    }
  }

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  return (
    <section className="grid" style={{ gap: 16 }}>
      <div className="page-intro">
        <span className="page-kicker">Learning Analytics</span>
        <h2 style={{ margin: 0 }}>Progress Dashboard</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          Check completion, next lesson, and AI-driven recommendations.
        </p>
      </div>

      <article className="card grid glass-panel" style={{ gap: 10 }}>
        <label>
          User ID
          <input
            className="input"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
        </label>
        <label>
          Course ID
          <input
            className="input"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
          />
        </label>
        <div className="actions">
          <button className="button" type="button" onClick={loadProgress}>
            Load Progress
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={loadRecommendations}
          >
            Refresh Recommendations
          </button>
        </div>
        <p className="muted" style={{ marginBottom: 0 }}>
          {status}
        </p>
      </article>

      {summary ? <ProgressOverview data={summary} /> : null}

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Recommended Courses</h3>
        {recommendations.length === 0 ? (
          <p className="muted" style={{ marginBottom: 0 }}>
            No recommendation data yet.
          </p>
        ) : (
          <ul className="list">
            {recommendations.map((item, index) => (
              <li
                key={`${index}-${typeof item === "string" ? item : item.course_id}`}
              >
                {typeof item === "string"
                  ? item
                  : `${item.title} - ${item.reason}`}
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}

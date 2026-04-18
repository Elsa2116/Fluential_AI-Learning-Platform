"use client";

import { useEffect, useState } from "react";
import { fetchCourses, fetchRecommendations } from "@/lib/api-client";

export default function DashboardPage() {
  const [courseCount, setCourseCount] = useState(0);
  const [topRecommendation, setTopRecommendation] = useState(
    "Loading recommendation...",
  );

  useEffect(() => {
    fetchCourses()
      .then((courses) => setCourseCount(courses.length))
      .catch(() => setCourseCount(0));

    fetchRecommendations()
      .then((items) => {
        const normalized = Array.isArray(items)
          ? items
          : items.recommendations || [];
        setTopRecommendation(
          normalized[0] || "Complete one lesson and request a recommendation.",
        );
      })
      .catch(() =>
        setTopRecommendation(
          "Complete one lesson and request a recommendation.",
        ),
      );
  }, []);

  return (
    <section className="grid grid-2">
      <article className="card">
        <h2>Platform Overview</h2>
        <p className="muted">Your AI-powered learning workspace is active.</p>
      </article>
      <article className="card">
        <h2>Courses Available</h2>
        <p className="muted">Total courses: {courseCount}</p>
      </article>
      <article className="card" style={{ gridColumn: "1 / -1" }}>
        <h2>Recommended Next Step</h2>
        <p className="muted">{topRecommendation}</p>
      </article>
    </section>
  );
}

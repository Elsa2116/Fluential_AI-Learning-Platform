"use client";

import { useEffect, useState } from "react";
import { fetchLessons } from "@/lib/api-client";

export default function DashboardPage() {
  const [lessonCount, setLessonCount] = useState(0);

  useEffect(() => {
    fetchLessons()
      .then((lessons) => setLessonCount(lessons.length))
      .catch(() => setLessonCount(0));
  }, []);

  return (
    <section className="grid grid-2">
      <article className="card">
        <h2>Frontend Overview</h2>
        <p className="muted">Your learning dashboard is ready.</p>
      </article>
      <article className="card">
        <h2>Lessons Available</h2>
        <p className="muted">Total lessons: {lessonCount}</p>
      </article>
    </section>
  );
}

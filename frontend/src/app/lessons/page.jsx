"use client";

import { useEffect, useState } from "react";
import LessonCard from "@/components/LessonCard";
import { fetchLessons } from "@/lib/api-client";

export default function LessonsPage() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetchLessons()
      .then(setLessons)
      .catch(() => setLessons([]));
  }, []);

  return (
    <section>
      <h2>Lessons</h2>
      <p className="muted">
        Start with fundamentals, then move to advanced topics.
      </p>
      <div className="grid">
        {lessons.length === 0 ? (
          <p className="card">No lessons available yet.</p>
        ) : (
          lessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))
        )}
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { generateQuiz, summarizeLesson } from "@/lib/api-client";

export default function CourseCard({ course }) {
  const [summary, setSummary] = useState("");
  const [quizPreview, setQuizPreview] = useState("");

  async function handleSummarize() {
    const content = course.description || course.title || "Course content";
    const data = await summarizeLesson(content);
    setSummary(data.summary || "Summary not available.");
  }

  async function handleQuiz() {
    const content = course.description || course.title || "Course content";
    const data = await generateQuiz(content);
    const first = data.questions?.[0]?.prompt;
    setQuizPreview(first || "Quiz generated successfully.");
  }

  return (
    <article className="card grid" style={{ gap: 10 }}>
      <h3 style={{ margin: 0 }}>{course.title}</h3>
      <p className="muted" style={{ margin: 0 }}>
        {course.description || "No description provided."}
      </p>
      <p className="muted" style={{ margin: 0 }}>
        Difficulty: {course.difficulty || "N/A"} · Duration:{" "}
        {course.duration_minutes || 0} mins
      </p>

      <div className="actions">
        <button className="button" type="button" onClick={handleSummarize}>
          Generate Summary
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={handleQuiz}
        >
          Generate Quiz
        </button>
      </div>

      {summary ? (
        <p className="muted" style={{ marginBottom: 0 }}>
          <strong>Summary:</strong> {summary}
        </p>
      ) : null}
      {quizPreview ? (
        <p className="muted" style={{ marginBottom: 0 }}>
          <strong>Quiz:</strong> {quizPreview}
        </p>
      ) : null}
    </article>
  );
}

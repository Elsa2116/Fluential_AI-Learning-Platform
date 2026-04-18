"use client";

import { useEffect, useMemo, useState } from "react";
import {
  enrollInCourse,
  fetchCourseRoadmap,
  generateQuiz,
  summarizeLesson,
} from "@/lib/api-client";

export default function CourseCard({ course }) {
  const [summary, setSummary] = useState("");
  const [quizPreview, setQuizPreview] = useState("");
  const [roadmap, setRoadmap] = useState([]);
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState("");

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

  const courseMeta = useMemo(
    () => [
      `Teacher ID: ${course.teacher_id ?? "N/A"}`,
      `Lessons: ${course.lesson_count ?? 0}`,
    ],
    [course.lesson_count, course.teacher_id],
  );

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

  async function handleEnroll() {
    if (!userId) {
      setStatus("Sign in first to enroll in this course.");
      return;
    }

    const data = await enrollInCourse({
      user_id: Number(userId),
      course_id: course.id,
    });
    setStatus(data.message || "Enrollment updated.");
  }

  async function handleRoadmap() {
    if (!userId) {
      setStatus("Sign in first to view the roadmap.");
      return;
    }

    const data = await fetchCourseRoadmap(course.id, Number(userId));
    setRoadmap(data.roadmap || []);
    setStatus("Roadmap loaded.");
  }

  return (
    <article className="card course-card">
      <div className="course-header">
        <div>
          <h3 style={{ margin: 0 }}>{course.title}</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            {course.description || "No description provided."}
          </p>
        </div>
        <span className="course-pill">{course.lesson_count ?? 0} lessons</span>
      </div>

      <div className="course-meta">
        {courseMeta.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <div className="actions">
        <button className="button" type="button" onClick={handleEnroll}>
          Enroll
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={handleRoadmap}
        >
          View Roadmap
        </button>
        <button className="button" type="button" onClick={handleSummarize}>
          Summarize
        </button>
        <button
          className="button button-secondary"
          type="button"
          onClick={handleQuiz}
        >
          Generate Quiz
        </button>
      </div>

      {status ? <p className="muted">{status}</p> : null}

      {roadmap.length > 0 ? (
        <div>
          <h4 style={{ marginBottom: 8 }}>Roadmap</h4>
          <ul className="list">
            {roadmap.map((item) => (
              <li key={item.lesson_id}>
                {item.step_order}. {item.title}{" "}
                <span className="muted">({item.status})</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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

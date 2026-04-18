"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchCourses, fetchRecommendations } from "@/lib/api-client";

const learningBlocks = [
  {
    title: "Continue learning",
    text: "Pick up where you left off with saved progress and current lessons.",
  },
  {
    title: "Recommended next",
    text: "Use AI recommendations to choose the next best course or lesson.",
  },
  {
    title: "Skill progress",
    text: "Review completed lessons, quizzes, and roadmap steps in one place.",
  },
];

export default function DashboardPage() {
  const [courseCount, setCourseCount] = useState(0);
  const [userName, setUserName] = useState("Guest learner");
  const [topRecommendation, setTopRecommendation] = useState(
    "Loading recommendation...",
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("apl_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.full_name) {
          setUserName(parsed.full_name);
        }
      } catch {
        setUserName("Guest learner");
      }
    }

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
    <section className="dashboard-shell grid" style={{ gap: 18 }}>
      <article className="dashboard-hero card glass-panel">
        <div className="dashboard-hero-copy">
          <span className="page-kicker">My learning</span>
          <h2 style={{ margin: 0 }}>Welcome, {userName}</h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            A structured learning dashboard with progress, recommendations, and
            quick access to your next step.
          </p>
        </div>

        <div className="dashboard-hero-actions">
          <Link href="/courses" className="button" style={{ width: "auto" }}>
            Browse courses
          </Link>
          <Link
            href="/chat"
            className="button button-secondary"
            style={{ width: "auto" }}
          >
            Open AI chat
          </Link>
        </div>
      </article>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar card">
          <h3 style={{ marginTop: 0 }}>Learning menu</h3>
          <div className="dashboard-menu">
            <Link href="/dashboard" className="dashboard-menu-item">
              Overview
            </Link>
            <Link href="/courses" className="dashboard-menu-item">
              My courses
            </Link>
            <Link href="/progress" className="dashboard-menu-item">
              Progress
            </Link>
            <Link href="/quiz" className="dashboard-menu-item">
              Quizzes
            </Link>
            <Link href="/ai-tutor" className="dashboard-menu-item">
              AI tutor
            </Link>
          </div>

          <div className="dashboard-sidebar-note">
            <span className="stat-label">Courses available</span>
            <div className="stat-value">{courseCount}</div>
          </div>
        </aside>

        <div className="dashboard-main grid" style={{ gap: 16 }}>
          <div className="stats-grid">
            <article className="stat-card">
              <span className="stat-label">Courses available</span>
              <div className="stat-value">{courseCount}</div>
              <p className="muted" style={{ marginBottom: 0 }}>
                Available in the learning catalog.
              </p>
            </article>
            <article className="stat-card">
              <span className="stat-label">Focus for today</span>
              <div className="stat-value">AI</div>
              <p className="muted" style={{ marginBottom: 0 }}>
                {topRecommendation}
              </p>
            </article>
          </div>

          <div className="grid grid-2">
            {learningBlocks.map((block) => (
              <article key={block.title} className="card">
                <span className="page-kicker">Learning area</span>
                <h3 style={{ margin: "8px 0" }}>{block.title}</h3>
                <p className="muted" style={{ marginBottom: 0 }}>
                  {block.text}
                </p>
              </article>
            ))}
          </div>

          <article className="card">
            <h3 style={{ marginTop: 0 }}>Next action</h3>
            <p className="muted" style={{ marginBottom: 0 }}>
              Open the course catalog, enroll in a course, then use the roadmap,
              summary, and quiz tools to continue learning.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CourseCard from "@/components/CourseCard";
import RecommendationPanel from "@/components/RecommendationPanel";
import { fetchCourses } from "@/lib/api-client";

const CATEGORY_CONFIG = {
  "web-development": {
    label: "Web Development",
    hint: "Frontend, backend, APIs, and modern web frameworks.",
    keywords: [
      "web",
      "frontend",
      "backend",
      "react",
      "next",
      "javascript",
      "html",
      "css",
      "api",
    ],
  },
  "ai-machine-learning": {
    label: "AI & Machine Learning",
    hint: "AI fundamentals, models, and machine learning workflows.",
    keywords: [
      "ai",
      "machine",
      "ml",
      "neural",
      "model",
      "llm",
      "prompt",
      "intelligence",
    ],
  },
  design: {
    label: "Design",
    hint: "UI/UX, visual systems, and product design skills.",
    keywords: ["design", "ui", "ux", "figma", "prototype", "visual", "brand"],
  },
  business: {
    label: "Business",
    hint: "Operations, product strategy, and business growth.",
    keywords: [
      "business",
      "marketing",
      "management",
      "strategy",
      "startup",
      "sales",
      "finance",
    ],
  },
  "data-science": {
    label: "Data Science",
    hint: "Data analysis, statistics, and decision-focused analytics.",
    keywords: [
      "data",
      "analysis",
      "analytics",
      "python",
      "sql",
      "statistics",
      "visualization",
    ],
  },
};

const CATEGORY_KEYS = Object.keys(CATEGORY_CONFIG);

export default function CoursesPage() {
  return (
    <Suspense fallback={<section className="catalog-shell grid" style={{ gap: 18 }} />}>
      <CoursesPageContent />
    </Suspense>
  );
}

function CoursesPageContent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState([]);

  const activeCategory = searchParams.get("category") || "";
  const query = (searchParams.get("q") || "").trim().toLowerCase();

  const activeCategoryConfig = CATEGORY_CONFIG[activeCategory] || null;

  const inferCategoryKey = useMemo(
    () => (course) => {
      const rawText = [course?.title, course?.description, course?.content]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      for (const categoryKey of CATEGORY_KEYS) {
        const hasKeyword = CATEGORY_CONFIG[categoryKey].keywords.some(
          (keyword) => rawText.includes(keyword),
        );
        if (hasKeyword) {
          return categoryKey;
        }
      }

      const fallbackSeed = `${course?.id ?? ""}${course?.title ?? "course"}`;
      const hash = Array.from(fallbackSeed).reduce(
        (accumulator, character) => accumulator + character.charCodeAt(0),
        0,
      );
      return CATEGORY_KEYS[hash % CATEGORY_KEYS.length];
    },
    [],
  );

  const filteredCourses = useMemo(() => {
    const categoryFiltered = activeCategoryConfig
      ? courses.filter((course) => inferCategoryKey(course) === activeCategory)
      : courses;

    if (!query) {
      return categoryFiltered;
    }

    return categoryFiltered.filter((course) => {
      const searchable = [course?.title, course?.description, course?.content]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(query);
    });
  }, [activeCategory, activeCategoryConfig, courses, inferCategoryKey, query]);

  useEffect(() => {
    fetchCourses()
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]));
  }, []);

  return (
    <section className="catalog-shell grid" style={{ gap: 18 }}>
      <article className="catalog-hero card glass-panel">
        <div>
          <span className="page-kicker">Course catalog</span>
          <h2 style={{ margin: "8px 0" }}>
            {activeCategoryConfig
              ? `${activeCategoryConfig.label} courses`
              : "Explore learning paths built for real progress"}
          </h2>
          <p className="muted" style={{ marginBottom: 0 }}>
            {activeCategoryConfig
              ? activeCategoryConfig.hint
              : "Browse your platform catalog with recommendations, filters, and structured course cards."}
          </p>
        </div>

        <div className="catalog-actions">
          {(activeCategory || query) && (
            <Link href="/courses" className="nav-link">
              Clear filters
            </Link>
          )}
          <Link href="/dashboard" className="nav-link nav-link-strong">
            Back to learning
          </Link>
          <Link href="/register" className="auth-link auth-link-solid">
            Join now
          </Link>
        </div>
      </article>

      <div className="catalog-toolbar card">
        <span className="course-pill">All levels</span>
        <span className="course-pill">Popular</span>
        <span className="course-pill">AI powered</span>
        <span className="course-pill">Career focused</span>
        {activeCategoryConfig ? (
          <span className="course-pill catalog-pill-active">
            Category: {activeCategoryConfig.label}
          </span>
        ) : null}
        {query ? (
          <span className="course-pill catalog-pill-active">
            Search: {query}
          </span>
        ) : null}
      </div>

      <div className="catalog-layout">
        <aside className="catalog-sidebar card">
          <h3 style={{ marginTop: 0 }}>Refine your search</h3>
          <div className="grid" style={{ gap: 10 }}>
            <Link
              href="/courses?category=web-development"
              className={`catalog-filter-link ${activeCategory === "web-development" ? "catalog-filter-link-active" : ""}`}
            >
              Web Development
            </Link>
            <Link
              href="/courses?category=ai-machine-learning"
              className={`catalog-filter-link ${activeCategory === "ai-machine-learning" ? "catalog-filter-link-active" : ""}`}
            >
              AI &amp; Machine Learning
            </Link>
            <Link
              href="/courses?category=design"
              className={`catalog-filter-link ${activeCategory === "design" ? "catalog-filter-link-active" : ""}`}
            >
              Design
            </Link>
            <Link
              href="/courses?category=business"
              className={`catalog-filter-link ${activeCategory === "business" ? "catalog-filter-link-active" : ""}`}
            >
              Business
            </Link>
            <Link
              href="/courses?category=data-science"
              className={`catalog-filter-link ${activeCategory === "data-science" ? "catalog-filter-link-active" : ""}`}
            >
              Data Science
            </Link>
          </div>
        </aside>

        <div className="catalog-main grid" style={{ gap: 16 }}>
          <RecommendationPanel />

          <div className="catalog-grid">
            {filteredCourses.length === 0 ? (
              <p className="card">
                {query || activeCategory
                  ? "No courses found for your search."
                  : "No courses available yet."}
              </p>
            ) : (
              filteredCourses.map((course) => (
                <CourseCard key={course.id || course.title} course={course} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

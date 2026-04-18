"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/components/CourseCard";
import RecommendationPanel from "@/components/RecommendationPanel";
import { fetchCourses } from "@/lib/api-client";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses()
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setCourses([]));
  }, []);

  return (
    <section className="grid" style={{ gap: 16 }}>
      <div>
        <h2>Course Catalog</h2>
        <p className="muted">
          Explore learning materials and generate AI summaries/quizzes.
        </p>
      </div>

      <RecommendationPanel />

      <div className="grid">
        {courses.length === 0 ? (
          <p className="card">No courses available yet.</p>
        ) : (
          courses.map((course) => (
            <CourseCard key={course.id || course.title} course={course} />
          ))
        )}
      </div>
    </section>
  );
}

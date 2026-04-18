import Link from "next/link";
import App from "../App";

const quickActions = [
  { label: "My learning", href: "/dashboard" },
  { label: "Browse catalog", href: "/courses" },
  { label: "AI chat", href: "/chat" },
  { label: "AI tutor", href: "/ai-tutor" },
];

const categories = [
  "Web Development",
  "AI & Machine Learning",
  "Design",
  "Business",
  "Data Science",
  "Personal Development",
];

const featuredCourses = [
  {
    title: "Modern React and Next.js",
    level: "Beginner",
    lessons: "24 lessons",
  },
  {
    title: "AI Productivity with Python",
    level: "Intermediate",
    lessons: "18 lessons",
  },
  {
    title: "Product Design Essentials",
    level: "All levels",
    lessons: "30 lessons",
  },
];

const learningJourney = [
  {
    step: "Discover",
    title: "Find the right path quickly",
    text: "Use categories and search to jump into topics that match your goals.",
  },
  {
    step: "Practice",
    title: "Learn with AI-powered tools",
    text: "Summaries, quizzes, and AI chat keep your learning active and practical.",
  },
  {
    step: "Track",
    title: "Measure your real progress",
    text: "Monitor lessons and recommendations in your personal learning dashboard.",
  },
];

const spotlightCards = [
  {
    title: "Hands-on projects",
    description:
      "Apply what you learn with practical exercises and mini-builds.",
    stat: "Project-first",
  },
  {
    title: "Career-ready skills",
    description:
      "Follow structured tracks aligned with high-demand skill areas.",
    stat: "Outcome-based",
  },
  {
    title: "Adaptive support",
    description:
      "Get recommendations tailored to your performance and activity.",
    stat: "Personalized",
  },
];

const learnerStories = [
  {
    quote:
      "The roadmap plus quiz flow helped me keep momentum and finally finish a full track.",
    author: "Student · Full Stack Track",
  },
  {
    quote:
      "The AI summaries are exactly what I needed for quick revision before practice sessions.",
    author: "Teacher · Data & AI",
  },
  {
    quote:
      "A clean dashboard and clear next steps made it easy to stay consistent every week.",
    author: "Learner · Career Transition",
  },
];

export default function HomePage() {
  return (
    <section className="home-shell grid" style={{ gap: 18 }}>
      <div className="home-hero card glass-panel">
        <div className="home-hero-copy">
          <span className="page-kicker">Learn on your schedule</span>
          <App />
          <p className="muted home-copy">
            A course-platform structure with search, categories, featured paths,
            and learning tools, styled in your preferred blue and neutral tones.
          </p>

          <div className="home-search-row">
            <input
              className="input home-search-input"
              placeholder="What do you want to learn today?"
              aria-label="Search learning topics"
            />
            <Link href="/courses" className="button home-search-button">
              Search
            </Link>
          </div>

          <div className="home-chip-row">
            {categories.map((category) => (
              <span key={category} className="home-chip">
                {category}
              </span>
            ))}
          </div>

          <div className="actions">
            <Link
              href="/dashboard"
              className="button"
              style={{ width: "auto" }}
            >
              Go to My Learning
            </Link>
            <Link
              href="/register"
              className="button button-secondary"
              style={{ width: "auto" }}
            >
              Create Account
            </Link>
          </div>
        </div>

        <aside className="home-hero-panel">
          <article className="hero-preview card">
            <span className="page-kicker">Featured path</span>
            <h3 style={{ margin: "8px 0 8px" }}>
              Build real skills with guided tracks
            </h3>
            <p className="muted" style={{ marginBottom: 0 }}>
              Follow structured courses, save progress, and use AI tools to move
              faster.
            </p>
          </article>

          <div className="stats-grid home-stats">
            <article className="stat-card">
              <span className="stat-label">Learning modes</span>
              <div className="stat-value">3+</div>
              <p className="muted" style={{ marginBottom: 0 }}>
                Courses, chat, tutor, quiz.
              </p>
            </article>
            <article className="stat-card">
              <span className="stat-label">Platform style</span>
              <div className="stat-value">Platform-native</div>
              <p className="muted" style={{ marginBottom: 0 }}>
                Built for your learning workflow and brand identity.
              </p>
            </article>
          </div>
        </aside>
      </div>

      <section className="section-block">
        <div className="section-header">
          <div>
            <span className="page-kicker">Featured courses</span>
            <h2>Popular learning tracks</h2>
          </div>
          <Link href="/courses" className="nav-link nav-link-strong">
            See all courses
          </Link>
        </div>

        <div className="course-shelf">
          {featuredCourses.map((course) => (
            <article key={course.title} className="course-shelf-card card">
              <div className="course-shelf-image" />
              <div className="grid" style={{ gap: 8 }}>
                <strong>{course.title}</strong>
                <p className="muted" style={{ margin: 0 }}>
                  {course.level} · {course.lessons}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <span className="page-kicker">Learning journey</span>
            <h2>How you progress on the platform</h2>
          </div>
        </div>

        <div className="journey-grid">
          {learningJourney.map((item) => (
            <article key={item.step} className="journey-card card">
              <span className="journey-step">{item.step}</span>
              <h3 style={{ margin: "10px 0 8px" }}>{item.title}</h3>
              <p className="muted" style={{ marginBottom: 0 }}>
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <span className="page-kicker">Why it feels better</span>
            <h2>Interesting things built into your experience</h2>
          </div>
        </div>

        <div className="spotlight-grid">
          {spotlightCards.map((item) => (
            <article
              key={item.title}
              className="spotlight-card card glass-panel"
            >
              <span className="spotlight-stat">{item.stat}</span>
              <h3 style={{ margin: "8px 0" }}>{item.title}</h3>
              <p className="muted" style={{ marginBottom: 0 }}>
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-header">
          <div>
            <span className="page-kicker">Learner stories</span>
            <h2>What users like most</h2>
          </div>
        </div>

        <div className="stories-grid">
          {learnerStories.map((story) => (
            <article key={story.author} className="story-card card">
              <p style={{ margin: 0 }}>
                <strong>“{story.quote}”</strong>
              </p>
              <p className="muted" style={{ marginBottom: 0 }}>
                {story.author}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid grid-2">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="card glass-panel home-quick-link"
          >
            <strong>{action.label}</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              Open {action.label.toLowerCase()}.
            </p>
          </Link>
        ))}
      </section>
    </section>
  );
}

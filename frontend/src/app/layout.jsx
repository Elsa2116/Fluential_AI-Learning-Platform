import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "AI Learning Platform",
  description: "AI-powered web-based learning platform frontend",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="nav">
          <div className="nav-left">
            <Link href="/">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/courses">Courses</Link>
            <Link href="/chat">AI Chat</Link>
            <Link href="/ai-tutor">AI Tutor</Link>
            <Link href="/progress">Progress</Link>
            <Link href="/quiz">Quiz</Link>
          </div>
          <div className="nav-right">
            <Link href="/login" className="auth-link">
              Login
            </Link>
            <Link href="/register" className="auth-link">
              Sign Up
            </Link>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="footer">
          <div className="footer-grid">
            <section>
              <h4>AI Learning Platform</h4>
              <p className="muted">
                Personalized learning with AI tutor, smart recommendations,
                summaries, and adaptive quizzes.
              </p>
            </section>
            <section>
              <h4>Navigation</h4>
              <div className="footer-links">
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/courses">Courses</Link>
                <Link href="/chat">AI Chat</Link>
                <Link href="/progress">Progress</Link>
              </div>
            </section>
            <section>
              <h4>AI Features</h4>
              <ul className="list">
                <li>Virtual AI Tutor</li>
                <li>Personalized Recommendations</li>
                <li>Lesson Summarization</li>
                <li>Dynamic Quiz Generation</li>
              </ul>
            </section>
          </div>
          <p className="footer-note">
            © 2026 AI Learning Platform. Built with Next.js + FastAPI.
          </p>
        </footer>
      </body>
    </html>
  );
}

import Link from "next/link";
import App from "../App";

const quickActions = [
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "Open Dashboard", href: "/dashboard" },
  { label: "Browse Courses", href: "/courses" },
  { label: "Try AI Chat", href: "/chat" },
  { label: "Try AI Tutor", href: "/ai-tutor" },
];

export default function HomePage() {
  return (
    <section className="grid" style={{ gap: 16 }}>
      <div className="card">
        <App />
        <p className="muted" style={{ marginBottom: 0 }}>
          Features: authentication, courses, AI tutor, personalized
          recommendations, lesson summarization, and quiz generation.
        </p>
      </div>

      <div className="grid grid-2">
        {quickActions.map((action) => (
          <Link key={action.href} href={action.href} className="card">
            <strong>{action.label}</strong>
            <p className="muted" style={{ marginBottom: 0 }}>
              Continue to {action.label.toLowerCase()}.
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

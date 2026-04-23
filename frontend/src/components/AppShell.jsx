"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    function syncAuthState() {
      const token = localStorage.getItem("apl_token");
      setIsAuthenticated(Boolean(token));
    }

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, [pathname]);

  function handleLogout() {
    localStorage.removeItem("apl_token");
    localStorage.removeItem("apl_user");
    setIsAuthenticated(false);
    router.push("/login");
  }

  return (
    <>
      {!isAuthPage ? (
        <header className="nav">
          <div className="nav-brand">
            <span className="nav-mark" aria-hidden="true">
              <span>AI</span>
            </span>
            <div>
              <Link href="/" className="nav-title">
                AI Learning Hub
              </Link>
              <p className="nav-subtitle">
                Professional learning with AI guidance
              </p>
            </div>
          </div>

          <details className="nav-category-menu">
            <summary className="nav-category" aria-label="Browse categories">
              <span className="nav-category-icon">≡</span>
              Categories
            </summary>
            <div className="nav-category-list">
              <Link href="/courses?category=web-development">
                Web Development
              </Link>
              <Link href="/courses?category=ai-machine-learning">
                AI &amp; Machine Learning
              </Link>
              <Link href="/courses?category=design">Design</Link>
              <Link href="/courses?category=business">Business</Link>
              <Link href="/courses?category=data-science">Data Science</Link>
            </div>
          </details>

          <form className="nav-search" action="/courses">
            <span className="nav-search-icon">⌕</span>
            <input
              type="search"
              name="q"
              placeholder="Search courses, topics, or instructors"
              aria-label="Search courses"
            />
          </form>

          <div className="nav-right">
            <Link href="/dashboard" className="nav-link nav-link-strong">
              My learning
            </Link>
            <Link href="/courses" className="nav-link">
              Courses
            </Link>
            {isAuthenticated ? (
              <button
                type="button"
                className="auth-link auth-link-ghost"
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="auth-link auth-link-ghost">
                  Login
                </Link>
                <Link href="/register" className="auth-link auth-link-solid">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </header>
      ) : null}

      <main>{children}</main>

      {!isAuthPage ? (
        <footer className="footer">
          <div className="footer-top">
            <div className="footer-brand card glass-panel">
              <div className="footer-brand-row">
                <span className="nav-mark footer-mark" aria-hidden="true">
                  <span>AI</span>
                </span>
                <div>
                  <h4 style={{ margin: 0 }}>AI Learning Hub</h4>
                  <p className="muted" style={{ margin: "4px 0 0" }}>
                    A focused learning experience for students, teachers, and
                    teams.
                  </p>
                </div>
              </div>

              <p className="footer-brand-note muted">
                Structured around your backend learning flow: authentication,
                courses, chat, progress, and AI tools.
              </p>
            </div>

            <div className="footer-grid">
              <section>
                <h4>Platform</h4>
                <div className="footer-links">
                  <Link href="/dashboard">Dashboard</Link>
                  <Link href="/courses">Courses</Link>
                  <Link href="/chat">AI Chat</Link>
                  <Link href="/progress">Progress</Link>
                </div>
              </section>

              <section>
                <h4>Learning</h4>
                <div className="footer-links">
                  <Link href="/ai-tutor">AI Tutor</Link>
                  <Link href="/quiz">Quiz</Link>
                  {isAuthenticated ? (
                    <button
                      type="button"
                      className="auth-link auth-link-ghost"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <Link href="/login">Login</Link>
                      <Link href="/register">Sign Up</Link>
                    </>
                  )}
                </div>
              </section>

              <section>
                <h4>Support</h4>
                <div className="footer-links footer-contact">
                  <span>Phone: 0989928298</span>
                  <span>Email: elsialemayehu30@gmail.com</span>
                  <span>Available for project collaboration and support</span>
                </div>
              </section>

              <section>
                <h4>Social</h4>
                <div className="footer-links">
                  <a
                    href="https://www.linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://t.me/eprincesses"
                    aria-label="Telegram @eprincesses"
                  >
                    Telegram
                  </a>
                  <a href="https://github.com" target="_blank" rel="noreferrer">
                    GitHub
                  </a>
                  <a
                    href="https://www.youtube.com/@elsaalemayehu6946"
                    aria-label="YouTube @elsaalemayehu6946"
                  >
                    YouTube
                  </a>
                </div>
              </section>
            </div>
          </div>

          <div className="footer-trust-row">
            <span className="footer-badge">Secure sign-in</span>
            <span className="footer-badge">Role-based access</span>
            <span className="footer-badge">FastAPI-ready integration</span>
            <span className="footer-badge">Learning workflow integration</span>
          </div>

          <div className="footer-bottom">
            <p className="footer-note footer-note-left">
              © 2026 AI Learning Hub.
            </p>
            <div className="footer-links footer-links-inline">
              <Link href="/">Home</Link>
              <Link href="/courses">Courses</Link>
              <Link href="/chat">AI Chat</Link>
              <Link href="/progress">Progress</Link>
            </div>
          </div>
        </footer>
      ) : null}
    </>
  );
}

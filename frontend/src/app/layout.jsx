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
          <Link href="/">Home</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/lessons">Lessons</Link>
          <Link href="/ai-tutor">AI Tutor</Link>
          <Link href="/progress">Progress</Link>
          <Link href="/quiz">Quiz</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}

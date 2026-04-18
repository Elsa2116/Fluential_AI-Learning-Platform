import Link from "next/link";

export default function NotFound() {
  return (
    <section className="card grid" style={{ gap: 12 }}>
      <h2>Page not found</h2>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link href="/" className="button" style={{ width: "fit-content" }}>
        Back to Home
      </Link>
    </section>
  );
}

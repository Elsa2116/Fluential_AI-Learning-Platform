"use client";

import AuthForm from "@/components/AuthForm";
import { loginUser } from "@/lib/api-client";
import Link from "next/link";

export default function LoginPage() {
  return (
    <section className="auth-page auth-page-centered">
      <div className="auth-form-wrap">
        <AuthForm type="login" onSubmit={loginUser} />
      </div>

      <div className="auth-bottom-link">
        <span className="muted">Don't have an account?</span>
        <Link href="/register">Sign up</Link>
      </div>
    </section>
  );
}

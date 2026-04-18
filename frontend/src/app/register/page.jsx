"use client";

import AuthForm from "@/components/AuthForm";
import { registerUser } from "@/lib/api-client";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <section className="auth-page auth-page-centered">
      <div className="auth-form-wrap">
        <AuthForm type="register" onSubmit={registerUser} />
      </div>

      <div className="auth-bottom-link">
        <span className="muted">Already have an account?</span>
        <Link href="/login">Log in</Link>
      </div>
    </section>
  );
}

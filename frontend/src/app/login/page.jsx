"use client";

import AuthForm from "@/components/AuthForm";
import { loginUser } from "@/lib/api-client";

export default function LoginPage() {
  return (
    <section>
      <AuthForm type="login" onSubmit={loginUser} />
    </section>
  );
}

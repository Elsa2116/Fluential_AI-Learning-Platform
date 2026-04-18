"use client";

import AuthForm from "@/components/AuthForm";
import { registerUser } from "@/lib/api-client";

export default function RegisterPage() {
  return (
    <section>
      <AuthForm type="register" onSubmit={registerUser} />
    </section>
  );
}

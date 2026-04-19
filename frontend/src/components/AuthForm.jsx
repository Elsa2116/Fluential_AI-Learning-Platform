"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ type, onSubmit }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("international");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");

  const isRegister = type === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const payload = isRegister
        ? {
            full_name: fullName,
            email,
            password,
            country,
            role,
          }
        : { email, password };

      const result = await onSubmit(payload);
      if (result?.access_token) {
        localStorage.setItem("apl_token", result.access_token);
        localStorage.setItem("apl_user", JSON.stringify(result.user || {}));
        router.push("/dashboard");
        return;
      }
      setMessage(
        result?.message ||
          `${isRegister ? "Registration" : "Login"} successful.`,
      );
    } catch (error) {
      setMessage(error.message || "Request failed.");
    }
  }

  return (
    <form
      className="card grid glass-panel auth-card"
      onSubmit={handleSubmit}
      style={{ gap: 12 }}
    >
      <div
        className="card-header auth-card-header"
        style={{ alignItems: "flex-start" }}
      >
        <div>
          <span className="page-kicker">
            {isRegister ? "Create account" : "Sign in"}
          </span>
          <h2 style={{ margin: "8px 0 0" }}>
            {isRegister ? "Start learning" : "Welcome back"}
          </h2>
          <p className="muted auth-card-copy">
            {isRegister
              ? "Create your learning profile and pick the role that fits you best."
              : "Use your account to continue your lessons and progress."}
          </p>
        </div>
      </div>

      {isRegister ? (
        <label>
          Full Name
          <input
            className="input"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Full name"
            autoComplete="name"
            required
          />
        </label>
      ) : null}

      {isRegister ? (
        <label>
          Country
          <input
            className="input"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="Country or region"
            autoComplete="country-name"
            required
          />
        </label>
      ) : null}

      {isRegister ? (
        <label>
          Role
          <select
            className="input"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            required
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      ) : null}

      <label>
        Email
        <input
          className="input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </label>

      <label>
        Password
        <input
          className="input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
        />
      </label>

      <button className="button" type="submit">
        {isRegister ? "Create account" : "Sign in"}
      </button>

      {message ? (
        <p
          className="muted auth-status"
          style={{ marginBottom: 0, textAlign: "center" }}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

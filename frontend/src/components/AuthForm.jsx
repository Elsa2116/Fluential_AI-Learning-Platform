"use client";

import { useState } from "react";

export default function AuthForm({ type, onSubmit }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const isRegister = type === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const payload = isRegister
        ? { name, email, password }
        : { email, password };

      const result = await onSubmit(payload);
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
      className="card grid"
      onSubmit={handleSubmit}
      style={{ gap: 10, maxWidth: 460 }}
    >
      <h2 style={{ margin: 0 }}>{isRegister ? "Create Account" : "Login"}</h2>

      {isRegister ? (
        <label>
          Full Name
          <input
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            required
          />
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
          required
        />
      </label>

      <button className="button" type="submit">
        {isRegister ? "Register" : "Login"}
      </button>

      {message ? (
        <p className="muted" style={{ marginBottom: 0 }}>
          {message}
        </p>
      ) : null}
    </form>
  );
}

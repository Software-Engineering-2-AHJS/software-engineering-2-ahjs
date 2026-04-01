"use client";

import { useState } from "react";
import { authClient } from "@/app/auth-client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/debug/info",
    });
    if (error) {
      console.error("Login error:", error);
      alert(error?.message ?? "An error occurred during login.");
      return;
    }

    // Successful sign in
    console.log("Signed in:", data);
    router.push("/dashboard");
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <div>
          <input
            type="text"
            name="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>
      <button type="submit">Login</button>
    </form>
  );
}

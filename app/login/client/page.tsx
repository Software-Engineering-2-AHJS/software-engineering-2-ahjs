"use client";

import LoginForm from "@/app/components/login-form";
import Link from "next/link";

export default function ClientLogin() {
  return (
    <div className="client-login-form">
      <div className="role-panel">
        <h1>
          Client <br /> Login
        </h1>
        <Link className="role-switch" href="/login/accountant">
          Switch to Accountant
        </Link>
      </div>
      <div className="divider" aria-hidden="true"></div>

      <LoginForm />
    </div>
  );
}

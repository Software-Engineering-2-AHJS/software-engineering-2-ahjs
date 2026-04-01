"use client";

import LoginForm from "@/app/components/login-form";
import Link from "next/link";

export default function AccountantLogin() {
  return (
    <div className="accountant-login-form">
      <div className="role-panel">
        <h1>
          Accountant <br /> Login
        </h1>
        <Link className="role-switch" href="/login/client">
          Switch to Client
        </Link>
      </div>
      <div className="divider" aria-hidden="true"></div>
      <LoginForm />
    </div>
  );
}

"use client";

import Link from "next/link";

export default function Login() {
  return (
    <div className="main-container">
      <h1 className="h1">Login</h1>
      <div className="divider" aria-hidden="true"></div>
      <div className="outer-div">
        <div className="inner-div">
          <Link href="/login/accountant">Accountant</Link>
        </div>
        <div className="inner-div">
          <Link href="/login/client">Client</Link>
        </div>
      </div>
    </div>
  );
}

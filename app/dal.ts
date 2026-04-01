import "server-only";

import { headers } from "next/headers";
import { auth } from "@/app/auth";
import { cache } from "react";
import { redirect } from "next/navigation";

export const verifySession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session === null) {
    redirect("/login");
  }

  return { isAuth: true, userId: session.user.id };
});

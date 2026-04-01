import { auth } from "@/app/auth";

const createAccountant = async () =>
  await auth.api.createUser({
    body: {
      name: "Accountant",
      email: "example@example.com",
      password: "changeme",
      role: "admin",
    },
  });

export { createAccountant };

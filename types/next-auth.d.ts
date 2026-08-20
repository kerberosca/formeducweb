import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role: "learner" | "admin";
      isActive: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "learner" | "admin";
    isActive?: boolean;
  }
}

import NextAuth from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: Role;
      setorId: string | null;
    };
  }

  interface User {
    id: string;
    role: Role;
    setorId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    setorId: string | null;
  }
}

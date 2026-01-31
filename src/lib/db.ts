import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

declare global {
    var prisma: PrismaClient | undefined;
}

export const prisma = 
    globalThis.prisma ?? 
    new PrismaClient({
        adapter,
        log: ["error", "warn"]
    });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
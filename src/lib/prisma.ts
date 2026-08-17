import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Cache across warm serverless invocations too, not just dev hot-reload — this keeps
// the underlying pg connection pool alive instead of opening a fresh Neon connection
// (with a new TLS handshake) on every single request.
globalForPrisma.prisma = prisma;

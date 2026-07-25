import { PrismaClient } from "@/generated/prisma/client";
import { env } from "@/server/env";

declare global {
  // Allow global `var` declaration in development to prevent multiple instances.
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

/**
 * Singleton Prisma client for MongoDB.
 *
 * In development the module hot-reloads, which would otherwise create a new
 * PrismaClient on every reload and exhaust the connection pool. The global
 * variable persists across hot reloads.
 *
 * In production a fresh instance is created once.
 *
 * The `datasourceUrl` is passed explicitly so that runtime configuration is
 * always sourced from the validated env module rather than directly from
 * process.env.
 */
function createPrismaClient(): PrismaClient {
  // Prisma 7 MongoDB uses the WASM query compiler. The connection URL is
  // supplied via the `datasourceUrl` field on the runtime config, which maps
  // to the `accelerateUrl` constructor option in the generated type stubs.
  // This is the correct pattern for MongoDB until Prisma ships a dedicated
  // MongoDB driver adapter.
  // biome-ignore lint/suspicious/noExplicitAny: Prisma 7 MongoDB does not yet expose a typed datasourceUrl option; the generated stubs only model SQL adapters
  return new PrismaClient({ datasourceUrl: env.DATABASE_URL } as any);
}

export const prisma: PrismaClient =
  globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

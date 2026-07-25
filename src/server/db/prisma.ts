import { PrismaClient } from "@prisma/client";
import { env } from "@/server/env";

/**
 * Bump when Prisma schema fields change so the HMR singleton is recreated
 * instead of keeping a stale client that rejects new arguments.
 */
const PRISMA_CLIENT_REVISION = "invitation-revokedAt-v1";

declare global {
  // Allow global `var` declaration in development to prevent multiple instances.
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaClientRevision: string | undefined;
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
 * The datasource URL is passed explicitly so that runtime configuration is
 * always sourced from the validated env module rather than directly from
 * process.env.
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
  });
}

function getPrismaClient(): PrismaClient {
  if (
    env.NODE_ENV !== "production" &&
    globalThis.prismaGlobal &&
    globalThis.prismaClientRevision !== PRISMA_CLIENT_REVISION
  ) {
    void globalThis.prismaGlobal.$disconnect();
    globalThis.prismaGlobal = undefined;
  }

  const client = globalThis.prismaGlobal ?? createPrismaClient();

  if (env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = client;
    globalThis.prismaClientRevision = PRISMA_CLIENT_REVISION;
  }

  return client;
}

export const prisma: PrismaClient = getPrismaClient();

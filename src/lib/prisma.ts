/**
 * Library: prisma.ts
 * Purpose: Export a singleton PrismaClient instance to avoid exhausting database connections
 * during hot reloads in development.
 */
import { PrismaClient } from '@prisma/client'

// Reuse PrismaClient across HMR in dev to avoid creating too many connections
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// Cache the client in dev
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Library: prisma.ts
 * Purpose: Export a singleton PrismaClient instance to avoid exhausting database connections
 * during hot reloads in development.
 */
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Library: auth.ts
 * Purpose: Authentication helpers including password hashing/verification (bcrypt),
 * JWT generation/verification, and basic user queries/creation via Prisma.
 * Notes: JWT secret comes from env (fallback in dev). Tokens expire in 7d.
 */
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface UserPayload {
  id: string
  username: string
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  // Hash user password with 12 salt rounds
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // Compare plain password with stored hash
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: UserPayload): string {
  // Sign a JWT that expires in 7 days
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): UserPayload | null {
  try {
    // Verify token, return payload or null if invalid
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch {
    return null
  }
}

export async function getUserByEmail(email: string) {
  // Find a user by unique email
  return prisma.user.findUnique({
    where: { email }
  })
}

export async function getUserByUsername(username: string) {
  // Find a user by unique username
  return prisma.user.findUnique({
    where: { username }
  })
}

export async function createUser(username: string, email: string, password: string) {
  // Hash then create user record with selected fields
  const hashedPassword = await hashPassword(password)
  
  return prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      username: true,
      email: true,
      createdAt: true,
    }
  })
}

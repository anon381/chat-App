// Route: POST /api/auth/register
// Purpose: Create a new user after validating username/email uniqueness and password length. Returns JWT and profile on success.
import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, getUserByUsername, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const { username, email, password } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      // Required fields missing -> 400 Bad Request
      return NextResponse.json(
        { message: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      // Simple password policy on the edge (backend)
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUserByEmail = await getUserByEmail(email)
    if (existingUserByEmail) {
      // Email in use -> 400 with clear message
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const existingUserByUsername = await getUserByUsername(username)
    if (existingUserByUsername) {
      // Username in use -> 400 with clear message
      return NextResponse.json(
        { message: 'Username already taken' },
        { status: 400 }
      )
    }

    // Create user
    const user = await createUser(username, email, password)
    
    // Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    })

    // Success: return minimal profile and JWT for subsequent requests
    return NextResponse.json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    })
  } catch (error) {
    // Unexpected error
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

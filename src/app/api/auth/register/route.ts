// Route: POST /api/auth/register
// Purpose: Create a new user after validating username/email uniqueness and password length. Returns JWT and profile on success.
import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail, getUserByUsername, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUserByEmail = await getUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      )
    }

    const existingUserByUsername = await getUserByUsername(username)
    if (existingUserByUsername) {
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

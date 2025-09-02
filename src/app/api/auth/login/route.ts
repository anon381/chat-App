// Route: POST /api/auth/login
// Purpose: Verify user credentials, return JWT and basic user profile. Validates inputs and responds with 401 on failure.
import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      // Missing credentials -> 400 Bad Request
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await getUserByEmail(email)
    if (!user) {
      // Do not reveal which field failed -> generic 401
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      // Wrong password -> same generic 401
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
    })

    // Success response with JWT and minimal user profile
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    })
  } catch (error) {
    // Unexpected error
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

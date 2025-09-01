'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import InteractiveButton from '@/components/InteractiveButton'
import AnimatedInput from '@/components/AnimatedInput'
import Notification from '@/components/Notification'

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'info'
  } | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        setNotification({
          message: isLogin ? 'Login successful! Redirecting...' : 'Account created successfully! Redirecting...',
          type: 'success'
        })
        setTimeout(() => router.push('/chat'), 1500)
      } else {
        const error = await response.json()
        if (error.message.includes('email')) {
          setErrors({ email: error.message })
        } else if (error.message.includes('username')) {
          setErrors({ username: error.message })
        } else if (error.message.includes('password')) {
          setErrors({ password: error.message })
        } else {
          setErrors({ general: error.message })
        }
        setNotification({
          message: error.message,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Auth error:', error)
      setErrors({ general: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      {/* Floating chat bubbles */}
      <div className="absolute top-10 left-10 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
      <div className="absolute top-32 right-16 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full animate-bounce" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-20 left-20 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full animate-bounce" style={{animationDelay: '3s'}}></div>
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="w-full max-w-md mx-auto space-y-8 p-6 sm:p-8 animate-bounceIn relative z-10">
        {/* Logo and branding */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          
          <h2 className="text-5xl font-bold text-white animate-fadeIn font-display mb-4">
            {isLogin ? 'Welcome Back!' : 'Join ChatFlow'}
          </h2>
          <p className="text-xl text-purple-200 font-medium mb-2">
            {isLogin ? 'Continue your conversations' : 'Start your messaging journey'}
          </p>
          <p className="text-purple-300 text-sm">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-white hover:text-purple-200 transition-colors duration-200 hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <AnimatedInput
                id="username"
                name="username"
                type="text"
                label="Username"
                value={formData.username}
                onChange={handleInputChange}
                required={!isLogin}
                error={errors.username}
              />
            )}
            
            <AnimatedInput
              id="email"
              name="email"
              type="email"
              label="Email address"
              value={formData.email}
              onChange={handleInputChange}
              required
              autoComplete="email"
              error={errors.email}
            />
            
            <AnimatedInput
              id="password"
              name="password"
              type="password"
              label="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              error={errors.password}
            />
          </div>

          {errors.general && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 backdrop-blur-sm border border-red-500/30 p-3 rounded-xl animate-fadeIn">
              {errors.general}
            </div>
          )}

          <div>
            <InteractiveButton
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              {isLogin ? 'Sign in' : 'Sign up'}
            </InteractiveButton>
          </div>
        </form>
      </div>
    </div>
  )
}

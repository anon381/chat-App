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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-accent-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%229C92AC%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="w-full max-w-md mx-auto space-y-8 p-6 sm:p-8 animate-bounceIn relative z-10">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-bold text-gray-900 animate-fadeIn font-display">
            {isLogin ? 'Welcome back!' : 'Join us today!'}
          </h2>
          <p className="mt-3 text-lg text-gray-600 font-medium">
            {isLogin ? 'Sign in to continue chatting' : 'Create your account to start chatting'}
          </p>
          <p className="mt-4 text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200 hover:underline"
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
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg animate-fadeIn">
              {errors.general}
            </div>
          )}

          <div>
            <InteractiveButton
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              {isLogin ? 'Sign in' : 'Sign up'}
            </InteractiveButton>
          </div>
        </form>
      </div>
    </div>
  )
}

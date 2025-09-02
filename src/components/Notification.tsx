'use client'

import { useState, useEffect } from 'react'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export default function Notification({ 
  message, 
  type, 
  duration = 5000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300)
  }

  if (!isVisible) return null

  const baseClasses = 'fixed top-6 right-6 z-50 p-6 rounded-2xl shadow-soft transform transition-all duration-300 ease-in-out backdrop-blur-sm'
  
  const typeClasses = {
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-l-4 border-green-400 shadow-glow',
    error: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-l-4 border-red-400 shadow-glow',
    info: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-l-4 border-primary-400 shadow-glow'
  }

  const iconClasses = {
    success: 'text-green-100',
    error: 'text-red-100',
    info: 'text-blue-100'
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  }

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${
      isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
    }`}>
      <div className="flex items-center space-x-3">
  <span className={`text-base font-bold ${iconClasses[type]}`}>
          {icons[type]}
        </span>
        <span className="font-medium">{message}</span>
        <button
          onClick={handleClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

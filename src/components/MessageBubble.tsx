'use client'

import { useState, useEffect } from 'react'

interface MessageBubbleProps {
  id: string
  content: string
  sender: string
  timestamp: Date
  isOwn: boolean
  index: number
}

export default function MessageBubble({
  id,
  content,
  sender,
  timestamp,
  isOwn,
  index,
}: MessageBubbleProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    // Stagger the animation based on message index
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, index * 100)
    
    return () => clearTimeout(timer)
  }, [index])

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} transform transition-all duration-300 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`max-w-xs lg:max-w-lg px-6 py-4 rounded-3xl transition-all duration-300 ease-out ${
          isOwn
            ? 'bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 text-white shadow-soft'
            : 'bg-white/90 backdrop-blur-sm text-gray-900 border border-gray-100/50 shadow-soft'
        } ${
          isHovered 
            ? 'shadow-glow scale-105' 
            : 'hover:shadow-lg hover:scale-102'
        }`}
      >
        {!isOwn && (
          <p className="text-xs font-semibold text-gray-500 mb-1 opacity-80">
            {sender}
          </p>
        )}
        
        <p className="text-sm leading-relaxed break-words">
          {content}
        </p>
        
        <div className={`flex items-center justify-end mt-2 space-x-1 ${
          isOwn ? 'text-indigo-100' : 'text-gray-400'
        }`}>
          <span className="text-xs opacity-75">
            {formatTime(timestamp)}
          </span>
          
          {isOwn && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-current opacity-50"></div>
              <div className="w-2 h-2 rounded-full bg-current opacity-75"></div>
              <div className="w-2 h-2 rounded-full bg-current"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

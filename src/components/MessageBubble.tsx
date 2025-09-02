'use client'

/*
  Component: MessageBubble
  Purpose: Renders an individual chat message with owner/other styling, staggered entrance animation,
  optional sender label, timestamp, and delivery ticks for own messages. Client-only.
*/

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
    // Render a compact hour:minute timestamp
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div
      // Align to right for own messages, left otherwise; animate in from below
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} transform transition-all duration-300 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-4'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        // Own vs other styling, with hover/pressed shadow/scale feedback
        className={`max-w-xs lg:max-w-lg px-5 py-3.5 rounded-2xl transition-all duration-200 ease-out ${
          isOwn
            ? 'bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 text-white shadow-soft'
            : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 shadow-soft'
        } ${
          isHovered 
            ? 'shadow-glow scale-[1.02]' 
            : 'hover:shadow-md hover:scale-[1.01]'
        }`}
      >
        {/* Show sender label only for messages from others */}
        {!isOwn && (
           <p className="text-xs font-semibold text-purple-300 mb-2 opacity-90">
             {sender}
           </p>
         )}
        
        {/* Message text content */}
        <p className="text-sm leading-relaxed break-words">
          {content}
        </p>
        
        {/* Footer with timestamp and delivery indicator for own messages */}
        <div className={`flex items-center justify-end mt-3 space-x-2 ${
           isOwn ? 'text-purple-200' : 'text-purple-300'
         }`}>
           <span className="text-xs opacity-90">
             {formatTime(timestamp)}
           </span>
           
           {isOwn && (
             <div className="flex items-center space-x-1 ml-2">
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

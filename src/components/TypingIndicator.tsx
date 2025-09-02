'use client'

/*
  Component: TypingIndicator
  Purpose: Shows an animated three-dot indicator and optional sender label when isVisible is true.
  Uses a simple interval to cycle the active dot. Client-only.
*/

import { useState, useEffect } from 'react'

interface TypingIndicatorProps {
  isVisible: boolean
  sender?: string
}

export default function TypingIndicator({ isVisible, sender }: TypingIndicatorProps) {
  const [dotIndex, setDotIndex] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % 3)
    }, 500)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="flex justify-start mb-3 animate-fadeIn">
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-soft border border-white/20 max-w-md">
                 <div className="flex items-center space-x-3">
           {sender && (
             <span className="text-sm font-medium text-purple-300 font-display">
               {sender} is typing
             </span>
           )}
           
     <div className="flex space-x-2.5">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
       className={`w-2 h-2 rounded-full transition-all duration-300 ease-out ${
                  index === dotIndex
                    ? 'bg-purple-400 scale-125 shadow-glow'
                    : 'bg-white/30 scale-100'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

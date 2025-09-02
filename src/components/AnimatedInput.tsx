'use client'

import { useState, useRef, useEffect } from 'react'

interface AnimatedInputProps {
  id: string
  name: string
  type?: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  autoComplete?: string
  placeholder?: string
  error?: string
  className?: string
}

export default function AnimatedInput({
  id,
  name,
  type = 'text',
  label,
  value,
  onChange,
  required = false,
  autoComplete,
  placeholder,
  error,
  className = '',
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHasValue(value.length > 0)
  }, [value])

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  const baseClasses = 'relative w-full'
  const inputClasses = `w-full px-3 sm:px-4 py-2.5 sm:py-3 border rounded-lg transition-all duration-200 ease-out bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-white placeholder-white/50 ${
    error 
    ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500' 
    : 'border-white/20 hover:border-white/30'
  } ${className}`

  const labelClasses = `absolute left-3 sm:left-4 transition-all duration-200 ease-out pointer-events-none font-medium ${
    isFocused || hasValue
    ? 'top-1.5 text-xs text-purple-200 bg-slate-900 px-1.5 sm:px-2 font-semibold z-10'
    : 'top-2.5 sm:top-3.5 text-sm text-white/70'
  }`

  return (
    <div className={baseClasses}>
      <input
        ref={inputRef}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={inputClasses}
      />
      <label htmlFor={id} className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
             {error && (
         <div className="mt-1 text-sm text-red-400 animate-fadeIn">
           {error}
         </div>
       )}
    </div>
  )
}

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
  const inputClasses = `w-full px-4 sm:px-6 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl transition-all duration-300 ease-out bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 ${
    error 
      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
      : 'border-gray-200 hover:border-gray-300 focus:border-primary-500'
  } ${className}`

  const labelClasses = `absolute left-4 sm:left-6 transition-all duration-300 ease-out pointer-events-none font-medium ${
    isFocused || hasValue
      ? 'top-2 text-xs text-primary-600 bg-white px-2 sm:px-3 font-semibold'
      : 'top-3 sm:top-4 text-sm sm:text-base text-gray-500'
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
        <div className="mt-1 text-sm text-red-600 animate-fadeIn">
          {error}
        </div>
      )}
    </div>
  )
}

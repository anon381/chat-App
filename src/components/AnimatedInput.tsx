'use client'

import { useState, useEffect } from 'react'

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
  disabled?: boolean
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
  disabled = false,
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  useEffect(() => {
    setHasValue(Boolean(value && value.length > 0))
  }, [value])

  const baseClasses = 'relative w-full'
  const inputClasses = `w-full px-3 sm:px-3.5 pt-3 sm:pt-3.5 pb-2 sm:pb-2.5 border rounded-md text-sm leading-5 transition-all duration-200 ease-out bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-white ${
    error
      ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500'
      : 'border-white/20 hover:border-white/30'
  } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} ${(!isFocused && !hasValue) ? 'placeholder-white/35' : 'placeholder-transparent'} ${className}`

  // Placeholder is faint when idle, disappears on focus/typing
  const rawPlaceholder = placeholder ?? label
  const effectivePlaceholder = (!isFocused && !hasValue) ? rawPlaceholder : ''

  const errorId = `${id}-error`

  return (
    <div className={baseClasses}>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
  required={required}
        autoComplete={autoComplete}
  placeholder={effectivePlaceholder}
  className={inputClasses}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
  aria-label={label}
        disabled={disabled}
      />

      {error && (
        <div id={errorId} className="mt-1 text-sm text-red-400 animate-fadeIn">
          {error}
        </div>
      )}
    </div>
  )
}

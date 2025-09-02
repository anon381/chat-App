'use client'

/*
  Component: AnimatedInput
  Purpose: Small text/password input with subtle focus ring; shows a faint placeholder at rest that
  disappears on focus/typing. Displays inline error text and supports accessibility attributes.
*/

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
  // Track focus to control placeholder visibility and styles
  const [isFocused, setIsFocused] = useState(false)
  // Whether the input currently has a non-empty value
  const [hasValue, setHasValue] = useState(false)

  useEffect(() => {
    // Update hasValue whenever the value prop changes
    setHasValue(Boolean(value && value.length > 0))
  }, [value])

  const baseClasses = 'relative w-full'
  // Compose input classes and switch placeholder color based on focus/value state
  const inputClasses = `w-full h-8 px-2 py-1 border rounded text-xs leading-4 transition-all duration-200 ease-out bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-1 focus:ring-primary-500/30 focus:border-primary-500 text-white ${
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
        // Required/autoComplete bubble through to the native input
        required={required}
        autoComplete={autoComplete}
        // Use dynamic placeholder based on focus/value state
        placeholder={effectivePlaceholder}
        className={inputClasses}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        // Provide label text to screen readers since there’s no visible label element
        aria-label={label}
        disabled={disabled}
      />

      {/* Inline validation message below the input when error is present */}
      {error && (
        <div id={errorId} className="mt-1 text-sm text-red-400 animate-fadeIn">
          {error}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import MessageBubble from '@/components/MessageBubble'
import TypingIndicator from '@/components/TypingIndicator'
import InteractiveButton from '@/components/InteractiveButton'

interface Message {
  id: string
  content: string
  sender: string
  timestamp: Date
  isOwn: boolean
}

interface User {
  id: string
  username: string
  email: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    // Initialize socket connection
    const newSocket = io('http://localhost:3001', {
      auth: {
        token: token
      }
    })

    setSocket(newSocket)

    // Socket event listeners
    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    })

    newSocket.on('userData', (userData: User) => {
      setUser(userData)
    })

    newSocket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    newSocket.on('messages', (messagesData: Message[]) => {
      setMessages(messagesData)
    })

    return () => {
      newSocket.close()
    }
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && socket && user) {
      const message: Omit<Message, 'id' | 'timestamp' | 'isOwn'> = {
        content: newMessage.trim(),
        sender: user.username,
      }
      
      socket.emit('sendMessage', message)
      setNewMessage('')
      setIsTyping(false)
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    
    if (!isTyping && socket) {
      setIsTyping(true)
      socket.emit('typing', { user: user?.username })
    }
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      setIsTyping(false)
      if (socket) {
        socket.emit('stopTyping', { user: user?.username })
      }
    }, 1000)
    
    setTypingTimeout(timeout)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/20 to-accent-50/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-soft border-b border-gray-200/50 px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Chat App</h1>
          <p className="text-sm text-gray-600 font-medium">
            Welcome back, <span className="text-primary-600 font-semibold">{user.username}</span>
            <span className={`ml-3 inline-block w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-glow' : 'bg-red-500'}`}></span>
          </p>
        </div>
        <InteractiveButton
          onClick={handleLogout}
          variant="secondary"
          size="sm"
        >
          Logout
        </InteractiveButton>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        <div className="max-w-4xl mx-auto">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            id={message.id}
            content={message.content}
            sender={message.sender}
            timestamp={message.timestamp}
            isOwn={message.isOwn}
            index={index}
          />
        ))}
        
        <TypingIndicator 
          isVisible={isTyping} 
          sender={user?.username}
        />
        
        <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 px-8 py-6">
        <form onSubmit={handleSendMessage} className="flex space-x-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 max-w-2xl px-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/90 backdrop-blur-sm"
            disabled={!isConnected}
          />
          <InteractiveButton
            variant="primary"
            size="md"
            disabled={!newMessage.trim() || !isConnected}
            className="px-8"
          >
            Send
          </InteractiveButton>
        </form>
      </div>
    </div>
  )
}

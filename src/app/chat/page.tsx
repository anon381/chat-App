'use client'

/*
  Page: Chat
  Purpose: Real-time chat interface. Ensures a JWT exists, connects to Socket.IO backend (server.js on :3001),
  listens for messages, typing indicators, and user data, and sends messages/typing events. Provides logout to clear JWT.
  UI: Sidebar with contacts (mock), main chat thread with MessageBubble components, typing indicator, and message input.
  Client-only: Uses local state, effects, and socket.io-client; not a server component.
*/

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
    // 1) Check if user is authenticated via JWT in localStorage
    const token = localStorage.getItem('token')
    if (!token) {
      // If no token, redirect back to auth page
      router.push('/')
      return
    }

    // 2) Initialize socket connection with token for auth handshake
    const newSocket = io('http://localhost:3001', {
      auth: {
        token: token
      }
    })

    setSocket(newSocket)

    // 3) Socket event listeners to track connectivity and receive data
    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    })

    newSocket.on('userData', (userData: User) => {
      // Server sends decoded user payload once connected
      setUser(userData)
    })

    newSocket.on('message', (message: Message) => {
      // Append a single incoming message
      setMessages(prev => [...prev, message])
    })

    newSocket.on('messages', (messagesData: Message[]) => {
      // Initial batch of recent messages
      setMessages(messagesData)
    })

    return () => {
      // 4) Cleanup socket on unmount
      newSocket.close()
    }
  }, [router])

  useEffect(() => {
    // Scroll chat view when messages change
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    // Smoothly keep the latest message visible
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && socket && user) {
      // Trim and emit message to server; server fills id/timestamp
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
    setNewMessage(e.target.value) // update input value
    
    if (!isTyping && socket) {
      // Notify server once when typing starts
      setIsTyping(true)
      socket.emit('typing', { user: user?.username })
    }
    
    // Clear existing timeout so we debounce the stopTyping event
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    
    // Set new timeout to stop typing indicator if user pauses for 1s
    const timeout = setTimeout(() => {
      setIsTyping(false)
      if (socket) {
        socket.emit('stopTyping', { user: user?.username })
      }
    }, 1000)
    
    setTypingTimeout(timeout)
  }

  const handleLogout = () => {
    // Clear JWT and go back to auth page
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
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar - Contacts and Chats */}
      <div className="hidden sm:flex w-64 sm:w-72 lg:w-80 bg-slate-800/50 backdrop-blur-sm border-r border-white/10 flex-col">
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white font-display">ChatFlow</h1>
            <button className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center transition-colors">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full px-3 sm:px-4 pr-10 sm:pr-12 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500 transition-colors text-sm sm:text-base"
            />
            <svg className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 sm:p-4 border-b border-white/10">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-base sm:text-lg">{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm sm:text-base truncate">{user.username}</p>
              <p className="text-purple-300 text-xs sm:text-sm flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {isConnected ? 'Online' : 'Offline'}
              </p>
            </div>
            <InteractiveButton
              onClick={handleLogout}
              variant="secondary"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex-shrink-0"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </InteractiveButton>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          {/* Sample chats - in real app these would come from database */}
          <div className="p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">J</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">John Doe</p>
                <p className="text-purple-300 text-xs sm:text-sm truncate">Hey, how are you?</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white/50 text-xs">2m</p>
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full flex items-center justify-center mt-1">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">S</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">Sarah Smith</p>
                <p className="text-purple-300 text-xs sm:text-sm truncate">Meeting at 3 PM?</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white/50 text-xs">5m</p>
              </div>
            </div>
          </div>

          <div className="p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">M</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">Mike Johnson</p>
                <p className="text-purple-300 text-xs sm:text-sm truncate">Project update ready</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-white/50 text-xs">1h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
  <div className="bg-slate-800/50 backdrop-blur-sm border-b border-white/10 px-4 sm:px-6 py-2.5 sm:py-3.5">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Mobile menu button */}
            <button className="sm:hidden w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors mr-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base sm:text-lg">J</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">John Doe</h2>
              <p className="text-purple-300 text-xs sm:text-sm">Online</p>
            </div>
            <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-800/50">
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

                {/* Message Input */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-t border-white/10 p-4 sm:p-6">
          <form onSubmit={handleSendMessage} className="flex space-x-3 sm:space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="w-full px-4 sm:px-6 py-3 sm:py-4 pr-14 sm:pr-16 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-sm sm:text-base"
                disabled={!isConnected}
              />
              <button className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </div>
            <InteractiveButton
              variant="primary"
              size="md"
              disabled={!newMessage.trim() || !isConnected}
              className="px-6 sm:px-8 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </InteractiveButton>
          </form>
        </div>
      </div>
    </div>
  )
}

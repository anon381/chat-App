/**
 * Socket.IO server (server.js)
 * Purpose: Authenticates clients via JWT, broadcasts/receives chat messages, and persists them with Prisma.
 * Ports: Runs on 3001 by default; CORS allows http://localhost:3000 (Next.js dev).
 * Data: On connect, sends userData and last 50 messages; listens for sendMessage and emits message to all clients.
 */
const { createServer } = require('http')
const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Store connected users
const connectedUsers = new Map()

// Authenticate each incoming socket using the provided JWT
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('Authentication error'))
  }

  try {
    // Verify token; stash user id/payload on socket for later use
    const decoded = jwt.verify(token, JWT_SECRET)
    socket.userId = decoded.id
    socket.userData = decoded
    next()
  } catch (err) {
    next(new Error('Authentication error'))
  }
})

io.on('connection', async (socket) => {
  console.log(`User ${socket.userData.username} connected`)
  
  // Store user connection (so we could DM later if needed)
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    userData: socket.userData
  })

  // Send user data to client
  socket.emit('userData', socket.userData)

  // Send recent messages on join
  try {
    const messages = await prisma.message.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            username: true
          }
        }
      }
    })

    const formattedMessages = messages.reverse().map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender.username,
      timestamp: msg.createdAt,
      isOwn: msg.senderId === socket.userId
    }))

    socket.emit('messages', formattedMessages)
  } catch (error) {
    console.error('Error fetching messages:', error)
  }

  // Handle new messages from this client
  socket.on('sendMessage', async (messageData) => {
    try {
      const message = await prisma.message.create({
        data: {
          content: messageData.content,
          senderId: socket.userId,
        },
        include: {
          sender: {
            select: {
              username: true
            }
          }
        }
      })

      const formattedMessage = {
        id: message.id,
        content: message.content,
        sender: message.sender.username,
        timestamp: message.createdAt,
        isOwn: false
      }

  // Broadcast to all connected users (including sender)
      io.emit('message', formattedMessage)
    } catch (error) {
      console.error('Error saving message:', error)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log(`User ${socket.userData.username} disconnected`)
    connectedUsers.delete(socket.userId)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})

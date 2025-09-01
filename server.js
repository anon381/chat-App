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

io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('Authentication error'))
  }

  try {
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
  
  // Store user connection
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    userData: socket.userData
  })

  // Send user data to client
  socket.emit('userData', socket.userData)

  // Send recent messages
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

  // Handle new messages
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

      // Broadcast to all connected users
      io.emit('message', formattedMessage)
    } catch (error) {
      console.error('Error saving message:', error)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  socket.on('disconnect', () => {
    console.log(`User ${socket.userData.username} disconnected`)
    connectedUsers.delete(socket.userId)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`)
})

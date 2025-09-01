# Chat App

A modern, real-time chat application built with Next.js, TypeScript, Socket.IO, and Prisma.

## Features

- 🔐 User authentication (register/login)
- 💬 Real-time messaging with Socket.IO
- 🎨 Modern UI with Tailwind CSS
- 🗄️ SQLite database with Prisma ORM
- 📱 Responsive design
- 🔒 JWT-based authentication

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Socket.IO
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd chat-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:generate
npm run db:push
```

4. Start the development servers:
```bash
npm run dev:full
```

This will start both the Next.js app (port 3000) and the Socket.IO server (port 3001).

### Available Scripts

- `npm run dev` - Start Next.js development server only
- `npm run server` - Start Socket.IO server only  
- `npm run dev:full` - Start both servers concurrently
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Create a new account or login with existing credentials
3. Start chatting in real-time!

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   │   └── auth/       # Authentication endpoints
│   ├── chat/           # Chat page
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
├── lib/               # Utility functions
│   ├── auth.ts        # Authentication utilities
│   └── prisma.ts      # Prisma client
└── types/             # TypeScript type definitions

prisma/
└── schema.prisma      # Database schema

server.js              # Socket.IO server
```

## Database Schema

The app uses two main models:

- **User**: Stores user information (id, username, email, password)
- **Message**: Stores chat messages (id, content, senderId, timestamps)

## Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-secret-key-here
DATABASE_URL="file:./dev.db"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

/*
  File: RootLayout (src/app/layout.tsx)
  Purpose: Global HTML shell for all routes. Sets metadata, loads global CSS, and applies the Inter font.
  Notes: This is a server component that wraps every page in the app directory.
*/
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chat App',
  description: 'A modern real-time chat application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}

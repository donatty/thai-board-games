import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title:       'Thai Board Games — เกมกระดานไทย',
  description: 'เล่นหมากฮอส หมากรุก และเกมกระดานไทยออนไลน์กับเพื่อน',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-dark-900">
        {children}
      </body>
    </html>
  )
}

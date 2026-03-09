// src/app/layout.tsx
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Karar Koçu — The Architect',
  description: 'Psikoloji, spiritüellik ve matematiksel karar modelleriyle hayatınızdaki önemli kararları netleştirin.',
  keywords: 'karar koçu, spiritüel koçluk, psikolojik danışmanlık, karar verme',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#181818',
              color: '#d4cfc6',
              border: '1px solid #2a2a2a',
              fontFamily: 'DM Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#c9a84c', secondary: '#000' } },
          }}
        />
      </body>
    </html>
  )
}

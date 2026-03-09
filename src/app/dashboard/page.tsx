'use client'
// src/app/dashboard/page.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User { id: string; email: string; name: string | null; credits: number; role: string }
interface Conversation { id: string; title: string; updatedAt: string }

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/chat/conversations').then(r => r.json()),
    ]).then(([userData, convData]) => {
      if (userData.user) setUser(userData.user)
      if (convData.conversations) setConversations(convData.conversations)
      setLoading(false)
    })
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  async function deleteConversation(id: string) {
    await fetch('/api/chat/conversations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setConversations(prev => prev.filter(c => c.id !== id))
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  )

  const creditWarning = user && user.credits < 20

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      {/* Nav */}
      <nav style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(16px)', zIndex: 50 }}>
        <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--gold)', textDecoration: 'none' }}>
          Karar<span style={{ color: 'var(--white)' }}>Koçu</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Credit badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: creditWarning ? 'rgba(255,80,80,0.1)' : 'var(--gold-dim)', border: `1px solid ${creditWarning ? 'rgba(255,80,80,0.3)' : 'var(--gold-border)'}`, color: creditWarning ? '#ff8080' : 'var(--gold)', padding: '6px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 500 }}>
            <span>⚡</span>
            <span>{user?.credits ?? 0} kredi</span>
          </div>
          {creditWarning && (
            <a href="https://ycfdigital.com/#pricing" target="_blank" rel="noreferrer" style={{ background: 'var(--gold)', color: '#000', padding: '7px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
              Kredi Yükle
            </a>
          )}
          <button onClick={logout} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Çıkış
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: 'var(--white)', marginBottom: '8px' }}>
            Merhaba, <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{user?.name || user?.email?.split('@')[0]}</em>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>The Architect sizi dinlemeye hazır. Bugün ne üzerine düşünmek istersiniz?</p>
        </div>

        {/* Credit warning banner */}
        {creditWarning && (
          <div style={{ background: 'rgba(255,80,80,0.07)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <p style={{ color: '#ff8080', fontSize: '0.9rem' }}>⚠ Krediniz azalıyor ({user?.credits} kaldı). Sohbete devam etmek için kredi yükleyin.</p>
            <a href="https://ycfdigital.com/#pricing" target="_blank" rel="noreferrer" style={{ background: 'var(--gold)', color: '#000', padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Kredi Satın Al →
            </a>
          </div>
        )}

        {/* New chat CTA */}
        <Link href="/chat" style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          background: 'var(--card)', border: '1px solid var(--gold-border)',
          borderRadius: '16px', padding: '24px', marginBottom: '36px',
          textDecoration: 'none', transition: 'all .2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold-dim)'; e.currentTarget.style.borderColor = 'var(--gold)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.borderColor = 'var(--gold-border)' }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🏛</div>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--white)', marginBottom: '4px' }}>Yeni Sohbet Başlat</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>The Architect ile yeni bir konuyu keşfet</div>
          </div>
          <div style={{ marginLeft: 'auto', color: 'var(--gold)', fontSize: '1.4rem' }}>→</div>
        </Link>

        {/* Conversations */}
        {conversations.length > 0 && (
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--white)', marginBottom: '16px' }}>Geçmiş Sohbetler</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {conversations.map(conv => (
                <div key={conv.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 18px', transition: 'border-color .2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#3a3a3a'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ fontSize: '1rem' }}>💬</span>
                  <Link href={`/chat?id=${conv.id}`} style={{ flex: 1, textDecoration: 'none', color: 'var(--text)', fontSize: '0.9rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {conv.title}
                  </Link>
                  <span style={{ fontSize: '0.75rem', color: '#444', flexShrink: 0 }}>
                    {new Date(conv.updatedAt).toLocaleDateString('tr-TR')}
                  </span>
                  <button onClick={() => deleteConversation(conv.id)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: '1rem', padding: '0 4px', transition: 'color .2s' }}
                    onMouseEnter={e => (e.target as any).style.color = '#ff8080'}
                    onMouseLeave={e => (e.target as any).style.color = '#444'}
                  >✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {conversations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏛</div>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--white)', marginBottom: '8px' }}>İlk sohbetinizi başlatın</p>
            <p style={{ fontSize: '0.88rem' }}>The Architect her konuşmada yanınızda.</p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'
// src/app/chat/page.tsx
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'

interface Message { role: 'user' | 'assistant'; content: string; id?: string }

function ChatInterface() {
  const router = useRouter()
  const params = useSearchParams()
  const initQ = params.get('q') || ''
  const initConvId = params.get('id') || ''

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState(initQ)
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [conversationId, setConversationId] = useState(initConvId)
  const [lang, setLang] = useState<'tr' | 'en'>('tr')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const t = {
    tr: { placeholder: 'The Architect\'e bir şey sorun…', send: 'Gönder', newChat: 'Yeni Sohbet', history: 'Geçmiş', noCredits: 'Krediniz bitti. Devam etmek için kredi yükleyin.', buyCredits: 'Kredi Satın Al →', thinking: 'Düşünüyor…' },
    en: { placeholder: 'Ask The Architect something…', send: 'Send', newChat: 'New Chat', history: 'History', noCredits: 'Out of credits. Purchase more to continue.', buyCredits: 'Buy Credits →', thinking: 'Thinking…' },
  }[lang]

  // Load conversation or credits
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) { setCredits(d.user.credits); setLang(d.user.language || 'tr') }
    })
    fetch('/api/chat/conversations').then(r => r.json()).then(d => {
      if (d.conversations) setConversations(d.conversations)
    })
    if (initConvId) {
      fetch(`/api/chat/conversations/${initConvId}`).then(r => r.json()).then(d => {
        if (d.conversation?.messages) {
          setMessages(d.conversation.messages.map((m: any) => ({ role: m.role, content: m.content })))
        }
      })
    }
  }, [initConvId])

  // Auto-submit initial question
  useEffect(() => {
    if (initQ && messages.length === 0 && credits !== null && credits > 0) {
      sendMessage(initQ)
      setInput('')
    }
  }, [credits])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text?: string) {
    const msg = (text || input).trim()
    if (!msg || loading || streaming) return
    if (credits !== null && credits <= 0) {
      toast.error(t.noCredits)
      return
    }

    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: msg }])

    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, conversationId: conversationId || undefined, language: lang }),
      })

      if (res.status === 402) {
        toast.error(t.noCredits)
        setLoading(false)
        return
      }

      if (!res.ok || !res.body) throw new Error('Failed')

      setLoading(false)
      setStreaming(true)
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.text) {
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { ...updated[updated.length - 1], content: updated[updated.length - 1].content + data.text }
                return updated
              })
            }
            if (data.done) {
              if (data.conversationId && !conversationId) setConversationId(data.conversationId)
              if (data.credits !== undefined) setCredits(data.credits)
              if (data.creditWarning) toast.error(t.noCredits)
            }
          } catch {}
        }
      }
      setStreaming(false)
    } catch {
      toast.error('Bir hata oluştu')
      setLoading(false)
      setStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const creditWarning = credits !== null && credits < 20
  const noCredits = credits !== null && credits <= 0

  return (
    <div style={{ height: '100vh', display: 'flex', background: 'var(--black)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '260px' : '0', transition: 'width .3s', overflow: 'hidden',
        borderRight: '1px solid var(--border)', background: 'var(--dark)', display: 'flex', flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ padding: '16px', minWidth: '260px' }}>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--gold)', textDecoration: 'none' }}>KararKoçu</Link>
            <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
          </div>
          <Link href="/chat" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', borderRadius: '10px', padding: '10px 14px', color: 'var(--gold)', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, marginBottom: '16px' }}>
            ✦ {t.newChat}
          </Link>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '8px' }}>{t.history}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
            {conversations.map(c => (
              <Link key={c.id} href={`/chat?id=${c.id}`} style={{ padding: '9px 12px', borderRadius: '8px', background: c.id === conversationId ? 'var(--gold-dim)' : 'none', color: c.id === conversationId ? 'var(--gold)' : 'var(--muted)', textDecoration: 'none', fontSize: '0.83rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', display: 'block', transition: 'background .15s' }}>
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(8,8,8,0.9)', flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', width: 34, height: 34, borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>🏛</div>
            <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--white)' }}>The Architect</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={() => setLang(l => l === 'tr' ? 'en' : 'tr')} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
              {lang === 'tr' ? 'EN' : 'TR'}
            </button>
            {credits !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: creditWarning ? 'rgba(255,80,80,0.1)' : 'var(--gold-dim)', border: `1px solid ${creditWarning ? 'rgba(255,80,80,0.3)' : 'var(--gold-border)'}`, color: creditWarning ? '#ff8080' : 'var(--gold)', padding: '5px 11px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 500 }}>
                ⚡ {credits}
              </div>
            )}
            <Link href="/dashboard" style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', textDecoration: 'none' }}>← Panel</Link>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🏛</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--white)', marginBottom: '8px' }}>The Architect</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '400px', lineHeight: 1.65 }}>
                {lang === 'tr' ? 'Psikoloji, spiritüellik ve matematiksel karar modelleriyle — bugün ne üzerine düşünmek istersiniz?' : 'Psychology, spirituality and mathematical decision models — what would you like to think about today?'}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', maxWidth: '100%' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-end', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', background: msg.role === 'user' ? 'var(--card)' : 'var(--gold-dim)', border: `1px solid ${msg.role === 'user' ? 'var(--border)' : 'var(--gold-border)'}` }}>
                {msg.role === 'user' ? '👤' : '🏛'}
              </div>
              <div style={{ maxWidth: 'min(76%, 680px)', padding: '14px 18px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? 'rgba(201,168,76,0.1)' : 'var(--card)', border: `1px solid ${msg.role === 'user' ? 'rgba(201,168,76,0.2)' : 'var(--border)'}`, color: 'var(--text)', fontSize: '0.92rem', lineHeight: 1.7 }} className="prose-architect">
                {msg.role === 'assistant' ? (
                  <>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {streaming && i === messages.length - 1 && <span className="typing-cursor" />}
                  </>
                ) : msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🏛</div>
              <div style={{ padding: '14px 18px', borderRadius: '16px 16px 16px 4px', background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="spinner" style={{ width: 14, height: 14 }} /> {t.thinking}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* No credits banner */}
        {noCredits && (
          <div style={{ padding: '16px 20px', background: 'rgba(255,80,80,0.08)', borderTop: '1px solid rgba(255,80,80,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <p style={{ color: '#ff8080', fontSize: '0.88rem' }}>⚠ {t.noCredits}</p>
            <a href="https://ycfdigital.com/#pricing" target="_blank" rel="noreferrer" style={{ background: 'var(--gold)', color: '#000', padding: '8px 18px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t.buyCredits}
            </a>
          </div>
        )}

        {/* Input */}
        {!noCredits && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: 'rgba(8,8,8,0.95)', flexShrink: 0 }}>
            <div style={{ maxWidth: '760px', margin: '0 auto', position: 'relative' }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px' }}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                rows={1}
                style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 60px 14px 18px', color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', outline: 'none', resize: 'none', lineHeight: 1.5, transition: 'border-color .2s' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
              <button onClick={() => sendMessage()} disabled={loading || streaming || !input.trim()} style={{ position: 'absolute', right: '10px', bottom: '10px', width: 38, height: 38, borderRadius: '10px', background: (loading || streaming || !input.trim()) ? '#333' : 'var(--gold)', border: 'none', cursor: (loading || streaming || !input.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={(loading || streaming || !input.trim()) ? '#666' : '#000'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
            <p style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.72rem', color: '#333' }}>
              {lang === 'tr' ? 'Enter ile gönder · Shift+Enter satır atlar' : 'Enter to send · Shift+Enter for new line'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  return <Suspense><ChatInterface /></Suspense>
}

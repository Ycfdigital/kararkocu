'use client'
// src/app/login/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState<'tr' | 'en'>('tr')

  const t = {
    tr: { title: 'Giriş Yap', sub: 'The Architect sizi bekliyor', emailLabel: 'E-posta', passLabel: 'Şifre', btn: 'Giriş Yap', forgot: 'Şifremi unuttum', noAccount: 'Henüz hesabınız yok mu?', buy: 'Paket satın alın →', wrongCreds: 'E-posta veya şifre hatalı', error: 'Bir hata oluştu' },
    en: { title: 'Login', sub: 'The Architect awaits you', emailLabel: 'Email', passLabel: 'Password', btn: 'Login', forgot: 'Forgot password', noAccount: "Don't have an account?", buy: 'Purchase a package →', wrongCreds: 'Invalid email or password', error: 'An error occurred' },
  }[lang]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error === 'invalid_credentials' ? t.wrongCreds : t.error)
      } else {
        router.push('/dashboard')
      }
    } catch {
      toast.error(t.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      {/* Glow */}
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--gold)', textDecoration: 'none' }}>
            Karar<span style={{ color: 'var(--white)' }}>Koçu</span>
          </Link>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '8px' }}>{t.sub}</p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '36px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--white)' }}>{t.title}</h1>
            <button onClick={() => setLang(l => l === 'tr' ? 'en' : 'tr')} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
              {lang === 'tr' ? 'EN' : 'TR'}
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '6px' }}>{t.emailLabel}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', background: '#111', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '6px' }}>{t.passLabel}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', background: '#111', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ textAlign: 'right' }}>
              <Link href="/reset-password" style={{ fontSize: '0.8rem', color: 'var(--muted)', textDecoration: 'none' }}>{t.forgot}</Link>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? '#888' : 'var(--gold)', border: 'none', borderRadius: '10px', color: '#000', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .2s', marginTop: '4px' }}>
              {loading ? <div className="spinner" style={{ margin: '0 auto' }} /> : t.btn}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--muted)' }}>
            {t.noAccount}{' '}
            <a href="https://ycfdigital.com/#pricing" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none' }}>{t.buy}</a>
            {/* PLACEHOLDER: WooCommerce pricing sayfası linki */}
          </div>
        </div>
      </div>
    </div>
  )
}

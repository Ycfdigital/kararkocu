'use client'
// src/app/set-password/page.tsx
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

function SetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''
  const isReset = params.get('reset') === '1'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) return toast.error('Şifreler eşleşmiyor')
    if (password.length < 8) return toast.error('Şifre en az 8 karakter olmalı')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error === 'invalid_or_expired_token' ? 'Geçersiz veya süresi dolmuş link' : 'Bir hata oluştu')
      } else {
        toast.success('Şifreniz belirlendi!')
        router.push('/dashboard')
      }
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '400px', background: 'radial-gradient(ellipse, rgba(201,168,76,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', color: 'var(--gold)', textDecoration: 'none' }}>
            Karar<span style={{ color: 'var(--white)' }}>Koçu</span>
          </Link>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '8px' }}>
            {isReset ? 'Yeni şifrenizi belirleyin' : 'Hesabınıza giriş şifrenizi belirleyin'}
          </p>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '36px 32px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: 'var(--white)', marginBottom: '24px' }}>
            {isReset ? 'Şifre Sıfırla' : 'Şifre Oluştur'}
          </h1>
          {!isReset && (
            <div style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid var(--gold-border)', borderRadius: '10px', padding: '14px', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}>
              🎯 Satın alımınız onaylandı. Kredileriniz hesabınıza yüklendi. Şimdi şifrenizi oluşturun.
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '6px' }}>Şifre (en az 8 karakter)</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', background: '#111', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '6px' }}>Şifre Tekrar</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required style={{ width: '100%', background: '#111', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', color: 'var(--white)', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'var(--gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? '#888' : 'var(--gold)', border: 'none', borderRadius: '10px', color: '#000', fontFamily: 'DM Sans, sans-serif', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px' }}>
              {loading ? <div className="spinner" style={{ margin: '0 auto' }} /> : 'Şifremi Belirle ve Giriş Yap →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function SetPasswordPage() {
  return <Suspense><SetPasswordForm /></Suspense>
}

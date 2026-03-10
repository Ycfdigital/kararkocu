'use client'
// src/app/page.tsx
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

// ── DEMO DATA ─────────────────────────────────────────────────
const DEMOS = {
  tr: [
    {
      label: '👨‍👩‍👧 Aile',
      q: 'Çok çalışıyorum, aileme hiç vakit kalmıyor. İçimde bir suçluluk var ama duramıyorum da.',
      a: `Bu ikisi aynı anda var olmak zorunda değil — ama şu an öyle hissettiriyor, bunu duyuyorum.\n\n"Duramıyorum" derken kastettiğiniz şeyi biraz ölçelim: İş hayatınızdaki kontrol hissinizi 1-10 arasında nereye koyarsınız? 1 = tamamen sürükleniyor, 10 = her şey benim elimde.\n\n*(Suçluluk bazen bir alarm, bazen de yanlış bir inanç sisteminin sesi — hangisi olduğunu birlikte bulacağız.)*\n\n> **Referanslar:** Brené Brown — *Atlas of the Heart* (guilt vs. shame) · Mihaly Csikszentmihalyi — Flow Theory · Viktor Frankl — *Man's Search for Meaning*`,
    },
    {
      label: '💼 Kariyer',
      q: '8 yıldır aynı işi yapıyorum. Güvenli ama ruhsuz. Değişmek istiyorum ama neye doğru bilmiyorum.',
      a: `Sekiz yıl — bu sadece bir süre değil, bir kimlik. Ve "ruhsuz" demeniz, o kimliğin artık size dar geldiğini söylüyor. Bunu hissedebiliyorum.\n\nŞöyle bir A/B sorusu: Önünüzde iki kapı — A: aynı sektörde, tamamen farklı bir şirket kültürü. B: tamamen farklı bir alan, sıfırdan başlamak. Hangisi sizi daha çok korkutuyor?\n\n*(Korkutucu olan şey, genellikle tam da istediğimiz şeydir.)*\n\n> **Referanslar:** Carl Jung — *Individuation Process* · Daniel Kahneman — *Thinking, Fast and Slow* (loss aversion) · Ikigai Framework (Japonya)`,
    },
    {
      label: '❤️ İlişki',
      q: 'Partnerimle çok şey yaşadık ama artık birbirimize yabancı gibi hissediyoruz.',
      a: `"Çok şey yaşadık" diyorsunuz — bu, vazgeçmek istemediğinizi de söylüyor aynı zamanda. O bağı hâlâ taşıdığınızı hissedebiliyorum.\n\nYabancılık nadiren bir kırılmadan gelir. Çoğunlukla birbirinize "evet ama yarın konuşuruz" dediğiniz yüzlerce küçük andan birikir.\n\nŞunu ölçelim: Partnerinizin şu an en çok neye ihtiyaç duyduğunu, 1-10 arasında ne kadar bildiğinizi düşünüyorsunuz?\n\n> **Referanslar:** John Gottman — *The Seven Principles for Making Marriage Work* · Sue Johnson — *Emotionally Focused Therapy* · Rumi — *"Sessizlikte söylenmemiş olanı duy"*`,
    },
  ],
  en: [
    {
      label: '👨‍👩‍👧 Family',
      q: "I work too much and have no time for my family. I feel guilty but I can't stop.",
      a: `These two don't have to coexist — but right now they do, and I can feel the weight of that.\n\nLet's measure something: On a scale of 1-10, how much control do you feel you have over your work life? 1 = completely swept along, 10 = I'm fully in charge.\n\n*(Guilt is sometimes an alarm, sometimes the voice of a false belief system — we'll find out which together.)*\n\n> **References:** Brené Brown — *Atlas of the Heart* (guilt vs. shame) · Mihaly Csikszentmihalyi — Flow Theory · Viktor Frankl — *Man's Search for Meaning*`,
    },
    {
      label: '💼 Career',
      q: "I've been doing the same job for 8 years. Safe but soulless. I want change but don't know toward what.",
      a: `Eight years — that's not just time, it's identity. And "soulless" tells me that identity no longer fits. I can feel the constriction in that word.\n\nAn A/B question: Two doors in front of you — A: same industry, completely different company culture. B: entirely different field, starting from zero. Which one frightens you more?\n\n*(What frightens us is usually exactly what we want.)*\n\n> **References:** Carl Jung — *Individuation Process* · Daniel Kahneman — *Thinking, Fast and Slow* (loss aversion) · Ikigai Framework (Japan)`,
    },
  ],
}

const CATEGORIES_TR = [
  { label: 'Aile', emoji: '👨‍👩‍👧', prompt: 'Aileyle ilgili bir durumu paylaşmak istiyorum.' },
  { label: 'Kariyer', emoji: '💼', prompt: 'Kariyer kararımda netleşmeye ihtiyacım var.' },
  { label: 'Finans', emoji: '💰', prompt: 'Finansal bir karar vermekte zorlanıyorum.' },
  { label: 'İlişkiler', emoji: '❤️', prompt: 'Bir ilişki konusunda kafam karışık.' },
  { label: 'Sağlık', emoji: '🌿', prompt: 'Yaşam tarzım ve sağlığım hakkında düşünmek istiyorum.' },
  { label: 'Diğer', emoji: '✦', prompt: 'Hayatımda köklü bir karar vermem gerekiyor.' },
]

export default function HomePage() {
  const [lang, setLang] = useState<'tr' | 'en'>('tr')
  const [activeDemo, setActiveDemo] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [heroInput, setHeroInput] = useState('')
  const typingRef = useRef<NodeJS.Timeout>()
  const demos = DEMOS[lang]

  const t = {
    tr: {
      badge: 'The Architect — Karar Uzmanı',
      h1a: 'Hayatının önemli',
      h1b: 'kararlarında',
      h1c: 'zihin ortağın',
      sub: 'Psikoloji, spiritüellik ve matematiksel karar modelleriyle — düşüncelerini netleştiriyoruz.',
      placeholder: 'Bugün ne hakkında düşünmek istiyorsunuz?',
      startBtn: 'Ücretsiz Dene',
      loginBtn: 'Giriş Yap',
      demoTitle: 'Canlı Önizleme',
      demoSub: 'The Architect bu şekilde yanıtlıyor',
      howTitle: 'Nasıl çalışır?',
      howSub: 'Üç katmanlı bir süreç',
      step1t: 'Psikolojik Analiz',
      step1d: '1-10 ölçekleri ve A/B sorularla iç durumunuz haritalanır. Her soru bir katman açar.',
      step2t: 'Spiritüel Perspektif',
      step2d: 'Jung\'dan Stoacılığa, Doğu felsefesinden nörobilime — durumunuzun derin kaynağına ulaşırız.',
      step3t: 'Karar Haritası',
      step3d: 'Toplanan veri matematiksel modellere dönüşür. Objektif, net, size özgü bir karar çerçevesi.',
      pricingTitle: 'Paketler',
      pricingSub: 'Her 1.000 kelimelik yanıt kredi kullanır. Krediler biter, yenisini alırsın.',
      buyBtn: 'Satın Al',
      footer: 'YCF Digital bünyesinde',
    },
    en: {
      badge: 'The Architect — Decision Specialist',
      h1a: "Your mind's",
      h1b: 'partner',
      h1c: 'for life\'s important decisions',
      sub: 'Psychology, spirituality and mathematical decision models — we clarify your thinking.',
      placeholder: 'What would you like to think about today?',
      startBtn: 'Try Free',
      loginBtn: 'Login',
      demoTitle: 'Live Preview',
      demoSub: 'This is how The Architect responds',
      howTitle: 'How it works',
      howSub: 'A three-layer process',
      step1t: 'Psychological Analysis',
      step1d: '1-10 scales and A/B questions map your inner state. Each question opens a new layer.',
      step2t: 'Spiritual Perspective',
      step2d: 'From Jung to Stoicism, Eastern philosophy to neuroscience — we reach the deep root.',
      step3t: 'Decision Map',
      step3d: 'Collected data transforms into mathematical models. Objective, clear, uniquely yours.',
      pricingTitle: 'Packages',
      pricingSub: 'Every 1,000-word response uses credits. When they run out, simply top up.',
      buyBtn: 'Purchase',
      footer: 'by YCF Digital',
    },
  }[lang]

  // Typewriter effect
  function startTyping(text: string) {
    if (typingRef.current) clearTimeout(typingRef.current)
    setDisplayed('')
    setIsTyping(true)
    let i = 0
    function type() {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
        typingRef.current = setTimeout(type, i < 3 ? 0 : 16)
      } else {
        setIsTyping(false)
      }
    }
    setTimeout(type, 600)
  }

  useEffect(() => {
    startTyping(demos[activeDemo].a)
  }, [activeDemo, lang])

  function renderAnswer(text: string) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('> ')) {
        return <blockquote key={i} className="prose-architect">{line.slice(2)}</blockquote>
      }
      if (line.startsWith('*(') && line.endsWith(')*')) {
        return <p key={i} style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: '0.88em', margin: '8px 0' }}>{line.slice(2, -2)}</p>
      }
      if (line === '') return <br key={i} />
      return <p key={i} style={{ marginBottom: '0.5em' }}>{line}</p>
    })
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(8,8,8,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--gold)' }}>
          Karar<span style={{ color: 'var(--white)' }}>Koçu</span>
          {/* PLACEHOLDER: Logo buraya gelecek */}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Lang toggle */}
          <button onClick={() => setLang(l => l === 'tr' ? 'en' : 'tr')} style={{
            background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem',
            transition: 'all .2s',
          }}>
            {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
          </button>
          <Link href="/login" style={{
            background: 'none', border: '1px solid var(--border)', color: 'var(--muted)',
            padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem',
            textDecoration: 'none', transition: 'all .2s',
          }}>{t.loginBtn}</Link>
          <Link href="#pricing" style={{
            background: 'var(--gold)', color: '#000', padding: '9px 20px', borderRadius: '8px',
            fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', transition: 'all .2s',
          }}>{t.startBtn}</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)',
          width: '700px', height: '500px', pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)',
        }} />

        {/* Badge */}
        <div className="animate-fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
          color: 'var(--gold)', padding: '6px 16px', borderRadius: '999px',
          fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase',
          marginBottom: '28px',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block', animation: 'pulse-gold 2s infinite' }} />
          {t.badge}
        </div>

        <h1 className="animate-fade-up" style={{
          fontFamily: 'Playfair Display, serif', fontWeight: 700,
          fontSize: 'clamp(2.2rem, 6vw, 4rem)', color: 'var(--white)',
          lineHeight: 1.15, maxWidth: '780px', marginBottom: '20px',
          animationDelay: '.1s',
        }}>
          {t.h1a} <em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>{t.h1b}</em><br />{t.h1c}
        </h1>

        <p className="animate-fade-up" style={{
          fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--muted)',
          maxWidth: '540px', marginBottom: '48px', fontWeight: 300, animationDelay: '.2s',
        }}>{t.sub}</p>

        {/* Search */}
        <div className="animate-fade-up" style={{ width: '100%', maxWidth: '660px', position: 'relative', animationDelay: '.3s' }}>
          <textarea
            value={heroInput}
            onChange={e => setHeroInput(e.target.value)}
            placeholder={t.placeholder}
            rows={2}
            style={{
              width: '100%', background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '18px', padding: '20px 70px 20px 24px', color: 'var(--white)',
              fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', fontWeight: 300,
              outline: 'none', resize: 'none', lineHeight: 1.5,
              transition: 'border-color .2s, box-shadow .2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--gold)'; e.target.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.1)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
          <Link href={heroInput ? `/chat?q=${encodeURIComponent(heroInput)}` : '/login'} style={{
            position: 'absolute', right: '14px', bottom: '14px',
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none',
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </Link>
        </div>

        {/* Category chips */}
        <div className="animate-fade-up" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '20px', animationDelay: '.4s' }}>
          {CATEGORIES_TR.map(cat => (
            <button key={cat.label} onClick={() => setHeroInput(lang === 'tr' ? cat.prompt : cat.prompt)} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              color: 'var(--muted)', padding: '8px 18px', borderRadius: '999px',
              fontSize: '0.84rem', cursor: 'pointer', transition: 'all .2s',
            }}
              onMouseEnter={e => { (e.target as any).style.borderColor = 'var(--gold)'; (e.target as any).style.color = 'var(--gold)' }}
              onMouseLeave={e => { (e.target as any).style.borderColor = 'var(--border)'; (e.target as any).style.color = 'var(--muted)' }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── DEMO ── */}
      <section id="demo" style={{ padding: '80px 24px', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', fontSize: '0.74rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px' }}>{t.demoTitle}</div>
        <h2 style={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', color: 'var(--white)', marginBottom: '8px' }}>{t.demoSub}</h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '40px', fontSize: '0.92rem' }}>
          {lang === 'tr' ? 'Hazırlanmış örnek sohbetler — gerçek yöntemimiz, gerçek tarz' : 'Curated example conversations — real method, real style'}
        </p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '4px', marginBottom: '24px', overflowX: 'auto' }}>
          {demos.map((d, i) => (
            <button key={i} onClick={() => setActiveDemo(i)} style={{
              flex: 1, padding: '9px 14px', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.82rem', whiteSpace: 'nowrap',
              background: activeDemo === i ? 'var(--gold-dim)' : 'none',
              color: activeDemo === i ? 'var(--gold)' : 'var(--muted)',
              border: activeDemo === i ? '1px solid var(--gold-border)' : '1px solid transparent',
              transition: 'all .2s',
            }}>{d.label}</button>
          ))}
        </div>

        {/* Chat window */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🏛</div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--white)' }}>The Architect</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--gold)' }}>● {lang === 'tr' ? 'Aktif — dinliyor' : 'Active — listening'}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px' }}>
              {['#ff5f57','#ffbe2e','#28ca41'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
            </div>
          </div>

          {/* Messages */}
          <div style={{ padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: '18px', minHeight: '380px' }}>
            {/* User */}
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'row-reverse' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--card2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0, alignSelf: 'flex-end' }}>👤</div>
              <div style={{ maxWidth: '76%', padding: '13px 16px', borderRadius: '14px 14px 4px 14px', background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.18)', color: 'var(--white)', fontSize: '0.91rem', lineHeight: 1.65 }}>
                {demos[activeDemo].q}
              </div>
            </div>

            {/* Architect */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0, alignSelf: 'flex-end' }}>🏛</div>
              <div style={{ maxWidth: '80%', padding: '13px 16px', borderRadius: '14px 14px 14px 4px', background: 'var(--card2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '0.91rem', lineHeight: 1.65 }} className="prose-architect">
                {renderAnswer(displayed)}
                {isTyping && <span className="typing-cursor" />}
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.76rem', color: '#444' }}>
          {lang === 'tr' ? 'Bu önizlemedir. Gerçek sohbetler The Architect tarafından üretilir.' : 'This is a preview. Real conversations are generated by The Architect.'}
        </p>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '80px 24px', background: 'var(--dark)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', fontSize: '0.74rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px' }}>{t.howTitle}</div>
          <h2 style={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', color: 'var(--white)', marginBottom: '8px' }}>{t.howSub}</h2>
          <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '48px', fontSize: '0.9rem' }}>
            {lang === 'tr' ? 'The Architect sizi dinlemez — sizi okur. Her yanıt bir sonraki katmanı açar.' : "The Architect doesn't listen to you — it reads you. Every response opens the next layer."}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2px' }}>
            {[
              { num: '01', t: t.step1t, d: t.step1d, icon: '🧠' },
              { num: '02', t: t.step2t, d: t.step2d, icon: '✦' },
              { num: '03', t: t.step3t, d: t.step3d, icon: '🗺' },
            ].map((step, i) => (
              <div key={i} style={{
                background: 'var(--card)', padding: '32px 24px',
                borderRadius: i === 0 ? '16px 0 0 16px' : i === 2 ? '0 16px 16px 0' : '0',
                transition: 'background .2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--card2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--card)')}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '14px' }}>{step.icon}</div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.2rem', color: 'rgba(201,168,76,0.15)', lineHeight: 1, marginBottom: '12px' }}>{step.num}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--white)', marginBottom: '8px' }}>{step.t}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65 }}>{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '80px 24px', maxWidth: '920px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', fontSize: '0.74rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px' }}>{t.pricingTitle}</div>
        <h2 style={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', color: 'var(--white)', marginBottom: '8px' }}>
          {lang === 'tr' ? 'Sana uygun paketi seç' : 'Choose your package'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: '16px', fontSize: '0.9rem' }}>{t.pricingSub}</p>
        {/* PLACEHOLDER note */}
        <div style={{ textAlign: 'center', background: 'rgba(201,168,76,0.05)', border: '1px dashed rgba(201,168,76,0.2)', borderRadius: '8px', padding: '8px 16px', marginBottom: '40px', fontSize: '0.76rem', color: 'rgba(201,168,76,0.5)' }}>
          ⚠ PLACEHOLDER — Fiyatlar ve WooCommerce linkleri sonradan güncellenecek
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {[
            { name: lang === 'tr' ? 'Başlangıç' : 'Starter', price: '99', credits: lang === 'tr' ? '150 kredi' : '150 credits', features: lang === 'tr' ? ['Tüm konularda destek', 'Sohbet geçmişi', 'Mobil erişim'] : ['Support on all topics', 'Chat history', 'Mobile access'], popular: false },
            { name: lang === 'tr' ? 'Profesyonel' : 'Professional', price: '249', credits: lang === 'tr' ? '500 kredi' : '500 credits', features: lang === 'tr' ? ['Tüm konularda destek', 'Sohbet geçmişi', 'Mobil erişim', 'Öncelikli yanıt'] : ['Support on all topics', 'Chat history', 'Mobile access', 'Priority responses'], popular: true },
            { name: lang === 'tr' ? 'Kurumsal' : 'Enterprise', price: '599', credits: lang === 'tr' ? '1500 kredi' : '1500 credits', features: lang === 'tr' ? ['Tüm konularda destek', 'Sohbet geçmişi', 'Mobil erişim', 'Öncelikli yanıt', 'Toplu alım avantajı'] : ['Support on all topics', 'Chat history', 'Mobile access', 'Priority responses', 'Bulk purchase advantage'], popular: false },
          ].map((pkg, i) => (
            <div key={i} style={{
              background: pkg.popular ? '#161410' : 'var(--card)',
              border: `1px solid ${pkg.popular ? 'var(--gold)' : 'var(--border)'}`,
              borderRadius: '16px', padding: '32px 26px', position: 'relative',
              transition: 'all .25s',
            }}
              onMouseEnter={e => { if (!pkg.popular) { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-4px)' } }}
              onMouseLeave={e => { if (!pkg.popular) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' } }}
            >
              {pkg.popular && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#000', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: '999px' }}>{lang === 'tr' ? 'En Çok Tercih' : 'Most Popular'}</div>}
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--gold)', marginBottom: '12px' }}>{pkg.name}</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.4rem', fontWeight: 700, color: 'var(--white)', lineHeight: 1 }}>
                <sup style={{ fontSize: '1.1rem', verticalAlign: 'top', marginTop: '8px' }}>₺</sup>{pkg.price}
              </div>
              <div style={{ fontSize: '0.83rem', color: 'var(--muted)', margin: '8px 0 24px' }}>{pkg.credits}</div>
              <ul style={{ listStyle: 'none', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pkg.features.map((f, j) => <li key={j} style={{ fontSize: '0.87rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: 'var(--gold)', fontWeight: 700 }}>✓</span>{f}</li>)}
              </ul>
              {/* PLACEHOLDER: WooCommerce URL buraya gelecek */}
              <button onClick={() => alert('WooCommerce linki yakında eklenecek!')} style={{
                width: '100%', padding: '13px', borderRadius: '10px', cursor: 'pointer',
                border: '1px solid var(--gold)', fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.9rem', fontWeight: 600, transition: 'all .2s',
                background: pkg.popular ? 'var(--gold)' : 'none',
                color: pkg.popular ? '#000' : 'var(--gold)',
              }}>{t.buyBtn} →</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '40px 24px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', color: 'var(--gold)', marginBottom: '8px' }}>
          KararKoçu {/* PLACEHOLDER: Logo */}
        </div>
        <p style={{ fontSize: '0.82rem', color: '#444' }}>
          {t.footer} <a href="https://ycfdigital.com" target="_blank" rel="noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none' }}>YCF Digital</a>
        </p>
        <p style={{ marginTop: '10px', fontSize: '0.78rem', color: '#333' }}>
          {/* PLACEHOLDER: Gizlilik politikası, kullanım koşulları, WhatsApp linkleri buraya */}
          <a href="#" style={{ color: '#555', textDecoration: 'none' }}>Gizlilik Politikası</a>
          {' · '}
          <a href="#" style={{ color: '#555', textDecoration: 'none' }}>Kullanım Koşulları</a>
          {' · '}
          <a href="mailto:info@ycfdigital.com" style={{ color: '#555', textDecoration: 'none' }}>İletişim</a>
        </p>
      </footer>
    </div>
  )
}

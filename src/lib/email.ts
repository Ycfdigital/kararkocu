// src/lib/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendPasswordSetupEmail(
  email: string,
  name: string,
  token: string,
  language: 'tr' | 'en' = 'tr'
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/set-password?token=${token}`

  const subjects = {
    tr: 'Karar Koçu — Hesabınız Hazır 🎯',
    en: 'The Architect — Your Account is Ready 🎯',
  }

  const bodies = {
    tr: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#0d0d0d;color:#d4cfc6;padding:40px;border-radius:16px;">
        <h1 style="font-size:1.6rem;color:#c9a84c;margin-bottom:8px;">Karar Koçu'na Hoş Geldiniz</h1>
        <p style="color:#888;margin-bottom:24px;">Merhaba ${name || 'değerli kullanıcı'},</p>
        <p>Satın alımınız onaylandı. Hesabınız oluşturuldu ve kredileriniz yüklendi.</p>
        <p>Aşağıdaki butona tıklayarak şifrenizi belirleyin ve The Architect ile tanışın:</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${url}" style="background:#c9a84c;color:#000;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem;">Şifremi Belirle →</a>
        </div>
        <p style="color:#555;font-size:0.82rem;">Bu link 24 saat geçerlidir. Sorun yaşarsanız info@ycfdigital.com adresine yazın.</p>
        <hr style="border-color:#2a2a2a;margin:24px 0;">
        <p style="color:#444;font-size:0.78rem;">YCF Digital · kararkocu.ycfdigital.com</p>
      </div>`,
    en: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#0d0d0d;color:#d4cfc6;padding:40px;border-radius:16px;">
        <h1 style="font-size:1.6rem;color:#c9a84c;margin-bottom:8px;">Welcome to The Architect</h1>
        <p style="color:#888;margin-bottom:24px;">Hello ${name || 'there'},</p>
        <p>Your purchase is confirmed. Your account has been created and credits loaded.</p>
        <p>Click below to set your password and begin your journey with The Architect:</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${url}" style="background:#c9a84c;color:#000;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:1rem;">Set My Password →</a>
        </div>
        <p style="color:#555;font-size:0.82rem;">This link expires in 24 hours. Issues? Email info@ycfdigital.com</p>
        <hr style="border-color:#2a2a2a;margin:24px 0;">
        <p style="color:#444;font-size:0.78rem;">YCF Digital · kararkocu.ycfdigital.com</p>
      </div>`,
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: subjects[language],
    html: bodies[language],
  })
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  language: 'tr' | 'en' = 'tr'
) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/set-password?token=${token}&reset=1`

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: language === 'tr' ? 'Karar Koçu — Şifre Sıfırlama' : 'The Architect — Password Reset',
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;background:#0d0d0d;color:#d4cfc6;padding:40px;border-radius:16px;">
        <h2 style="color:#c9a84c;">${language === 'tr' ? 'Şifre Sıfırlama' : 'Password Reset'}</h2>
        <p>${language === 'tr' ? 'Şifre sıfırlama isteği aldık.' : 'We received a password reset request.'}</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${url}" style="background:#c9a84c;color:#000;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;">${language === 'tr' ? 'Şifremi Sıfırla →' : 'Reset Password →'}</a>
        </div>
        <p style="color:#555;font-size:0.82rem;">${language === 'tr' ? 'Bu link 1 saat geçerlidir.' : 'This link expires in 1 hour.'}</p>
      </div>`,
  })
}

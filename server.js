import 'dotenv/config'
import express from 'express'
import nodemailer from 'nodemailer'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

// Serve static files from Vite build (both paths for Coolify compatibility)
app.use('/roi', express.static(join(__dirname, 'dist')))
app.use('/', express.static(join(__dirname, 'dist')))

// SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'sales@estatecrm.io',
    pass: process.env.SMTP_PASS,
  },
})

// Bitrix24 webhook (server-side for security)
const BITRIX_WEBHOOK = process.env.BITRIX_WEBHOOK || 'https://tracebs.bitrix24.ru/rest/2/7det75s26t8s9sz6/'

function buildEmailHtml({ name, company, email, phone, url }) {
  const fields = [
    { label: 'Имя', value: name },
    { label: 'Компания-застройщик', value: company },
    { label: 'Рабочая почта', value: `<a href="mailto:${email}" style="color: #d4762c; text-decoration: none;">${email}</a>` },
    { label: 'Телефон', value: phone },
    { label: 'URL', value: `<a href="${url}" style="color: #d4762c; text-decoration: none;">${url}</a>` },
  ]

  const rows = fields.map(({ label, value }) => `
    <tr>
      <td style="padding: 24px 40px 0;">
        <p style="margin: 0 0 8px; font-weight: 700; font-size: 15px; color: #1a1a1a;">${label}</p>
        <p style="margin: 0 0 24px; font-size: 15px; color: #333;">${value}</p>
        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0;" />
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f0f0; padding: 32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 4px;">
          ${rows}
          <tr>
            <td style="padding: 32px 40px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #999;">
                Отправлено с сайта <a href="https://estatecrm.io" style="color: #d4762c; text-decoration: none;">EstateCRM</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// API: create Bitrix24 lead + send email
const submitLeadHandler = async (req, res) => {
  const { name, company, email, phone } = req.body

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const pageUrl = req.headers.referer || 'https://promo.estatecrm.io/roi/'

  try {
    // Create Bitrix24 lead
    const bitrixResponse = await fetch(`${BITRIX_WEBHOOK}crm.lead.add.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          TITLE: `ROI CRM - ${company || name}`,
          NAME: name,
          COMPANY_TITLE: company,
          EMAIL: [{ VALUE: email, VALUE_TYPE: 'WORK' }],
          PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }],
          SOURCE_ID: 'WEB',
          COMMENTS: `Источник: Лендинг «ROI внедрения CRM»`,
        },
      }),
    })

    const bitrixData = await bitrixResponse.json()

    if (!bitrixData.result) {
      console.error('Bitrix24 error:', bitrixData)
      return res.status(502).json({ error: 'Bitrix24 lead creation failed' })
    }

    // Send email notification (non-blocking)
    transporter.sendMail({
      from: '"EstateCRM - Sales" <sales@estatecrm.io>',
      to: 'sales@estatecrm.io',
      subject: 'Новая заявка: Лендинг "ROI" - Форма "Расчёт ROI"',
      html: buildEmailHtml({ name, company, email, phone, url: pageUrl }),
    }).catch(err => console.error('Email send error:', err))

    res.json({ success: true, leadId: bitrixData.result })
  } catch (err) {
    console.error('Submit lead error:', err)
    res.status(500).json({ error: 'Failed to submit lead' })
  }
}

app.post('/api/submit-lead', submitLeadHandler)
app.post('/roi/api/submit-lead', submitLeadHandler)

// Healthcheck
const HEALTH_KEY = process.env.HEALTH_KEY || 'estatecrm-mon-2026'

const healthHandler = async (req, res) => {
  if (req.query.key !== HEALTH_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const status = { server: 'ok', smtp: 'ok', timestamp: new Date().toISOString() }
  try {
    await transporter.verify()
  } catch {
    status.smtp = 'error'
  }
  const httpCode = status.smtp === 'ok' ? 200 : 503
  res.status(httpCode).json(status)
}
app.get('/api/health', healthHandler)
app.get('/roi/api/health', healthHandler)

// SPA fallback
app.get('/roi/*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

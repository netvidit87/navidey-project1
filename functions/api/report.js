/**
 * POST /api/report
 * Terima laporan abuse → log + kirim ke Telegram Bot
 *
 * Setup (WAJIB):
 * 1. Buat bot di @BotFather → dapatkan BOT_TOKEN
 * 2. Chat dengan bot / start, lalu kirim pesan apa saja
 * 3. Dapatkan CHAT_ID:
 *    - Buka https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
 *    - Cari "chat":{"id": 123456789}
 * 4. Set di Cloudflare Pages → Settings → Environment variables:
 *    - TELEGRAM_BOT_TOKEN = 123456:ABC...
 *    - TELEGRAM_CHAT_ID   = 123456789  (bisa group id juga, biasanya negatif)
 */

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

async function sendToTelegram(env, report) {
  const token = env.TELEGRAM_BOT_TOKEN
  const chatId = env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.warn('[REPORT] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set')
    return { ok: false, reason: 'missing_env' }
  }

  const reasonLabel = {
    copyright: '©️ Copyright',
    illegal: '🚫 Illegal content',
    harassment: '⚠️ Harassment',
    other: '📝 Other',
  }[report.reason] || report.reason

  const lines = [
    `<b>🚨 New Abuse Report</b>`,
    ``,
    `<b>ID:</b> <code>${escapeHtml(report.id)}</code>`,
    `<b>Time:</b> ${escapeHtml(report.receivedAt)}`,
    ``,
    `<b>Video / URL:</b>`,
    `<code>${escapeHtml(report.url)}</code>`,
    ``,
    `<b>Reason:</b> ${escapeHtml(reasonLabel)}`,
  ]

  if (report.email) {
    lines.push(`<b>Email:</b> ${escapeHtml(report.email)}`)
  }

  if (report.details) {
    lines.push(``)
    lines.push(`<b>Details:</b>`)
    lines.push(escapeHtml(report.details))
  }

  lines.push(``)
  lines.push(`──────────────`)
  lines.push(`🌍 ${escapeHtml(report.country || '?')} · 🖥 ${escapeHtml((report.ip || '').slice(0, 20))}`)

  const text = lines.join('\n')

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok || !data.ok) {
    console.error('[REPORT] Telegram error:', data)
    return { ok: false, reason: data.description || 'telegram_failed' }
  }

  return { ok: true }
}

export async function onRequestPost({ request, env }) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let body = {}

    if (contentType.includes('application/json')) {
      body = await request.json()
    } else if (contentType.includes('form')) {
      const form = await request.formData()
      body = {
        url: form.get('url') || '',
        reason: form.get('reason') || '',
        email: form.get('email') || '',
        details: form.get('details') || '',
      }
    } else {
      try {
        body = await request.json()
      } catch {
        return Response.json({ error: 'Invalid body' }, { status: 400, headers: corsHeaders() })
      }
    }

    const url = String(body.url || '').trim().slice(0, 500)
    const reason = String(body.reason || '').trim().slice(0, 100)
    const email = String(body.email || '').trim().slice(0, 200)
    const details = String(body.details || '').trim().slice(0, 2000)

    if (!url) {
      return Response.json(
        { error: 'Video URL or ID is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (!reason) {
      return Response.json(
        { error: 'Reason is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const allowed = ['copyright', 'illegal', 'harassment', 'other']
    if (!allowed.includes(reason)) {
      return Response.json(
        { error: 'Invalid reason' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const report = {
      id: crypto.randomUUID(),
      receivedAt: new Date().toISOString(),
      url,
      reason,
      email: email || null,
      details: details || null,
      userAgent: request.headers.get('user-agent') || null,
      ip: request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || null,
      country: request.headers.get('cf-ipcountry') || null,
    }

    // Log ke Cloudflare
    console.log('[REPORT]', JSON.stringify(report))

    // Kirim ke Telegram (tidak blocking success response)
    let telegramStatus = { ok: false }
    try {
      telegramStatus = await sendToTelegram(env, report)
    } catch (e) {
      console.error('[REPORT] Telegram send failed:', e)
    }

    return Response.json(
      {
        ok: true,
        message: 'Report received. Thank you.',
        id: report.id,
        telegram: telegramStatus.ok,
      },
      { status: 200, headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[REPORT ERROR]', err)
    return Response.json(
      { error: 'Failed to process report' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

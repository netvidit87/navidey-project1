/**
 * Cloudflare Worker - Videy Upload Proxy + CDN Proxy
 *
 * Routes yang disarankan:
 *   POST /api/upload              → proxy ke https://videy.co/api/upload
 *   GET  /:id.mp4                 → proxy ke https://cdn.videy.co/:id.mp4
 *   GET  /cdn/:id.mp4             → sama
 *
 * Untuk subdomain cdn.xxx.pages.dev:
 *   Deploy worker ini ke route: cdn.navidey.pages.dev/*
 *   Lalu semua request GET /bs1c1rXf1.mp4 akan di-proxy ke cdn.videy.co
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // ===== UPLOAD PROXY =====
    if (url.pathname === '/api/upload' && request.method === 'POST') {
      try {
        const formData = await request.formData()
        const file = formData.get('file')

        if (!file) {
          return json({ error: 'No file' }, 400)
        }

        const upstreamForm = new FormData()
        upstreamForm.append('file', file, file.name || 'video.mp4')

        const upstream = await fetch('https://videy.co/api/upload', {
          method: 'POST',
          body: upstreamForm,
          headers: {
            Accept: 'application/json',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        })

        const data = await upstream.json()

        if (!upstream.ok || !data.id) {
          return json(
            { error: data.error || 'Upload failed', detail: data },
            upstream.status || 502
          )
        }

        const host = url.hostname
        let cdnBase = 'https://cdn.videy.co'
        if (host.endsWith('.pages.dev')) {
          cdnBase = `https://cdn.${host}`
        } else if (host && host !== 'localhost') {
          cdnBase = `https://cdn.${host}`
        }

        return json({
          id: data.id,
          url: `${cdnBase}/${data.id}.mp4`,
          page: `${url.origin}/v?id=${data.id}`,
        })
      } catch (err) {
        return json({ error: err.message || 'Proxy error' }, 502)
      }
    }

    // ===== VIDEO CDN PROXY =====
    // Cocok untuk:
    //   https://cdn.navidey.pages.dev/bs1c1rXf1.mp4
    //   https://cdn.navidey.pages.dev/cdn/bs1c1rXf1.mp4
    //   https://navidey.pages.dev/cdn/bs1c1rXf1.mp4
    const path = url.pathname.replace(/^\//, '')
    const match =
      path.match(/^cdn\/([a-zA-Z0-9_-]+)(?:\.mp4)?$/i) ||
      path.match(/^([a-zA-Z0-9_-]+)\.mp4$/i)

    if (match && request.method === 'GET') {
      const id = match[1]
      const upstreamUrl = `https://cdn.videy.co/${id}.mp4`

      const headers = new Headers()
      if (request.headers.get('Range')) {
        headers.set('Range', request.headers.get('Range'))
      }
      headers.set(
        'User-Agent',
        'Mozilla/5.0 (compatible; Navidey-CDN/1.0)'
      )

      const response = await fetch(upstreamUrl, {
        headers,
        cf: { cacheTtl: 86400, cacheEverything: true },
      })

      if (!response.ok && response.status !== 206) {
        return new Response(`Upstream ${response.status}`, {
          status: response.status,
        })
      }

      const newHeaders = new Headers()
      newHeaders.set('Content-Type', 'video/mp4')
      newHeaders.set('Accept-Ranges', 'bytes')
      newHeaders.set('Access-Control-Allow-Origin', '*')
      newHeaders.set('Cache-Control', 'public, max-age=86400')
      if (response.headers.get('Content-Length')) {
        newHeaders.set('Content-Length', response.headers.get('Content-Length'))
      }
      if (response.headers.get('Content-Range')) {
        newHeaders.set('Content-Range', response.headers.get('Content-Range'))
      }

      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      })
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Range',
        },
      })
    }

    return new Response('Not Found', { status: 404 })
  },
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

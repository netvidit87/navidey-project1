/**
 * POST /api/upload → proxy ke videy.co/api/upload
 * Turnstile hanya dipakai di halaman /v/, bukan di upload.
 */
export async function onRequestPost({ request }) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return Response.json({ error: 'No file' }, { status: 400 })
    }

    // batasi tipe
    if (file.type && !file.type.startsWith('video/')) {
      return Response.json({ error: 'Only video files allowed' }, { status: 400 })
    }

    // batasi ukuran ~200MB
    if (file.size && file.size > 200 * 1024 * 1024) {
      return Response.json({ error: 'File too large (max 200MB)' }, { status: 400 })
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

    const data = await upstream.json().catch(() => ({}))

    if (!upstream.ok || !data.id) {
      return Response.json(
        { error: data.error || 'Upload failed' },
        { status: upstream.status || 502 }
      )
    }

    // sanitize id
    const id = String(data.id).replace(/[^a-zA-Z0-9_-]/g, '')
    if (!id) {
      return Response.json({ error: 'Invalid response' }, { status: 502 })
    }

    // Bangun CDN URL berdasarkan host request
    const host = new URL(request.url).hostname
    let cdnBase = 'https://cdn.videy.co'
    if (host.endsWith('.pages.dev')) {
      cdnBase = `https://cdn.${host}`
    } else if (host && host !== 'localhost' && !host.startsWith('127.')) {
      cdnBase = `https://cdn.${host}`
    }

    return Response.json({
      id,
      url: `${cdnBase}/${id}.mp4`,
    })
  } catch (err) {
    return Response.json({ error: 'Proxy error' }, { status: 502 })
  }
}

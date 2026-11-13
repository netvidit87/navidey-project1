/**
 * Dynamic CDN berdasarkan domain Cloudflare saat ini.
 * Contoh:
 *   hostname = navidey.pages.dev
 *   → https://cdn.navidey.pages.dev/bs1c1rXf1.mp4
 *
 * Fallback ke cdn.videy.co kalau di localhost / domain non-pages.
 */
export function getCdnBase() {
  if (typeof window === 'undefined') {
    return 'https://cdn.videy.co'
  }

  const host = window.location.hostname

  // pages.dev → pakai subdomain cdn.
  if (host.endsWith('.pages.dev')) {
    return `https://cdn.${host}`
  }

  // custom domain (misal navidey.com) → cdn.navidey.com
  if (host && host !== 'localhost' && !host.startsWith('127.')) {
    return `https://cdn.${host}`
  }

  // local / fallback
  return 'https://cdn.videy.co'
}

export function getVideoUrl(id) {
  // hanya izinkan karakter aman (alphanumeric, dash, underscore)
  const safe = String(id || '').replace(/[^a-zA-Z0-9_-]/g, '')
  if (!safe) return ''
  return `${getCdnBase()}/${safe}.mp4`
}

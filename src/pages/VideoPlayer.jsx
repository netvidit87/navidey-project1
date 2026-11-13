import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { getVideoUrl } from '../config'

const TURNSTILE_SITE_KEY = '0x4AAAAAAF-N4cGvBQXckJzF'

// Simpan status verifikasi di localStorage agar user tidak perlu verifikasi terus-menerus
const VERIFY_STORAGE_KEY = 'navidey_turnstile_verified'
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000 // 24 jam

function isAlreadyVerified() {
  try {
    const raw = localStorage.getItem(VERIFY_STORAGE_KEY)
    if (!raw) return false
    const data = JSON.parse(raw)
    if (!data || !data.ts) return false
    return Date.now() - data.ts < VERIFY_TTL_MS
  } catch {
    return false
  }
}

function markVerified() {
  try {
    localStorage.setItem(
      VERIFY_STORAGE_KEY,
      JSON.stringify({ ts: Date.now() })
    )
  } catch {
    // ignore (private mode / quota)
  }
}

function clearVerified() {
  try {
    localStorage.removeItem(VERIFY_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export default function VideoPlayer() {
  const { id: paramId } = useParams()
  const [searchParams] = useSearchParams()
  const id = paramId || searchParams.get('id') || searchParams.get('v') || ''
  const videoSrc = getVideoUrl(id)

  const videoRef = useRef(null)
  const adContainerRef = useRef(null)
  const turnstileRef = useRef(null)
  const widgetIdRef = useRef(null)

  const [copied, setCopied] = useState(false)
  const [verified, setVerified] = useState(() => isAlreadyVerified())
  const [turnstileError, setTurnstileError] = useState('')

  const renderTurnstile = useCallback(() => {
    if (!window.turnstile || !turnstileRef.current) return

    if (widgetIdRef.current !== null) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch {}
      widgetIdRef.current = null
    }

    turnstileRef.current.innerHTML = ''
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'light',
      callback: () => {
        markVerified()
        setVerified(true)
        setTurnstileError('')
      },
      'expired-callback': () => {
        clearVerified()
        setVerified(false)
        setTurnstileError('Verification expired. Please try again.')
      },
      'error-callback': () => {
        setVerified(false)
        setTurnstileError('Verification failed. Please try again.')
      },
    })
  }, [])

  useEffect(() => {
    if (verified) return

    if (window.turnstile) {
      renderTurnstile()
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval)
          renderTurnstile()
        }
      }, 200)
      return () => clearInterval(interval)
    }

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {}
      }
    }
  }, [renderTurnstile, verified])

  // Load iklan hanya setelah verified
  useEffect(() => {
    if (!verified || !adContainerRef.current) return

    const getAdGroup = () => {
      try {
        let adGroup = localStorage.getItem('ad_group')
        if (!adGroup) {
          adGroup = String(Math.floor(Math.random() * 100) + 1)
          localStorage.setItem('ad_group', adGroup)
        }
        return parseInt(adGroup, 10)
      } catch {
        return Math.floor(Math.random() * 100) + 1
      }
    }

    const uploader = (() => {
      try {
        return localStorage.getItem('uploader') || 'false'
      } catch {
        return 'false'
      }
    })()

    const width = window.screen?.width || window.innerWidth || 360
    const adGroup = getAdGroup()
    const apiUrl = `/api/ad_type?uploader=${uploader}&width=${width}&ad_group=${adGroup}`

    const controller = new AbortController()

    fetch(apiUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then((r) => {
        if (!r.ok) throw new Error('ad api failed')
        return r.json()
      })
      .then((data) => {
        if (!adContainerRef.current || !data) return

        adContainerRef.current.innerHTML = ''

        const banner =
          data.banner_300x250 ||
          data['300x250'] ||
          data.code ||
          ''

        if (!banner) return

        const wrapper = document.createElement('div')
        wrapper.innerHTML = banner

        const scripts = Array.from(wrapper.querySelectorAll('script'))
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script')

          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value)
          })

          if (oldScript.src) {
            newScript.src = oldScript.src
            newScript.async = true
          } else {
            newScript.textContent = oldScript.textContent
          }

          oldScript.parentNode?.replaceChild(newScript, oldScript)
        })

        adContainerRef.current.appendChild(wrapper)
      })
      .catch(() => {
        // silent fail
      })

    return () => controller.abort()
  }, [id, verified])

  useEffect(() => {
    document.title = id ? `Navidey - ${id}` : 'Navidey'
  }, [id])

  useEffect(() => {
    if (!verified) return
    const v = videoRef.current
    if (!v || !videoSrc) return
    v.play()?.catch(() => {})
  }, [videoSrc, verified])

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Navidey', url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {}
  }

  // ===== Gate: tampilkan Turnstile dulu =====
  if (!verified) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <header className="pt-2.5 pb-2.5 shrink-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center">
                <span className="font-semibold text-[24px] tracking-[-1.5px] text-gray-900">
                  navidey
                </span>
              </Link>
              <Link
                to="/"
                className="flex items-center px-3.5 py-1.5 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors text-sm"
              >
                Upload
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-grow flex items-center justify-center px-4">
          <div className="text-center space-y-5 max-w-md w-full">
            <h1 className="text-xl font-semibold text-gray-900">
              Security Check
            </h1>
            <p className="text-gray-600 text-sm">
              Please complete the verification to continue watching.
            </p>

            <div className="flex justify-center">
              <div ref={turnstileRef} />
            </div>

            {turnstileError && (
              <p className="text-sm text-red-600">{turnstileError}</p>
            )}
          </div>
        </div>

        <footer className="pb-4 shrink-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-center space-x-6">
              <Link
                to="/terms-of-service"
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                to="/report"
                className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Report Abuse
              </Link>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // ===== Setelah verified: tampilkan video + iklan (layout ketat tanpa scroll berlebih) =====
  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header ringkas */}
      <header className="pt-2 pb-2 shrink-0">
        <div className="max-w-6xl mx-auto px-3 sm:px-5">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <span className="font-semibold text-[22px] tracking-[-1.5px] text-gray-900">
                navidey
              </span>
            </Link>
            <Link
              to="/"
              className="flex items-center px-3 py-1 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors text-[13px]"
            >
              Upload
            </Link>
          </div>
        </div>
      </header>

      {/* Konten utama — flex-grow agar muat di viewport */}
      <div className="flex-grow flex flex-col w-full max-w-[720px] mx-auto px-0 sm:px-3">
        {/* Video area */}
        <div className="w-full flex justify-center shrink-0">
          <div className="w-full">
            {videoSrc ? (
              <video
                ref={videoRef}
                key={videoSrc}
                className="w-full sm:rounded-[6px] bg-black"
                style={{
                  maxHeight: 'min(42vh, 380px)',
                  objectFit: 'contain',
                }}
                controls
                autoPlay
                playsInline
                src={videoSrc}
              />
            ) : (
              <div
                className="w-full bg-black sm:rounded-[6px] flex items-center justify-center text-white text-sm"
                style={{ aspectRatio: '16/9', maxHeight: 'min(42vh, 380px)' }}
              >
                Video not found
              </div>
            )}
          </div>
        </div>

        {/* Share button — sangat compact */}
        <div className="w-full flex justify-center mt-2.5 mb-1 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center text-[13px] transition-colors focus-visible:outline-none shadow-sm h-8 py-1.5 rounded-full px-4 gap-1.5 bg-gray-100 hover:bg-gray-200 font-semibold text-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            {copied ? 'Copied!' : 'Share video'}
          </button>
        </div>

        {/* Container iklan — centered, no extra margin, constrained */}
        <div
          ref={adContainerRef}
          className="as mt-2 flex flex-col items-center justify-center shrink-0 w-full overflow-hidden"
          style={{ minHeight: 0 }}
        />
      </div>

      {/* Footer super compact */}
      <footer className="pt-2 pb-3 shrink-0">
        <div className="max-w-6xl mx-auto px-3 sm:px-5">
          <div className="flex items-center justify-center space-x-5">
            <Link
              to="/terms-of-service"
              className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/report"
              className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Report Abuse
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

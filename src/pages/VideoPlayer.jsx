import { useParams, useSearchParams, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { getVideoUrl } from '../config'

export default function VideoPlayer() {
  const { id: paramId } = useParams()
  const [searchParams] = useSearchParams()
  const id = paramId || searchParams.get('id') || searchParams.get('v') || ''
  const videoSrc = getVideoUrl(id)

  const videoRef = useRef(null)
  const adContainerRef = useRef(null)

  const [copied, setCopied] = useState(false)

  // Load iklan
  useEffect(() => {
    if (!adContainerRef.current) return

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
  }, [id])

  useEffect(() => {
    document.title = id ? `Navidey - ${id}` : 'Navidey'
  }, [id])

  useEffect(() => {
    const v = videoRef.current
    if (!v || !videoSrc) return
    v.play()?.catch(() => {})
  }, [videoSrc])

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

      {/* Konten utama */}
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

        {/* Share button */}
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

        {/* Container iklan */}
        <div
          ref={adContainerRef}
          className="as mt-2 flex flex-col items-center justify-center shrink-0 w-full overflow-hidden"
          style={{ minHeight: 0 }}
        />
      </div>

      {/* Footer compact */}
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

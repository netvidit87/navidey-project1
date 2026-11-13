import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'

export default function Report() {
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ url: '', reason: '', email: '', details: '' })

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          url: form.url.trim(),
          reason: form.reason,
          email: form.email.trim(),
          details: form.details.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || `Submit failed (${res.status})`)
      }

      setDone(true)
    } catch (err) {
      setError(err.message || 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-grow max-w-xl w-full mx-auto px-5 sm:px-6 pt-6 pb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">Report Abuse</h1>
        <p className="text-gray-600 text-sm sm:text-base mb-6">
          Report content that violates our terms or the law.
        </p>

        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-800 font-medium">Thank you for your report.</p>
            <p className="text-green-700 text-sm mt-1">We will review it as soon as possible.</p>
            <Link
              to="/"
              className="inline-block mt-5 text-gray-900 font-medium hover:underline text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL or ID *
              </label>
              <input
                name="url"
                required
                value={form.url}
                onChange={onChange}
                disabled={loading}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-[15px] disabled:opacity-60"
                placeholder="Video ID or full URL"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <select
                name="reason"
                required
                value={form.reason}
                onChange={onChange}
                disabled={loading}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white text-[15px] disabled:opacity-60"
              >
                <option value="">Select a reason</option>
                <option value="copyright">Copyright</option>
                <option value="illegal">Illegal content</option>
                <option value="harassment">Harassment</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                disabled={loading}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-[15px] disabled:opacity-60"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea
                name="details"
                rows={3}
                value={form.details}
                onChange={onChange}
                disabled={loading}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none text-[15px] disabled:opacity-60"
                placeholder="Additional information (optional)"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-[15px]"
            >
              {loading ? 'Submitting…' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
